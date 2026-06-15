export interface Flashcard {
  id: string;
  frontText: string;
  backText: string;
  repetition: number;
  interval: number;
  eFactor: number;
  failTracker: number;
  nextReviewTimestamp: number;
  
  // 👇 NEW: Phase 2 Engagement Fields
  lifetimeLeftSwipes: number; 
  lastReviewedAt: number | null; 
}

export interface Deck {
  id: number;
  title: string;
  cards: Flashcard[];
  topicRank: number; // 👇 NEW: The XP system
  created_at?: string;
}

// 👇 NEW: User Profile types
export interface UserProfile {
  id: string;
  personaMode: 'HYPE' | 'ROAST';
  currentStreak: number;
  lastBossFightCompletedDate: number | null;
}