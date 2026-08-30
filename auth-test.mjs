import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

async function run() {
  console.log("Signing in with fetch...");
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: 'valid_test1788017818967@gmail.com', password: 'password123' })
  });
  const data = await res.json();
  console.log(data);
  process.exit(0);
}
run();
