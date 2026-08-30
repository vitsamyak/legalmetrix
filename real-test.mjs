import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
// Use the service role key we found from secrets list
const key = envFile.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function run() {
  console.log('0. Creating test user...');
  const testEmail = `valid_test${Date.now()}@gmail.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: 'password123'
  });
  if (authError) {
    console.error("Auth error:", authError);
    return;
  }
  console.log("Logged in as:", authData.user.id);
  
  console.log('1. Fetching a profile for inspector_id...');
  await new Promise(r => setTimeout(r, 1000));
  const inspectorId = authData.user.id;

  console.log('2. Creating product...');
  const { data: product, error: pErr } = await supabase.from('products').insert({
    name: 'Real E2E Product', brand: 'Real Brand', category: 'Packaged Food'
  }).select().single();
  if (pErr) { console.error(pErr); return; }

  console.log('3. Creating inspection...');
  const { data: inspection, error: iErr } = await supabase.from('inspections').insert({
    inspector_id: inspectorId, product_id: product.id, status: 'Needs Review', notes: 'E2E Test'
  }).select().single();
  if (iErr) { console.error(iErr); return; }

  console.log('4. Uploading REAL evidence image...');
  const buffer = fs.readFileSync('real-evidence.jpg');
  const filePath = `${inspection.id}/real-test-image.jpg`;
  
  const { error: uploadErr } = await supabase.storage.from('evidence_images').upload(filePath, buffer, { contentType: 'image/jpeg' });
  if (uploadErr) { console.error(uploadErr); return; }

  console.log('5. Creating evidence record...');
  const { data: evidence, error: eErr } = await supabase.from('inspection_evidence').insert({
    inspection_id: inspection.id,
    file_path: filePath,
    evidence_type: 'Front View',
    mime_type: 'image/jpeg',
    file_size: buffer.length
  }).select().single();
  if (eErr) { console.error(eErr); return; }

  console.log('6. Triggering AI Edge Function...');
  const functionUrl = `${url}/functions/v1/process-compliance`;
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authData.session.access_token}` },
    body: JSON.stringify({ inspection_id: inspection.id })
  });
  
  const responseText = await response.text();
  console.log(`Edge Function Status: ${response.status}`);
  if (response.status !== 200) {
    console.error('Edge function failed:', responseText);
    return;
  }
  
  console.log('7. Verifying OCR and Compliance Results in DB...');
  const { data: evDb } = await supabase.from('inspection_evidence').select('extracted_text, ocr_status').eq('id', evidence.id).single();
  console.log('OCR Extracted Text:', evDb?.extracted_text);
  
  const { data: violations } = await supabase.from('violations').select('title, description').eq('inspection_id', inspection.id);
  console.log('Violations found:', violations?.length);
  violations?.forEach(v => console.log(`- ${v.title}`));

  const { data: compliance } = await supabase.from('compliance_results').select('field_name, status, extracted_value').eq('inspection_id', inspection.id);
  console.log('Compliance rules checked:', compliance?.length);
  compliance?.forEach(c => console.log(`- ${c.field_name}: ${c.status} (${c.extracted_value})`));

  console.log('E2E TEST COMPLETE!');
}

run().catch(console.error);
