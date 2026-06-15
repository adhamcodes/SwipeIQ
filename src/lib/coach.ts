import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export type CoachMode = 'HYPE' | 'ROAST';

// Rich local fallback pool — used instantly, and whenever AI is unavailable/offline.
// {streak} is replaced with the current streak number.
const POOL: Record<CoachMode, { zero: string[]; active: string[] }> = {
  HYPE: {
    zero: [
      "Fresh start! Let's build a streak today. 🚀",
      "Today's the day it all clicks. Open a deck!",
      "New day, new brain gains. Let's go! 💪",
      "Your comeback starts with one swipe. Begin!",
      "Empty streak? Perfect canvas. Let's paint genius.",
    ],
    active: [
      "{streak}-day streak and climbing! Unstoppable. 🔥",
      "{streak} days strong — you're a learning machine!",
      "Look at that {streak}-day streak. Keep the fire alive!",
      "{streak} days in a row. Future-you is grateful. 🙌",
      "Momentum is yours — {streak} days and counting!",
    ],
  },
  ROAST: {
    zero: [
      "0 days. Bold strategy. Open a deck before I lose hope.",
      "Your brain called. It's bored. Do something. 🙄",
      "A streak of zero? Inspiring. Truly. Get to work.",
      "Dust on the cards already? Swipe something.",
      "Zero days. My houseplant studies more than you.",
    ],
    active: [
      "{streak} days? My calculator has a longer memory.",
      "{streak}-day streak. Cute. Don't trip now. 😏",
      "Oh, {streak} whole days. Want a medal? Keep going.",
      "{streak} days and still here? Fine, impress me more.",
      "Don't get cocky over {streak} days. Prove it again.",
    ],
  },
};

export function pickLocalCoachLine(mode: CoachMode, streak: number): string {
  const set = POOL[mode];
  const arr = streak > 0 ? set.active : set.zero;
  const line = arr[Math.floor(Math.random() * arr.length)];
  return line.replace('{streak}', String(streak));
}

const CACHE_KEY = 'coach-lines-cache-v1';

// Read today's cached AI lines for this mode, or null.
export async function getCachedCoachLines(mode: CoachMode): Promise<string[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const today = new Date().toDateString();
    if (parsed?.mode === mode && parsed?.date === today && Array.isArray(parsed.lines) && parsed.lines.length) {
      return parsed.lines;
    }
    return null;
  } catch {
    return null;
  }
}

// Fetch a fresh batch of AI coach lines and cache them. Never throws.
export async function refreshCoachLines(mode: CoachMode): Promise<string[] | null> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-coach', { body: { mode } });
    if (error || !data) return null;
    const raw = Array.isArray(data) ? data : data.lines;
    if (!Array.isArray(raw)) return null;
    const clean = raw.filter((l: any) => typeof l === 'string' && l.trim()).map((l: string) => l.trim()).slice(0, 12);
    if (!clean.length) return null;
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ mode, date: new Date().toDateString(), lines: clean }));
    return clean;
  } catch {
    return null;
  }
}
