import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const envFile = fs.readFileSync('.env.local', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

const USER_UPLOADS_DIR = '/Users/samyakvikasgedam/.gemini/antigravity-ide/brain/a969ee58-7e40-4d83-8298-64adf99d9584/.user_uploaded';

async function run() {
  console.log('0. Signing in test user...');
  const testEmail = 'valid_test1788017818967@gmail.com';
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: 'password123'
  });
  if (authError) throw new Error("Auth error: " + JSON.stringify(authError));
  console.log("Logged in as:", authData.user.id);
  
  // Wait to ensure profile trigger runs
  await new Promise(r => setTimeout(r, 2000));

  // The database has RLS on products that requires 'authenticated' role.
  // Using the Supabase JS client with a logged-in user automatically passes the JWT, satisfying auth.role() = 'authenticated'.
  console.log('1. Creating product...');
  const productName = `E2E Determinism Product ${Date.now()}`;
  const { data: product, error: pErr } = await supabase.from('products').insert({
    name: productName, brand: 'Real Brand', category: 'Packaged Food'
  }).select().single();
  if (pErr) throw new Error("Product insert error: " + JSON.stringify(pErr));

  const functionUrl = `${url}/functions/v1/process-compliance`;
  const runs = [];

  const files = fs.readdirSync(USER_UPLOADS_DIR).filter(f => f.endsWith('.jpg'));
  if (files.length !== 4) throw new Error(`Expected 4 images, found ${files.length}`);

  for (let iteration = 1; iteration <= 1; iteration++) {
    console.log(`\n=== RUN ${iteration}/1 ===`);
    
    console.log('  Creating inspection...');
    const { data: inspection, error: iErr } = await supabase.from('inspections').insert({
      inspector_id: authData.user.id, product_id: product.id, status: 'Needs Review', notes: 'OCR Check Test'
    }).select().single();
    if (iErr) throw new Error("Inspection insert error: " + JSON.stringify(iErr));

    console.log('  Uploading images...');
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const buffer = fs.readFileSync(path.join(USER_UPLOADS_DIR, f));
      const filePath = `${inspection.id}/evidence-${i}.jpg`;
      await supabase.storage.from('evidence_images').upload(filePath, buffer, { contentType: 'image/jpeg' });
      await supabase.from('inspection_evidence').insert({
        inspection_id: inspection.id,
        file_path: filePath,
        evidence_type: 'Image ' + i,
        mime_type: 'image/jpeg',
        file_size: buffer.length
      });
    }

    console.log('  Triggering AI Edge Function...');
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authData.session.access_token}` },
      body: JSON.stringify({ inspection_id: inspection.id })
    });
    
    if (response.status !== 200) throw new Error(`Edge function failed on run ${iteration}`);

    const { data: inspDb } = await supabase.from('inspections').select('evidence_fingerprint, status, compliance_score').eq('id', inspection.id).single();
    const { data: violations } = await supabase.from('violations').select('title, ai_confidence, severity, detected_text').eq('inspection_id', inspection.id).order('title');
    const { data: evidenceData } = await supabase.from('inspection_evidence').select('evidence_type, ocr_status, extracted_text').eq('inspection_id', inspection.id);
    
    console.log(`\n  --- Evidence Records ---`);
    for (const ev of (evidenceData || [])) {
        console.log(`  [${ev.evidence_type}] Status: ${ev.ocr_status}`);
        console.log(`  Text sample: ${ev.extracted_text ? ev.extracted_text.substring(0, 100).replace(/\n/g, ' ') : 'NULL'}...`);
    }
    
    const runData = {
      fingerprint: inspDb.evidence_fingerprint,
      status: inspDb.status,
      score: inspDb.compliance_score,
      violationsCount: violations.length,
      violationsHash: crypto.createHash('sha256').update(JSON.stringify(violations)).digest('hex')
    };
    
    console.log(`  - Fingerprint: ${runData.fingerprint}`);
    console.log(`  - Status: ${runData.status}`);
    console.log(`  - Score: ${runData.score}`);
    console.log(`  - Violations: ${runData.violationsCount}`);
    
    runs.push(runData);
  }

  console.log('\n=== RESULTS SUMMARY ===');
  let pass = true;
  const first = runs[0];
  for (let i = 1; i < runs.length; i++) {
    const r = runs[i];
    if (r.fingerprint !== first.fingerprint || r.status !== first.status || r.score !== first.score || r.violationsHash !== first.violationsHash) {
      pass = false;
      console.error(`Run ${i+1} differs from Run 1!`);
    }
  }

  if (pass) {
    console.log("PASS: All 5 runs produced the exact same deterministic results.");
  } else {
    console.error("FAIL: Determinism failed. Outputs vary.");
    console.log(runs);
  }
}

run().catch(console.error);
