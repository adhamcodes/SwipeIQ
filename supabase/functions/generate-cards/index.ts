import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Allow the app (and the web build) to talk to this function.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// The free, capable model. Swap to "gemini-2.5-flash-lite" for higher daily limits.
const MODEL = "gemini-2.5-flash"
const MAX_TOPIC_LENGTH = 120
const ALLOWED_DIFFICULTIES = ["Beginner", "Intermediate", "Expert"]
const MIN_CARDS = 1
const MAX_CARDS = 50
const DEFAULT_CARDS = 20

// Small helper so every error reply looks the same and is easy to read.
function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  })
}

serve(async (req) => {
  // Browsers send a pre-flight "OPTIONS" request first; answer it politely.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return jsonError("Method not allowed.", 405)
  }

  try {
    // 1. SECURITY: require a signed-in user (defense in depth, even if the
    //    platform-level JWT check is on). No account = no AI.
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return jsonError("You must be signed in to generate cards.", 401)
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return jsonError("Your session is invalid. Please sign in again.", 401)
    }

    // 2. VALIDATE INPUT: make sure the topic is a sensible, non-huge string,
    //    and read the requested card count + difficulty (with safe defaults).
    const body = await req.json().catch(() => null)
    const topic = typeof body?.topic === "string" ? body.topic.trim() : ""

    if (!topic) {
      return jsonError("Please provide a topic.", 400)
    }
    if (topic.length > MAX_TOPIC_LENGTH) {
      return jsonError(`Topic is too long (max ${MAX_TOPIC_LENGTH} characters).`, 400)
    }

    // How many cards to make (clamped to a safe range).
    let count = Number(body?.count)
    if (!Number.isFinite(count)) count = DEFAULT_CARDS
    count = Math.min(MAX_CARDS, Math.max(MIN_CARDS, Math.round(count)))

    // Difficulty level (only allow known values).
    const requestedDifficulty = typeof body?.difficulty === "string" ? body.difficulty : ""
    const difficulty = ALLOWED_DIFFICULTIES.includes(requestedDifficulty)
      ? requestedDifficulty
      : "Intermediate"

    // 3. Make sure the server has its AI key.
    const apiKey = Deno.env.get("GEMINI_API_KEY")
    if (!apiKey) {
      return jsonError("Server is missing its AI key. Please contact support.", 500)
    }

    // 4. Ask Gemini for strict JSON flashcards.
    const prompt =
      `Create exactly ${count} ${difficulty}-level flashcards about "${topic}". ` +
      `Return ONLY a JSON array of ${count} objects. ` +
      `Each object must have exactly two string keys: "question" and "answer". ` +
      `Keep each question and answer concise and accurate. ` +
      `Do not include markdown, code fences, or any text outside the JSON array.`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      },
    )

    const data = await geminiRes.json()

    if (!geminiRes.ok) {
      console.error("Gemini API error:", JSON.stringify(data))
      return jsonError(data?.error?.message || "The AI service rejected the request.", 502)
    }

    // 5. SAFELY pull the text out (won't crash if the answer is empty/blocked).
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) {
      const blockReason = data?.promptFeedback?.blockReason
      return jsonError(
        blockReason
          ? `That topic was blocked by the AI safety filter. Please try a different topic.`
          : "The AI returned an empty response. Please try again.",
        502,
      )
    }

    // 6. Clean and parse the JSON safely.
    const cleaned = rawText.replaceAll("```json", "").replaceAll("```", "").trim()
    let parsed: unknown
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      console.error("Failed to parse AI output:", cleaned.slice(0, 500))
      return jsonError("The AI returned an unreadable response. Please try again.", 502)
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return jsonError("The AI did not return any cards. Please try again.", 502)
    }

    // 7. Keep only well-formed cards.
    const safeCards = parsed
      .filter((c: any) => c && typeof c.question === "string" && typeof c.answer === "string")
      .map((c: any) => ({ question: c.question.trim(), answer: c.answer.trim() }))

    if (safeCards.length === 0) {
      return jsonError("The AI response was malformed. Please try again.", 502)
    }

    // 8. Success: return the cards wrapped in an object.
    return new Response(JSON.stringify({ cards: safeCards }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Unexpected error in generate-cards:", error)
    return jsonError("Something went wrong on the server. Please try again.", 500)
  }
})
