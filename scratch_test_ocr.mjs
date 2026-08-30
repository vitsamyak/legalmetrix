import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

async function run() {
  // 1. Sign in as test user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123'
  });
  
  if (authError) {
    console.log("Could not sign in:", authError.message);
    // Let's create a dummy inspection without auth if possible (RLS might block)
  }

  // Find an existing inspection from the DB
  const { data: insps, error: inspError } = await supabase.from('inspections').select('id, status').eq('status', 'Needs Review').limit(1);
  
  if (!insps || insps.length === 0) {
    console.log('No inspections found to test');
    return;
  }
  
  const inspId = insps[0].id;
  console.log(`Testing with inspection: ${inspId}`);

  // Call the edge function
  const functionUrl = `${url}/functions/v1/process-compliance`;
  console.log('Calling:', functionUrl);
  
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData?.session?.access_token || key}`
    },
    body: JSON.stringify({ inspection_id: inspId })
  });
  
  const responseText = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${responseText}`);
}
run();
