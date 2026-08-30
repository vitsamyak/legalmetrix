import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://fusjnphiovlozjcsbixj.supabase.co', 'sb_publishable_eGhYJ6vx7gv_Wa0l1O3o6A_45zAx4cy');

async function run() {
  const { data: allInspections, error } = await supabase
    .from('inspections')
    .select('*');
  
  if (error) {
    console.error("Error:", error);
    return;
  }
  
  console.log("All inspection IDs in DB:");
  allInspections.forEach(i => console.log(i.id));
  
  const inspections = allInspections.filter(i => i.id.startsWith('45d2a588'));
  
  if (inspections.length === 0) {
    console.log("No inspection found starting with 45d2a588");
    return;
  }
  
  const ins = inspections[0];
  console.log("Inspection:", ins);
  
  const { data: evidence } = await supabase
    .from('inspection_evidence')
    .select('*')
    .eq('inspection_id', ins.id);
    
  console.log("Evidence records:", evidence.length);
  evidence.forEach(e => {
    console.log(`- ${e.id}: ${e.file_name} | status: ${e.ocr_status} | Extracted Text length: ${e.extracted_text ? e.extracted_text.length : 0}`);
  });
}

run();
