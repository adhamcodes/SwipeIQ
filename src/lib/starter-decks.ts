// Ready-made decks offered to brand-new users so the app is never empty.
// These are plain question/answer pairs; ids + SM-2 fields are added when added.

export interface StarterDeck {
  title: string;
  emoji: string;
  cards: { question: string; answer: string }[];
}

export const STARTER_DECKS: StarterDeck[] = [
  {
    title: 'World Capitals',
    emoji: '🌍',
    cards: [
      { question: 'Capital of Japan?', answer: 'Tokyo' },
      { question: 'Capital of Australia?', answer: 'Canberra' },
      { question: 'Capital of Canada?', answer: 'Ottawa' },
      { question: 'Capital of Brazil?', answer: 'Brasília' },
      { question: 'Capital of Egypt?', answer: 'Cairo' },
      { question: 'Capital of Norway?', answer: 'Oslo' },
      { question: 'Capital of South Korea?', answer: 'Seoul' },
      { question: 'Capital of Kenya?', answer: 'Nairobi' },
    ],
  },
  {
    title: 'SAT Vocabulary',
    emoji: '📖',
    cards: [
      { question: 'Ephemeral', answer: 'Lasting a very short time' },
      { question: 'Ubiquitous', answer: 'Present everywhere at once' },
      { question: 'Pragmatic', answer: 'Practical rather than idealistic' },
      { question: 'Benevolent', answer: 'Kind and well-meaning' },
      { question: 'Candid', answer: 'Honest and straightforward' },
      { question: 'Meticulous', answer: 'Very careful about details' },
      { question: 'Resilient', answer: 'Able to recover quickly from difficulty' },
      { question: 'Verbose', answer: 'Using more words than needed' },
    ],
  },
  {
    title: 'JavaScript Basics',
    emoji: '💻',
    cards: [
      { question: 'What keyword declares a block-scoped variable?', answer: '`let` (or `const`)' },
      { question: 'What does `===` check?', answer: 'Value AND type equality (strict equality)' },
      { question: 'What is a Promise?', answer: 'An object representing a future value of an async operation' },
      { question: 'What does `Array.map()` return?', answer: 'A new array with the results of calling a function on every element' },
      { question: 'What is `null`?', answer: 'An intentional absence of any value' },
      { question: 'What does `async/await` do?', answer: 'Lets you write asynchronous code that reads like synchronous code' },
      { question: 'What is the DOM?', answer: 'Document Object Model — the tree structure of a web page' },
      { question: 'What does `JSON.parse()` do?', answer: 'Converts a JSON string into a JavaScript object' },
    ],
  },
  {
    title: 'Human Body',
    emoji: '🫀',
    cards: [
      { question: 'How many bones in the adult human body?', answer: '206' },
      { question: 'What organ pumps blood?', answer: 'The heart' },
      { question: 'What is the largest organ?', answer: 'The skin' },
      { question: 'What carries oxygen in the blood?', answer: 'Red blood cells (hemoglobin)' },
      { question: 'What part of the brain controls balance?', answer: 'The cerebellum' },
      { question: 'How many chambers does the heart have?', answer: 'Four' },
      { question: 'What is the smallest bone?', answer: 'The stapes (in the ear)' },
      { question: 'What gland regulates metabolism?', answer: 'The thyroid' },
    ],
  },
];
