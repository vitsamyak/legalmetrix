import { GoogleGenerativeAI } from '@google/generative-ai';

// Replace with a valid API key from your environment to test locally
// Let's see if the user's .env.local has GEMINI_API_KEY
import fs from 'fs';
const envFile = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
const apiKeyMatch = envFile.match(/GEMINI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.log("No GEMINI_API_KEY found to test locally.");
  process.exit(0);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
  try {
    const result = await model.generateContent(["Hello, how are you?"]);
    console.log(result.response.text());
  } catch (err) {
    console.error("Gemini Error:", err);
  }
}
run();
