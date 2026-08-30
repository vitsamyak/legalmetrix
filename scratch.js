import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key) acc[key] = val.join('=').trim();
  return acc;
}, {});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking tables...");
  const rules = await supabase.from('legal_rules').select('count', { count: 'exact', head: true });
  console.log('legal_rules:', rules.error ? rules.error.message : rules.count);

  const reports = await supabase.from('reports').select('count', { count: 'exact', head: true });
  console.log('reports:', reports.error ? reports.error.message : reports.count);

  const inspections = await supabase.from('inspections').select('count', { count: 'exact', head: true });
  console.log('inspections:', inspections.error ? inspections.error.message : inspections.count);
}
check();
