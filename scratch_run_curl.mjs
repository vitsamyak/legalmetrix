import { createClient } from '@supabase/supabase-js';
const url = "https://fusjnphiovlozjcsbixj.supabase.co";
const anonKey = "sb_publishable_eGhYJ6vx7gv_Wa0l1O3o6A_45zAx4cy";
const supabase = createClient(url, anonKey);

async function runTest() {
  console.log("1. Authenticating...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'testinspector_1787903454466@legalmetrix.com',
    password: 'TestPassword123!'
  });
  
  const token = authData.session.access_token;
  const user = authData.user;
  
  // Find an existing inspection for this user that has evidence images
  const { data: inspections } = await supabase.from('inspections').select('id, compliance_score, status').eq('inspector_id', user.id).limit(10);
  let targetId = null;
  for (const ins of inspections) {
    const { data: ev } = await supabase.from('inspection_evidence').select('*').eq('inspection_id', ins.id);
    if (ev && ev.length > 0) {
      targetId = ins.id;
      break;
    }
  }
  
  if (!targetId) {
    console.log("No inspection found with evidence images. Run a New Inspection from the UI first.");
    return;
  }
  
  console.log("Found existing inspection:", targetId);
  
  console.log("Invoking edge function on it...");
  const res = await fetch(`${url}/functions/v1/process-compliance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ inspection_id: targetId })
  });
  
  console.log(`HTTP Status: ${res.status}`);
  const resBody = await res.text();
  console.log(`Gemini/Function Response Body:`, resBody);
  
  console.log("5. Checking final database state...");
  const { data: finalIns } = await supabase.from('inspections').select('status, compliance_score, notes').eq('id', targetId).single();
  console.log("Final DB values for inspection:", finalIns);
}
runTest();
