import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper for structured JSON error responses
const jsonError = (message: string, status: number, details?: any) => {
  return new Response(
    JSON.stringify({ error: message, details }), 
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
  );
};

// Generic retry wrapper with exponential backoff for transient errors (e.g. 503)
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, baseDelayMs = 1000): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      const isTransient = error.status === 503 || error.status === 429 || error.message?.includes('503') || error.message?.includes('fetch failed');
      if (!isTransient || attempt > maxRetries) {
        throw error;
      }
      console.warn(`[RETRY] Transient error encountered (attempt ${attempt}/${maxRetries}). Retrying in ${baseDelayMs * Math.pow(2, attempt - 1)}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt - 1)));
    }
  }
}

function encodeHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let execution_id = crypto.randomUUID();

  try {
    const body = await req.json().catch(() => ({}));
    const { inspection_id } = body;
    if (!inspection_id) return jsonError('Missing inspection_id', 400);

    console.log(`[START] inspection_id: ${inspection_id}, execution_id: ${execution_id}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) return jsonError('Server Configuration Error', 500);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonError('Missing Authorization header', 401);
    
    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) return jsonError('Unauthorized: Invalid token', 401);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: inspection, error: inspectionError } = await supabaseAdmin
      .from('inspections')
      .select('*, products(*)')
      .eq('id', inspection_id)
      .eq('inspector_id', user.id)
      .single();

    if (inspectionError || !inspection) return jsonError('Inspection not found', 404);

    const { data: evidenceList, error: evidenceError } = await supabaseAdmin
      .from('inspection_evidence')
      .select('*')
      .eq('inspection_id', inspection_id)
      .order('id', { ascending: true }); // Ensure deterministic order

    if (evidenceError || !evidenceList || evidenceList.length === 0) {
      return jsonError('No evidence found', 404);
    }

    const imageUrls: { url: string, evidenceId: string }[] = [];
    for (const ev of evidenceList) {
      const { data, error } = await supabaseAdmin.storage
        .from('evidence_images')
        .createSignedUrl(ev.file_path, 3600);
      if (data) imageUrls.push({ url: data.signedUrl, evidenceId: ev.id });
    }

    if (imageUrls.length === 0) return jsonError('Failed to access images', 500);

    const base64Images: any[] = [];
    const evidenceMapping: { evidenceId: string, index: number }[] = [];
    
    // Download and hash together for fingerprint
    let combinedHashStr = "";
    
    for (let i = 0; i < imageUrls.length; i++) {
      const { url, evidenceId } = imageUrls[i];
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64 = encodeBase64(uint8Array);
        
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        base64Images.push({
          inlineData: {
            data: base64,
            mimeType: contentType
          }
        });
        evidenceMapping.push({ evidenceId, index: i });
        combinedHashStr += `|img_${i}:${base64.substring(0, 200)}|`; // Partial hash string for speed, or full
      } catch (imgError) {
        console.error("Image dl error", imgError);
      }
    }

    if (base64Images.length === 0) return jsonError('Failed to process images', 500);

    // Compute evidence fingerprint deterministically
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(combinedHashStr));
    const evidence_fingerprint = encodeHex(hashBuffer);
    console.log(`[FINGERPRINT] Calculated: ${evidence_fingerprint}`);

    // Check if we already have a valid analysis for this EXACT evidence fingerprint (from any inspection)
    const { data: existingValidInspections } = await supabaseAdmin
      .from('inspections')
      .select('id, status, compliance_score, notes')
      .eq('evidence_fingerprint', evidence_fingerprint)
      .neq('status', 'Needs Review')
      .not('compliance_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingValidInspections && existingValidInspections.length > 0) {
      const cacheRef = existingValidInspections[0];
      console.log(`[DETERMINISM] Found previously valid analysis for fingerprint: ${evidence_fingerprint} from inspection ${cacheRef.id}. Reusing results to guarantee determinism.`);
      
      // If it's a different inspection, we need to copy violations over. If it's the SAME inspection, just return success!
      if (cacheRef.id !== inspection_id) {
        // We are copying from another inspection to this new one
        await supabaseAdmin.from('inspections').update({
          compliance_score: cacheRef.compliance_score,
          status: cacheRef.status,
          notes: cacheRef.notes,
          evidence_fingerprint: evidence_fingerprint
        }).eq('id', inspection_id);
        
        // Copy violations
        const { data: cacheV } = await supabaseAdmin.from('violations').select('*').eq('inspection_id', cacheRef.id);
        if (cacheV && cacheV.length > 0) {
           const vToInsert = cacheV.map(v => {
             const { id, created_at, inspection_id: _, ...rest } = v;
             return { inspection_id, ...rest };
           });
           await supabaseAdmin.from('violations').insert(vToInsert);
        }
        
        // Copy OCR status and text to the new inspection's evidence
        const { data: cacheEv } = await supabaseAdmin.from('inspection_evidence').select('ocr_status, extracted_text').eq('inspection_id', cacheRef.id).limit(1);
        if (cacheEv && cacheEv.length > 0) {
           await supabaseAdmin.from('inspection_evidence').update({
             ocr_status: cacheEv[0].ocr_status,
             extracted_text: cacheEv[0].extracted_text
           }).eq('inspection_id', inspection_id);
        }
      }
      
      return new Response(JSON.stringify({ success: true, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Idempotency / Deduplication: delete existing results for this inspection to start clean
    await supabaseAdmin.from('violations').delete().eq('inspection_id', inspection_id);
    await supabaseAdmin.from('compliance_results').delete().eq('inspection_id', inspection_id);

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite", // or gemini-3.1-pro if available, but preserving existing config if working
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0,
        candidateCount: 1,
      }
    });

    // ==========================================
    // STAGE 1: OCR Extraction
    // ==========================================
    console.log(`[OCR] Starting Stage 1 Extraction for ${base64Images.length} images...`);
    
    // Mark evidence as PROCESSING
    await supabaseAdmin
      .from('inspection_evidence')
      .update({ ocr_status: 'processing' })
      .eq('inspection_id', inspection_id);
    const ocrPrompt = `You are a highly accurate OCR system. 
Extract observable facts from the provided images of product packaging. Treat all images as a single evidence set for one product.
Return ONLY structured JSON exactly matching this schema:
{
  "product_name": "string or null",
  "brand": "string or null",
  "manufacturer": "string or null",
  "manufacturer_address": "string or null",
  "net_quantity": "string or null",
  "mrp": "string or null",
  "batch_number": "string or null",
  "date_of_manufacture": "string or null",
  "expiry_date": "string or null",
  "country_of_origin": "string or null",
  "fssai_number": "string or null",
  "other_visible_declarations": ["string"],
  "uncertain_fields": ["string"],
  "source_images": { "field_name": [0, 1] }
}
If a field cannot be reliably read, return null. NEVER invent or infer text that is not visible.`;

    let stage1Json;
    try {
      const ocrResult = await withRetry(async () => {
        return await model.generateContent([ocrPrompt, ...base64Images]);
      }, 2, 2000);
      const aiText = ocrResult.response?.text() || "{}";
      stage1Json = JSON.parse(aiText);
      console.log(`[OCR] Extracted data successfully.`);
      
      // Mark evidence as COMPLETED and save the exact same JSON text used for compliance
      await supabaseAdmin
        .from('inspection_evidence')
        .update({ 
          ocr_status: 'completed',
          extracted_text: JSON.stringify(stage1Json, null, 2)
        })
        .eq('inspection_id', inspection_id);
        
    } catch (ocrError: any) {
      console.error("[OCR] Failed to extract text:", ocrError.message);
      
      // Mark evidence as FAILED
      await supabaseAdmin
        .from('inspection_evidence')
        .update({ 
          ocr_status: 'failed',
          extracted_text: `Error extracting text: ${ocrError.message}`
        })
        .eq('inspection_id', inspection_id);
        
      return jsonError('OCR processing failed', 502, ocrError.message);
    }

    // ==========================================
    // STAGE 2: Compliance Verification
    // ==========================================
    console.log(`[VERIFY] Starting Stage 2 Compliance...`);
    const { data: legalRules } = await supabaseAdmin.from('legal_rules').select('*');
    const rulesList = (legalRules || [])
      .map((r: any) => `- UUID: ${r.id} | [${r.rule_reference}] ${r.requirement_description}`)
      .join('\n');

    const systemPrompt = `You are a Legal Metrology Compliance Expert AI.
Analyze the structured OCR evidence for compliance against the active Legal Metrology rules.

Raw OCR Evidence:
${JSON.stringify(stage1Json, null, 2)}

Active Rules:
${rulesList}

Return strictly in JSON matching the exact schema below:
{
  "status": "Compliant" | "Non-Compliant" | "Needs Review",
  "compliance_score": 0 to 100,
  "summary": "Brief overall compliance summary",
  "violations": [
    {
      "rule_id": "UUID from rules list",
      "title": "Violation title containing rule reference",
      "severity": "Low" | "Medium" | "High",
      "evidence": "What was observed",
      "ai_confidence": 0 to 100
    }
  ],
  "uncertain_items": ["string"]
}
`;

    let stage2Json;
    try {
      const result = await withRetry(async () => {
        return await model.generateContent([systemPrompt]);
      }, 2, 2000);
      const text = result.response?.text() || "{}";
      stage2Json = JSON.parse(text);
    } catch (err: any) {
      console.error("[VERIFY] Failed:", err.message);
      return jsonError('Compliance processing failed', 502, err.message);
    }

    // Validation & Updates
    const numViolations = Array.isArray(stage2Json.violations) ? stage2Json.violations.length : 0;
    const score = Number(stage2Json.compliance_score);
    let status = stage2Json.status;
    if (!['Compliant', 'Needs Review', 'Non-Compliant'].includes(status)) status = 'Needs Review';
    if (numViolations > 0 && status === 'Compliant') status = 'Non-Compliant';

    // Update inspection
    const { error: updateError } = await supabaseAdmin
      .from('inspections')
      .update({
        compliance_score: isNaN(score) ? null : score,
        status: status,
        notes: String(stage2Json.summary || "").substring(0, 2000),
        evidence_fingerprint: evidence_fingerprint
      })
      .eq('id', inspection_id);

    if (updateError) {
      console.error("[DB_UPDATE] Error:", updateError);
      return jsonError('Failed to update inspection', 500);
    }

    // Insert Violations (using the proper schema logic)
    if (numViolations > 0) {
      console.log(`[VIOLATIONS] Inserting ${numViolations} violations`);
      const violationsToInsert = stage2Json.violations.map((v: any) => ({
        inspection_id: inspection_id,
        rule_id: v.rule_id || (legalRules && legalRules.length > 0 ? legalRules[0].id : null),
        title: String(v.title || 'Unknown Violation').substring(0, 255),
        ai_analysis: String(v.evidence || '').substring(0, 2000),
        detected_text: String(v.evidence || 'No evidence provided.').substring(0, 1000),
        severity: ['Low', 'Medium', 'High'].includes(v.severity) ? v.severity : 'Medium',
        ai_confidence: Math.min(100, Math.max(0, Number(v.ai_confidence) || 0)),
        detection_type: 'Auto-Flagged',
        verification_status: 'Pending'
      }));

      const { error: vError } = await supabaseAdmin
        .from('violations')
        .insert(violationsToInsert);

      if (vError) {
        console.error("[VIOLATIONS] DB Insert Error:", vError);
        return jsonError('Database error on violations', 500, vError);
      }
    }

    console.log(`[DONE] Success. Returning exact deterministic JSON.`);
    return new Response(JSON.stringify({ success: true, result: stage2Json }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error(`[FATAL]`, error);
    return jsonError(error.message, 500);
  }
});
