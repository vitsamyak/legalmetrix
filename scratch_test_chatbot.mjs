import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = envFile.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Invoking chatbot-proxy...");
  const { data, error } = await supabase.functions.invoke('chatbot-proxy', {
    body: {
      message: "What can I do on this website?",
      history: [],
      currentPath: "/"
    }
  });

  if (error) {
    console.error("Supabase Error:", error);
    // If it's a FunctionsHttpError, it might have a context
    if (error.context) {
      console.error("Context:", await error.context.text());
    }
  } else {
    console.log("Response:", data);
  }
}

test();
