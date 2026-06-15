import { supabase } from './supabase';

export async function generateFlashcards(topic: string) {
  try {
    console.log(`[Frontend] Requesting flashcards for: ${topic}`);
    
    const { data, error } = await supabase.functions.invoke('generate-cards', {
      body: { topic }
    });

    // 1. THE ERROR UNMASKER
    // If the server fails, we force it to reveal the actual hidden message
    if (error) {
      let realError = error.message;
      if (error.context) {
         try {
           const contextData = await error.context.json();
           if (contextData && contextData.error) {
             realError = contextData.error;
           }
         } catch (e) {
           // Ignore parsing errors if the body isn't JSON
         }
      }
      console.log("🚨 TRUE SERVER ERROR:", realError);
      throw new Error(`Server says: ${realError}`);
    }

    if (!data) {
      throw new Error("Empty response from secure server");
    }

    // 2. THE DATA FIX
    // Safely handle the data whether the server sends an array directly or wraps it in an object
    const cardsArray = Array.isArray(data) ? data : data.cards;

    if (!cardsArray || !Array.isArray(cardsArray)) {
      console.log("Malformed Data Received:", data);
      throw new Error("Server didn't return a valid array of cards.");
    }

    // Format the cards to match our local store schema (with a unique id each).
    const now = Date.now();
    const formattedCards = cardsArray.map((card: any, index: number) => ({
      id: `${now}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      question: card.question,
      answer: card.answer,
      repetition: 0,
      interval: 1,
      eFactor: 2.5,
    }));

    return formattedCards;

  } catch (error) {
    console.error("Secure AI Generation Failed:", error);
    throw error;
  }
}

// --- TEMPORARY LOCAL FALLBACKS ---
export async function generateCoachMessage(concept: string, mode: 'HYPE' | 'ROAST') {
  if (mode === 'HYPE') {
    return `Come on! You'll master ${concept || 'this'} next time! Let's go!`;
  }
  return `Really? You forgot ${concept || 'that'}? My grandma knows that.`;
}

export async function generateAnalogy(concept: string) {
  return `Think of ${concept || 'this'} like a foundational building block. Keep practicing!`;
}