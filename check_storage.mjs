import { createClient } from '@supabase/supabase-js';

const url = 'https://fusjnphiovlozjcsbixj.supabase.co';
const key = 'ee3980f3ab21bfed64acaf79a95669995b6c93a5d6d50d20cc04debc12d202a6';
const supabase = createClient(url, key);

async function checkStorage() {
  const { data: buckets } = await supabase.storage.listBuckets();
  console.log("Buckets:", buckets?.map(b => b.name));

  const { data: files } = await supabase.storage.from('evidence_images').list('', { limit: 10, search: '' });
  
  if (files?.length === 0) {
    const { data: folders } = await supabase.storage.from('evidence_images').list('', { limit: 10 });
    for (const f of folders || []) {
      if (!f.id) {
         console.log("Folder:", f.name);
         const { data: innerFiles } = await supabase.storage.from('evidence_images').list(f.name, { limit: 2 });
         console.log("  Inner files:", innerFiles?.map(i => i.name));
      } else {
         console.log("File:", f.name);
      }
    }
  } else {
    console.log("Files:", files?.map(f => f.name));
  }
}

checkStorage();
