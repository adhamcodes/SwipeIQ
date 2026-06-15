import { supabase } from './supabase';

export async function getRecentDecks() {
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching decks:', error);
    return [];
  }
  return data || [];
}

export async function saveDeck(title: string, rawCards: any[]) {
  const cardsWithSchema = rawCards.map(card => ({
    ...card,
    repetition: 0,
    interval: 0,
    eFactor: 2.5,
    failTracker: 0,
    nextReviewTimestamp: Date.now(),
    lifetimeLeftSwipes: 0, 
    lastReviewedAt: null   
  }));

  const { data, error } = await supabase
    .from('decks')
    .insert([{ title, cards: cardsWithSchema, topicRank: 0 }])
    .select();

  if (error) {
    console.error('Database Save Error:', error);
    throw error;
  }
  return data;
}

export async function updateCardProgress(deckId: number, cardIndex: number, updatedCard: any) {
  const { data: deck, error: fetchError } = await supabase
    .from('decks')
    .select('cards')
    .eq('id', deckId)
    .single();

  if (fetchError || !deck) return;

  const updatedCardsArray = [...deck.cards];
  updatedCardsArray[cardIndex] = updatedCard;

  await supabase.from('decks').update({ cards: updatedCardsArray }).eq('id', deckId);
}

export async function updateDeckRank(deckId: number, newRank: number) {
  await supabase.from('decks').update({ topicRank: newRank }).eq('id', deckId);
}

export async function updateUserProfile(updates: any) {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return;
  
  await supabase.from('users').upsert({ id: session.session.user.id, ...updates });
}

// 👇 NEW: Cloud Delete
export async function deleteDeckCloud(deckId: number) {
  const { error } = await supabase.from('decks').delete().eq('id', deckId);
  if (error) console.error("Error deleting deck:", error);
}

// 👇 NEW: Cloud Rename
export async function renameDeckCloud(deckId: number, newTitle: string) {
  const { error } = await supabase.from('decks').update({ title: newTitle }).eq('id', deckId);
  if (error) console.error("Error renaming deck:", error);
}