import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8'); // Wait, Gemini API key is in supabase backend.
