import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const email = `test${Date.now()}@gmail.com`;
  console.log("Signing up:", email);
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: 'password123!!',
    options: {
      data: {
        full_name: 'Test Agent',
        region: 'Test Zone'
      }
    }
  });
  if (error) {
    console.error("SignUp Error:", error.message);
  } else {
    console.log("Session:", data.session ? "Active (Email Confirmation OFF)" : "Null (Email Confirmation ON)");
  }
}
test();
