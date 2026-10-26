import type { Question, WeekData } from './types';
import w1 from '@/data/weeks/week-1.json';
import w2 from '@/data/weeks/week-2.json';
import w3 from '@/data/weeks/week-3.json';
import w4 from '@/data/weeks/week-4.json';
import w5 from '@/data/weeks/week-5.json';
import w6 from '@/data/weeks/week-6.json';
import w7 from '@/data/weeks/week-7.json';
import w8 from '@/data/weeks/week-8.json';
import w9 from '@/data/weeks/week-9.json';
import w10 from '@/data/weeks/week-10.json';
import w11 from '@/data/weeks/week-11.json';
import w12 from '@/data/weeks/week-12.json';
import n1 from '@/data/notes/week-1.json';
import n2 from '@/data/notes/week-2.json';
import n3 from '@/data/notes/week-3.json';
import n4 from '@/data/notes/week-4.json';
import n5 from '@/data/notes/week-5.json';
import n6 from '@/data/notes/week-6.json';
import n7 from '@/data/notes/week-7.json';
import n8 from '@/data/notes/week-8.json';
import n9 from '@/data/notes/week-9.json';
import n10 from '@/data/notes/week-10.json';
import n11 from '@/data/notes/week-11.json';
import n12 from '@/data/notes/week-12.json';

// To add a week or more questions, edit/add a JSON file in src/data/weeks and list it here.
const rawWeeks = [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12] as WeekData[];
const notes = [n1, n2, n3, n4, n5, n6, n7, n8, n9, n10, n11, n12] as Record<string, string[]>[];

// Per-option notes live in src/data/notes (optional per week) and are merged by question id.
export const weeks: WeekData[] = rawWeeks.map((w, i) => ({
  ...w,
  questions: w.questions.map((q) => ({ ...q, optionNotes: notes[i]?.[q.id] })),
}));

export const allQuestions: Question[] = weeks.flatMap((w) => w.questions);

export const questionById: Record<string, Question> = Object.fromEntries(
  allQuestions.map((q) => [q.id, q]),
);

export const modeIds = ['all', 'saved', 'wrong', ...weeks.map((w) => `week-${w.week}`)];

export function modeTitle(id: string): string {
  if (id === 'all') return 'All Questions';
  if (id === 'saved') return 'Saved';
  if (id === 'wrong') return 'Wrong Questions';
  return `Week ${id.replace('week-', '')}`;
}

/** Base (unshuffled) pool for a mode. Saved/wrong are filtered at runtime. */
export function poolFor(id: string): Question[] {
  if (id.startsWith('week-')) {
    return weeks.find((w) => `week-${w.week}` === id)?.questions ?? [];
  }
  return allQuestions;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
