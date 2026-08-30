import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
// Use the service role key we found from secrets list
const serviceKey = "ee3980f3ab21bfed64acaf79a95669995b6c93a5d6d50d20cc04debc12d202a6";

const supabase = createClient(url, serviceKey);

async function run() {
  console.log('1. Fetching a profile for inspector_id...');
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
  const inspectorId = profiles?.[0]?.id;
  if (!inspectorId) {
    console.error('No profiles found in DB to attach inspection to.');
    return;
  }

  console.log('2. Creating product...');
  const { data: product, error: pErr } = await supabase.from('products').insert({
    name: 'Test E2E Product', brand: 'Test Brand', category: 'Packaged Food'
  }).select().single();
  if (pErr) throw pErr;

  console.log('3. Creating inspection...');
  const { data: inspection, error: iErr } = await supabase.from('inspections').insert({
    inspector_id: inspectorId, product_id: product.id, status: 'Needs Review', notes: 'E2E Test'
  }).select().single();
  if (iErr) throw iErr;

  console.log('4. Uploading dummy evidence image...');
  // 1x1 png base64
  const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const buffer = Buffer.from(base64Data, 'base64');
  const filePath = `${inspection.id}/test-image.png`;
  
  const { error: uploadErr } = await supabase.storage.from('evidence_images').upload(filePath, buffer, { contentType: 'image/png' });
  if (uploadErr) throw uploadErr;

  console.log('5. Creating evidence record...');
  const { data: evidence, error: eErr } = await supabase.from('evidence').insert({
    inspection_id: inspection.id,
    image_url: 'dummy',
    file_path: filePath,
    view_type: 'Front View'
  }).select().single();
  if (eErr) throw eErr;

  console.log('6. Triggering AI Edge Function...');
  const functionUrl = `${url}/functions/v1/process-compliance`;
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` },
    body: JSON.stringify({ inspection_id: inspection.id })
  });
  
  const responseText = await response.text();
  console.log(`Edge Function Status: ${response.status}`);
  if (response.status !== 200) {
    console.error('Edge function failed:', responseText);
    return;
  }
  
  console.log('7. Verifying OCR and Compliance Results in DB...');
  const { data: evDb } = await supabase.from('evidence').select('extracted_text, ocr_status').eq('id', evidence.id).single();
  console.log('OCR Extracted Text:', evDb?.extracted_text);
  
  const { data: violations } = await supabase.from('violations').select('title, description').eq('inspection_id', inspection.id);
  console.log('Violations found:', violations?.length);
  violations?.forEach(v => console.log(`- ${v.title}`));

  console.log('E2E TEST COMPLETE!');
}

run().catch(console.error);
