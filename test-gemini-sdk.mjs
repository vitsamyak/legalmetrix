import { GoogleGenerativeAI } from '@google/generative-ai';

const key = process.env.GEMINI_API_KEY || "YOUR_TEST_KEY_IF_NEEDED";
if (!process.env.GEMINI_API_KEY) {
  console.log("No GEMINI_API_KEY, skipping full test.");
  process.exit(0);
}

const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.2
  }
});

async function run() {
  const b64 = Buffer.from("dummy image").toString('base64');
  try {
    const res = await model.generateContent([
      "Analyze this and return valid JSON",
      {
        inlineData: {
          data: b64,
          mimeType: 'image/jpeg'
        }
      }
    ]);
    console.log("Success:", res.response.text());
  } catch(e) {
    console.error("Gemini Error:", e.message);
  }
}
run();
