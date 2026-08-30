import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fusjnphiovlozjcsbixj.supabase.co';
const supabaseKey = 'sb_publishable_eGhYJ6vx7gv_Wa0l1O3o6A_45zAx4cy';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log("--- Starting Authentication Flow Test ---");

  // 1. Invalid Login Test
  console.log("\n[1] Testing Invalid Login...");
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'test-invalid@example.com',
    password: 'wrongpassword123'
  });

  if (loginError) {
    console.log("Login Error (Expected):", loginError.message);
  } else {
    console.log("Login Succeeded! (Unexpected)");
  }

  // 2. Signup Test
  console.log("\n[2] Testing Signup with new email...");
  const testEmail = `test-supabase-signup${Date.now()}@gmail.com`;
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testEmail,
    password: 'StrongPassword123!'
  });

  if (signupError) {
    console.log("Signup Error:", signupError.message);
  } else {
    console.log("Signup Succeeded!");
    console.log("User ID:", signupData.user?.id);
    console.log("Session:", signupData.session ? "Active" : "None (Requires email verification)");
  }

  console.log("\n--- Tests Completed ---");
}

runTests();
