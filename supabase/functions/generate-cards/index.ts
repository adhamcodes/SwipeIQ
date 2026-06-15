import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      throw new Error("Server Error: Missing Gemini API Key in the cloud vault.")
    }

    const prompt = `Create exactly 20 advanced flashcards about "${topic}". 
    Format the response as a strict JSON array of objects. 
    Each object must have exactly two keys: "question" (string) and "answer" (string). 
    Do not include any markdown, code blocks, or extra text. Just the raw JSON array.`;

    // THE FIX: Upgraded to Google's current active model (Gemini 3.5 Flash)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error?.message || "Google AI rejected the request.");
    }

    const rawText = data.candidates[0].content.parts[0].text;
    
    // Using standard quotes to safely strip JSON markdown
    const cleanJsonText = rawText.replaceAll("```json", "").replaceAll("```", "").trim();
    const flashcards = JSON.parse(cleanJsonText);

    return new Response(JSON.stringify(flashcards), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})