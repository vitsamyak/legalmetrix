import { createClient } from '@supabase/supabase-js';

const url = "https://fusjnphiovlozjcsbixj.supabase.co";
const key = "sb_publishable_eGhYJ6vx7gv_Wa0l1O3o6A_45zAx4cy";
const supabase = createClient(url, key);

async function runTest() {
  const email = `testinspector_${Date.now()}@legalmetrix.com`;
  const password = "TestPassword123!";
  
  console.log("1. Signing up test user:", email);
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) throw new Error("Auth failed: " + authError.message);
  
  // Wait a second for trigger/profile
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("2. Creating test product");
  const { data: prod, error: prodErr } = await supabase.from('products').insert({
    name: "Test Flow Product",
    brand: "Test Flow Brand",
    category: "Packaged Food"
  }).select().single();
  
  let prodId;
  if (prodErr) {
    if (prodErr.code === '23505') { // Unique constraint
       const { data: extProd } = await supabase.from('products').select().eq('name', "Test Flow Product").single();
       prodId = extProd.id;
    } else {
      throw new Error("Product failed: " + prodErr.message);
    }
  } else {
    prodId = prod.id;
  }
  
  console.log("3. Creating test inspection");
  const { data: insp, error: inspErr } = await supabase.from('inspections').insert({
    inspector_id: authData.user.id,
    product_id: prodId,
    status: 'Needs Review',
    location_zone: "Test Zone"
  }).select().single();
  if (inspErr) throw new Error("Inspection failed: " + inspErr.message);
  
  console.log("4. Uploading dummy evidence");
  const filePath = `${insp.id}/dummy.jpg`;
  const dummyFile = new Blob(["test"], { type: 'image/jpeg' });
  const { error: uploadErr } = await supabase.storage.from('evidence_images').upload(filePath, dummyFile);
  if (uploadErr) throw new Error("Upload failed: " + uploadErr.message);
  
  const { error: evErr } = await supabase.from('inspection_evidence').insert({
    inspection_id: insp.id,
    evidence_type: 'Front View',
    file_path: filePath,
    file_name: 'dummy.jpg',
    mime_type: 'image/jpeg',
    file_size: 4
  });
  if (evErr) throw new Error("Evidence DB failed: " + evErr.message);
  
  console.log("5. Invoking Edge Function...");
  
  const { data: fnData, error: fnError } = await supabase.functions.invoke('process-compliance', {
    body: { inspection_id: insp.id }
  });
  
  if (fnError) {
    console.error("Function HTTP Error! Status code might be non-2xx");
    console.error("Details:", fnError);
    process.exit(1);
  } else {
    console.log("SUCCESS! Function returned HTTP 200.");
    console.log("Response Body:", JSON.stringify(fnData, null, 2));
    process.exit(0);
  }
}

runTest().catch(console.error);
