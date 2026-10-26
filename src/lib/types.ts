export type QuestionType = 'MCQ' | 'MSQ' | 'TF';

export interface Question {
  id: string;
  week: number;
  number: number;
  type: QuestionType;
  question: string;
  options: string[];
  /** Indices into `options` of the correct answer(s). */
  correct: number[];
  explanation: string;
  source: string;
  /** Optional per-option reasoning (same order/length as `options`), kept in src/data/notes. */
  optionNotes?: string[];
}

export interface WeekData {
  week: number;
  title: string;
  questions: Question[];
}

export interface Answer {
  selected: number[];
  correct: boolean;
}

export interface Position {
  order: string[];
  index: number;
}

export interface PersistedState {
  answers: Record<string, Answer>;
  saved: string[];
  theme: 'light' | 'dark';
  positions: Record<string, Position>;
}
