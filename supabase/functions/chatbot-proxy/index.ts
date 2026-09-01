import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error("No GEMINI_API_KEY set in Edge Function secrets.");
    }

    const { message, history, currentPath } = await req.json();

    if (!message) {
      throw new Error("Message is required");
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const SYSTEM_PROMPT = `You are the LegalMetrix AI Assistant.
Your purpose is to help users navigate and understand the LegalMetrix platform.
The platform handles compliance for Legal Metrology, including inspections, products, rules, and reports.
Always be professional, concise, and helpful. 
You are currently helping a user on the website.
Do not use formatting that is too complex (like large tables) since you are in a small chat widget.
Rely on the context provided to answer questions effectively.`;

    // Construct history for Gemini SDK
    // Start with the system instruction and context
    let formattedHistory = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT + `\n\nThe user is currently on the path: ${currentPath}` }]
      },
      {
        role: 'model',
        parts: [{ text: 'Understood. I am the LegalMetrix AI Assistant and I am ready to help.' }]
      }
    ];

    // Append history provided by the client, if any
    if (history && Array.isArray(history)) {
      const additionalHistory = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      formattedHistory = [...formattedHistory, ...additionalHistory];
    }

    const chatSession = model.startChat({
      history: formattedHistory,
    });

    const result = await chatSession.sendMessage(message);
    const responseText = result.response.text();

    return new Response(
      JSON.stringify({ response: responseText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    console.error("Error in chatbot-proxy:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
