# Product Requirements Document (PRD): SwipeIQ (FlashDeck)

## 1. Executive Summary
SwipeIQ is a minimalist, mobile-first spaced-repetition flashcard engine. It leverages a "Tinder-style" swipe interface and AI-driven content generation to eliminate the friction of creating and managing study decks. The app focuses on micro-interactions, haptic feedback, and gamified loops to make learning technical concepts addictive.

## 2. Information Architecture (Screen Flow)
The app consists of exactly five primary screens, designed to keep navigation completely flat.

### 2.1. The Dashboard (Home)
- Hero Section: Displays the user's active streak (fire icon) and a daily progress ring (Cards Mastered vs. Cards Due Today).
- Deck List: A vertically scrollable list of active topics (e.g., "Git Basics," "React Hooks"). Each row displays a badge indicating the exact number of cards due today.
- Primary Action: A Floating Action Button (FAB) anchored at the bottom right to "Create New Deck."

### 2.2. AI Deck Generator (Modal)
- Input Area: A simple multi-line text input to paste raw text, a Wikipedia link, or a simple prompt (e.g., "Explain REST APIs").
- Loading State: A minimal, dark-mode pulsing skeleton UI while the backend LLM processes the text into a JSON array of 20 Question/Answer cards.

### 2.3. The Swipe Arena (Core Engine)
- Visuals: Distraction-free. The screen contains only the active card, centered.
- Interaction:
  - Tap: Flips the card to reveal the answer.
  - Swipe Right: Logs as a success (knew the answer).
  - Swipe Left: Logs as a failure (need to review again).
- Session Progress: A minimal progress bar across the very top edge of the screen indicating remaining cards in the current daily queue.

### 2.4. Post-Session Summary (The Hype Screen)
- Triggered immediately after clearing the daily queue for a deck.
- Displays accuracy percentage, cards mastered, and triggers the RGB-glow/haptic feedback for streak milestones.
- Shows the user's "Topic Rank" progression (e.g., leveling up from Iron to Bronze in "Data Structures").

### 2.5. Deck Management & Settings
- Export: A one-tap utility to export a mastered deck into a clean Markdown (.md) file.
- AI Persona Toggle: A switch between "Hype Mode" (encouraging) and "Roast Mode" (sarcastic/brutal).

## 3. Gamification & Engagement Mechanics
- Combo Streaks & Haptics: Every consecutive right-swipe increments a multiplier. At a 5-streak, trigger the device's native haptic API alongside a subtle visual pulse around the screen bezel.
- Weekly "Boss Fights": Every Sunday, the app aggregates the top 10% most "left-swiped" cards. The user plays a rapid-fire time trial, granted only 3 seconds per card.
- The "Roast vs. Hype" Coach: The backend LLM system prompt is dictated by a user setting. If the user fails an objectively easy card, the AI generates a personalized micro-notification (e.g., "My grandmother understands Git branch management better than you do.").
- Emergency Analogy Generator: A rescue mechanism. If a user swipes left on the same exact card 3 days in a row, the app intercepts the flow, queries the LLM, and rewrites the card into an unhinged, highly memorable "Explain Like I'm 5" analogy.

## 4. Spaced Repetition Engine (Mathematical Spec)
The app will implement the industry-standard SuperMemo-2 (SM-2) algorithm to calculate the optimal time to show a card again.
Every time a card is swiped, the user's action maps to a "Quality" score (q), where a Right Swipe maps to q=4 or q=5, and a Left Swipe maps to q<3.
The algorithm tracks three variables per card:
- n (Repetition count)
- I (Interval in days)
- EF (Easiness Factor, defaults to 2.5)

### The Logic:
If q >= 3 (Right Swipe / Success):
- If n=0, I=1
- If n=1, I=6
- If n>1, I=round(I * EF)
- n=n+1

If q < 3 (Left Swipe / Failure):
- n=0
- I=1

### Easiness Factor Update Formula:
Regardless of success or failure, the EF is updated using the following formula:
EF_new = EF_old + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
*(Constraint: If EF_new < 1.3, force EF=1.3 to prevent the interval from collapsing permanently).*

## 5. Core Data Schema
### User Table
- id (UUID, Primary Key)
- personaMode (Enum: 'HYPE' or 'ROAST')
- currentStreak (Integer, Consecutive days app was opened)

### Deck Table
- id (UUID, Primary Key)
- userId (UUID, Foreign Key)
- title (String, e.g., "React Hooks")
- topicRank (Integer, Experience points for this specific deck)

### Card Table
- id (UUID, Primary Key)
- deckId (UUID, Foreign Key)
- frontText (Text, The question/concept)
- backText (Text, The AI-generated answer)
- repetition (Integer, Maps to SM-2 n)
- interval (Integer, Maps to SM-2 I)
- eFactor (Float, Maps to SM-2 EF, Default: 2.5)
- failTracker (Integer, Tracks consecutive left-swipes for Analogy feature)
- nextReviewTimestamp (When the card is due next)

## 6. Edge Cases & Error Handling
- AI Hallucinations / Bad Data: Every card must have a small "Edit" pencil icon on the back so the user can manually correct formatting or text errors without leaving the study session.
- API Timeouts: If the LLM generation takes longer than 10 seconds, the UI must gracefully dismiss the loading modal, show a "Processing in background" toast, and notify the user when the deck is ready.
- Offline Mode Constraint: If the user loses connection mid-session, the app must continue allowing swipes. Swipe results (the SM-2 math) must cache locally via the state manager and execute a bulk-sync payload to the database the next time a network connection is detected.

## 7. Recommended Tech Stack for Vibe Coding
- Frontend: React Native (Expo)
- UI/Gestures: react-native-deck-swiper
- State Management: Zustand
- Backend / DB: Supabase
- LLM Provider: Groq (Llama 3) or Gemini Flash