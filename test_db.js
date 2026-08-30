import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: reports } = await supabase.from('reports').select('*');
  console.log('Reports count:', reports?.length || 0);
  
  const { data: rules } = await supabase.from('legal_rules').select('*');
  console.log('Rules count:', rules?.length || 0);
}
check();
