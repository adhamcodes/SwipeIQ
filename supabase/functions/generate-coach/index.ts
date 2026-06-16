import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// Match generate-cards: the high-throughput free model (best free-tier limits).
const MODEL = "gemini-2.5-flash-lite"

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  })
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return jsonError("Method not allowed.", 405)

  try {
    // Require a signed-in user.
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) return jsonError("You must be signed in.", 401)

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return jsonError("Your session is invalid. Please sign in again.", 401)

    const body = await req.json().catch(() => null)
    const mode = body?.mode === "ROAST" ? "ROAST" : "HYPE"

    const apiKey = Deno.env.get("GEMINI_API_KEY")
    if (!apiKey) return jsonError("Server is missing its AI key.", 500)

    const tone = mode === "ROAST"
      ? "sarcastic, witty, playfully teasing (like a cheeky gym coach). Light and funny — NEVER cruel, hateful, profane, or targeting any person or group."
      : "high-energy, positive, encouraging and hype (like an excited cheerleader-coach)."

    const prompt =
      `Write 10 short coach one-liners for a flashcard study app. ` +
      `Tone: ${tone} ` +
      `Each line must be under 90 characters, motivate the user to study/keep their streak, and may use at most one emoji. ` +
      `Return ONLY a JSON array of 10 strings. No markdown, no extra text.`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 1.0, responseMimeType: "application/json" },
        }),
      },
    )

    const data = await geminiRes.json()
    if (!geminiRes.ok) {
      console.error("Gemini API error:", JSON.stringify(data))
      // Same calm handling as generate-cards: never leak Google's raw billing/quota text.
      if (geminiRes.status === 429 || data?.error?.status === "RESOURCE_EXHAUSTED") {
        return jsonError("Coach is taking a quick breather. Try again in a moment. 🌬️", 429)
      }
      return jsonError("The AI had a hiccup. Please try again in a moment.", 502)
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) return jsonError("The AI returned an empty response.", 502)

    const cleaned = rawText.replaceAll("```json", "").replaceAll("```", "").trim()
    let parsed: unknown
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return jsonError("The AI returned an unreadable response.", 502)
    }

    if (!Array.isArray(parsed)) return jsonError("The AI did not return a list.", 502)
    const lines = parsed.filter((l: any) => typeof l === "string" && l.trim()).map((l: string) => l.trim()).slice(0, 12)
    if (!lines.length) return jsonError("No usable lines returned.", 502)

    return new Response(JSON.stringify({ lines }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Unexpected error in generate-coach:", error)
    return jsonError("Something went wrong on the server.", 500)
  }
})
