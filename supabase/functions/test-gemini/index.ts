import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

serve(async (req) => {
  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) throw new Error("No GEMINI_API_KEY");
    
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    
    const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    
    const result = await model.generateContent([
      "Describe this image",
      { inlineData: { data: base64, mimeType: "image/png" } }
    ]);
    
    return new Response(JSON.stringify({ success: true, text: result.response.text() }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 500 });
  }
});
