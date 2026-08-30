import { createClient } from '@supabase/supabase-js';
const url = "https://fusjnphiovlozjcsbixj.supabase.co";
const anonKey = "sb_publishable_eGhYJ6vx7gv_Wa0l1O3o6A_45zAx4cy";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY; 
// Wait, I don't have the service key in the environment locally without reading .env!
