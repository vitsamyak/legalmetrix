import { createClient } from '@supabase/supabase-js';
const url = "https://fusjnphiovlozjcsbixj.supabase.co";
const key = "sb_publishable_eGhYJ6vx7gv_Wa0l1O3o6A_45zAx4cy";
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('inspections').select('compliance_score').limit(1);
  console.log("compliance_score type:", typeof data[0].compliance_score);
}
check();
