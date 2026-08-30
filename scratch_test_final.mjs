import { createClient } from '@supabase/supabase-js';
const url = "https://fusjnphiovlozjcsbixj.supabase.co";
const key = "sb_publishable_eGhYJ6vx7gv_Wa0l1O3o6A_45zAx4cy"; // anon key
const supabase = createClient(url, key);

async function runTest() {
  console.log("1. Authenticating...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'testinspector_1787903454466@legalmetrix.com',
    password: 'TestPassword123!'
  });
  
  if (authErr) {
    console.error("Auth Error:", authErr.message);
    return;
  }
  
  const token = authData.session.access_token;
  const user = authData.user;
  
  console.log("2. Creating inspection row...");
  const { data: insData, error: insErr } = await supabase
    .from('inspections')
    .insert({
      product_id: 'a619226f-2422-4c0b-a140-95f33d29df45', // Random product from previous test
      inspector_id: user.id,
      status: 'Needs Review',
      batch_lot_number: 'TEST-FINAL'
    })
    .select()
    .single();
    
  if (insErr) {
    console.error("Insert Error:", insErr);
    return;
  }
  
  const inspection_id = insData.id;
  console.log(`Created inspection: ${inspection_id}`);
  
  console.log("3. Uploading real image...");
  const fs = await import('fs');
  const buffer = fs.readFileSync('/Users/samyakvikasgedam/.gemini/antigravity-ide/brain/27368bad-cc86-43e6-bfb0-d39adf2bc508/product_label_test_1787951183836.jpg');
  
  const filePath = `${inspection_id}/final_test_${Date.now()}.jpg`;
  
  const { error: uploadErr } = await supabase.storage
    .from('evidence_images')
    .upload(filePath, buffer, {
      contentType: 'image/jpeg'
    });
    
  if (uploadErr) {
    console.error("Upload Error:", uploadErr);
    console.log("Evidence Upload: FAIL");
    return;
  }
  
  console.log("Evidence Upload: PASS");
  
  const { error: dbErr } = await supabase.from('inspection_evidence').insert({
    inspection_id: inspection_id,
    evidence_type: 'Front/Main',
    file_path: filePath,
    file_name: 'product_label_test.jpg',
    mime_type: 'image/jpeg',
    file_size: buffer.length
  });
  
  console.log("4. Invoking Edge Function...");
  try {
    const res = await fetch(`${url}/functions/v1/process-compliance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ inspection_id })
    });
    
    console.log(`HTTP Status: ${res.status}`);
    const resBody = await res.text();
    console.log(`Gemini/Function Response Body:`, resBody);
    
    console.log("5. Checking final database state...");
    const { data: finalIns } = await supabase.from('inspections').select('status, compliance_score, notes').eq('id', inspection_id).single();
    console.log("Final DB values for inspection:", finalIns);
    
    const { data: finalViols } = await supabase.from('violations').select('title, severity').eq('inspection_id', inspection_id);
    console.log(`Final DB violations count: ${finalViols.length}`);
    if (finalViols.length > 0) {
      console.log("Violations:", finalViols);
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

runTest();
