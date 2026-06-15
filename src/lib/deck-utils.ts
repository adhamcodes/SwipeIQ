import { Deck, Flashcard } from './store';

// Generate a stable unique id for a card or deck.
export function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Build a fresh flashcard with default spaced-repetition values.
export function makeCard(question: string, answer: string): Flashcard {
  return {
    id: makeId(),
    question: question.trim(),
    answer: answer.trim(),
    repetition: 0,
    interval: 1,
    eFactor: 2.5,
  };
}

// Build a fresh deck from simple question/answer pairs.
export function makeDeck(title: string, pairs: { question: string; answer: string }[]): Deck {
  return {
    id: makeId(),
    title: title.trim(),
    cards: pairs.map((p) => makeCard(p.question, p.answer)),
    createdAt: Date.now(),
  };
}

// XP awarded for a correct (right) swipe in normal study.
// Based on how many times the card has ALREADY been mastered:
//   1st correct (rep 0) = 5 XP, 2nd (rep 1) = 3, 3rd (rep 2) = 2, then 1.
// This rewards new learning more than re-reviewing easy cards.
export function xpForRepetition(repetition: number): number {
  const table = [5, 3, 2, 1];
  const idx = Math.min(Math.max(repetition, 0), table.length - 1);
  return table[idx];
}
