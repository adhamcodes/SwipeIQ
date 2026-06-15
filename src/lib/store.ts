import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// How many card swipes complete the Daily Bounty (and its one-time XP reward).
const DAILY_BOUNTY_TARGET = 20;
const DAILY_BOUNTY_XP = 50;

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  repetition: number;
  interval: number;
  eFactor: number;
  // When this card is next due for review (ms epoch). Optional for older cards.
  nextReviewTimestamp?: number;
}

// The slice of state that gets backed up to the cloud (no functions / no transient UI).
export interface SyncableState {
  savedDecks: Deck[];
  streak: number;
  lastStudyDate: string;
  xp: number;
  accentColor: string;
  isRoastMode: boolean;
  isHapticsEnabled: boolean;
  isAudioEnabled: boolean;
  isDarkMode: boolean;
  isRemindersEnabled: boolean;
  dailySwipes: number;
  lastSwipeDate: string;
  bountyClaimedDate: string;
}

export interface Deck {
  id: string;
  title: string;
  cards: Flashcard[];
  createdAt: number;
}

// A single card that is due for review, with enough info to write the result back.
export interface DueCard {
  deckId: string;
  deckTitle: string;
  cardIndex: number;
  card: Flashcard;
}

interface AppState {
  // Memory
  savedDecks: Deck[];
  addDeck: (deck: Deck) => void;
  deleteDeck: (id: string) => void;
  updateDeck: (deck: Deck) => void;
  wipeVault: () => void;
  // Cloud sync helpers
  applyCloudState: (incoming: Partial<SyncableState>) => void;
  resetLocal: () => void;
  
  // Progression
  streak: number;
  lastStudyDate: string;
  xp: number;
  addXP: (amount: number) => void;
  recordStudyCompletion: () => void;
  refreshStreak: () => void;
  
  // Settings
  accentColor: string;
  isRoastMode: boolean;
  isHapticsEnabled: boolean;
  isAudioEnabled: boolean;
  isDarkMode: boolean;
  isRemindersEnabled: boolean;
  setSetting: (key: keyof AppState, value: any) => void;

  // NEW: Dashboard Intelligence
  dailySwipes: number;
  lastSwipeDate: string;
  bountyClaimedDate: string;
  incrementDailySwipes: () => void;
  getPriorityDeck: () => Deck | undefined;
  getDueCards: () => DueCard[];
  getDueCount: () => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      savedDecks: [],
      addDeck: (deck) => set((state) => ({ savedDecks: [deck, ...state.savedDecks] })),
      deleteDeck: (id) => set((state) => ({ savedDecks: state.savedDecks.filter(d => d.id !== id) })),
      updateDeck: (updatedDeck) => set((state) => ({
        savedDecks: state.savedDecks.map(d => d.id === updatedDeck.id ? updatedDeck : d)
      })),
      wipeVault: () => set({ savedDecks: [], xp: 0, streak: 0 }),

      // Overwrite local data with a backup pulled from the cloud.
      applyCloudState: (incoming) => set((state) => ({ ...state, ...incoming })),

      // Clear this device's data (used on sign-out so the next person can't see it).
      resetLocal: () => set({ savedDecks: [], xp: 0, streak: 0, lastStudyDate: '', dailySwipes: 0, bountyClaimedDate: '' }),

      
      streak: 0,
      lastStudyDate: '',
      xp: 0,
      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),

      // Count one study day. Called ONCE when a session is completed.
      // - Same day again: no change (can't farm streak by repeating decks).
      // - Yesterday was the last study day: streak grows by 1.
      // - Otherwise (gap, or first ever): streak resets to 1.
      recordStudyCompletion: () => set((state) => {
        const todayStr = new Date().toDateString();
        if (state.lastStudyDate === todayStr) return {} as any;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        const newStreak = state.lastStudyDate === yesterdayStr ? state.streak + 1 : 1;
        return { streak: newStreak, lastStudyDate: todayStr };
      }),

      // On app open: if the user missed a day, the streak is broken -> show 0.
      refreshStreak: () => set((state) => {
        if (!state.lastStudyDate) return {} as any;
        const todayStr = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        if (state.lastStudyDate === todayStr || state.lastStudyDate === yesterdayStr) return {} as any;
        return { streak: 0 };
      }),
      
      accentColor: '#00E5FF',
      isRoastMode: false,
      isHapticsEnabled: true,
      isAudioEnabled: true,
      isDarkMode: true,
      isRemindersEnabled: true,
      setSetting: (key, value) => set({ [key]: value }),

      // NEW: Dashboard Intelligence Implementation
      dailySwipes: 0,
      lastSwipeDate: new Date().toDateString(),
      bountyClaimedDate: '',

      incrementDailySwipes: () => set((state) => {
        const today = new Date().toDateString();
        const newDay = state.lastSwipeDate !== today;
        const dailySwipes = newDay ? 1 : state.dailySwipes + 1;
        // On a new day, the bounty becomes claimable again.
        let bountyClaimedDate = newDay ? '' : state.bountyClaimedDate;
        let xp = state.xp;
        // Award the Daily Bounty XP exactly once, the moment the target is hit.
        if (dailySwipes >= DAILY_BOUNTY_TARGET && bountyClaimedDate !== today) {
          xp += DAILY_BOUNTY_XP;
          bountyClaimedDate = today;
        }
        return { dailySwipes, lastSwipeDate: today, bountyClaimedDate, xp };
      }),

      getPriorityDeck: () => {
        const decks = get().savedDecks;
        if (decks.length === 0) return undefined;

        const now = Date.now();
        const dueCount = (deck: Deck) =>
          deck.cards.filter(c => c.nextReviewTimestamp == null || c.nextReviewTimestamp <= now).length;

        // Prefer the deck with the most cards due right now; fall back to first deck.
        return decks.reduce((best, current) =>
          dueCount(current) > dueCount(best) ? current : best
        );
      },

      // Flatten every card that is due for review across all decks.
      getDueCards: () => {
        const now = Date.now();
        const due: DueCard[] = [];
        get().savedDecks.forEach((deck) => {
          deck.cards.forEach((card, cardIndex) => {
            if (card.nextReviewTimestamp == null || card.nextReviewTimestamp <= now) {
              due.push({ deckId: deck.id, deckTitle: deck.title, cardIndex, card });
            }
          });
        });
        return due;
      },

      getDueCount: () => get().getDueCards().length,
    }),
    {
      name: 'swipe-iq-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// THE CREAMY COLOR TRANSLATOR
export const getThemeColors = (isDarkMode: boolean, accentHex: string) => {
  let activeAccent = accentHex;
  
  if (!isDarkMode) {
    if (accentHex === '#00E5FF') activeAccent = '#0284C7'; // Neon Cyan -> Ocean Blue
    if (accentHex === '#32CD32') activeAccent = '#059669'; // Neon Green -> Sage/Emerald
    if (accentHex === '#FF0055') activeAccent = '#E11D48'; // Neon Pink -> Soft Rose
  }

  return {
    bg: isDarkMode ? '#0D0D12' : '#FDFBF7', 
    card: isDarkMode ? '#16161E' : '#FFFFFF', 
    text: isDarkMode ? '#FFF' : '#1E1E24', 
    subText: isDarkMode ? '#888' : '#71717A', 
    border: isDarkMode ? '#2A2A35' : '#E5E5E0',
    danger: isDarkMode ? '#FF4500' : '#DC2626',
    dangerBg: isDarkMode ? 'rgba(255, 69, 0, 0.1)' : 'rgba(220, 38, 38, 0.1)',
    accent: activeAccent,
    invertText: isDarkMode ? '#0D0D12' : '#FFFFFF',
  };
};