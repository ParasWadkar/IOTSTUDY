'use client';

import Link from 'next/link';
import { useState } from 'react';
import { allQuestions, questionById, weeks } from '@/lib/data';
import { useStore } from '@/lib/store';
import type { Question } from '@/lib/types';
import ThemeToggle from './ThemeToggle';

function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

function stats(qs: Question[], answers: Record<string, { correct: boolean }>) {
  let attempted = 0;
  let correct = 0;
  for (const q of qs) {
    const a = answers[q.id];
    if (a) {
      attempted++;
      if (a.correct) correct++;
    }
  }
  return { attempted, correct, incorrect: attempted - correct };
}

function Card({
  href,
  title,
  qs,
  disabled,
}: {
  href: string;
  title: string;
  qs: Question[];
  disabled?: boolean;
}) {
  const { state } = useStore();
  const s = stats(qs, state.answers);
  const pct = qs.length ? Math.round((s.attempted / qs.length) * 100) : 0;
  const body = (
    <>
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-semibold">{title}</span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {disabled ? 'Coming soon' : `${qs.length} questions`}
        </span>
      </div>
      {!disabled && (
        <>
          <div className="mt-3">
            <Bar pct={pct} />
          </div>
          <div className="mt-2 flex gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>{s.attempted} attempted</span>
            <span className="text-green-600 dark:text-green-400">{s.correct} correct</span>
            <span className="text-red-600 dark:text-red-400">{s.incorrect} incorrect</span>
            <span className="ml-auto">{pct}%</span>
          </div>
        </>
      )}
    </>
  );
  const cls =
    'block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900';
  if (disabled) return <div className={`${cls} opacity-50`}>{body}</div>;
  return (
    <Link href={href} className={`${cls} active:scale-[0.99] hover:border-blue-400 dark:hover:border-blue-500`}>
      {body}
    </Link>
  );
}

function ResetProgress() {
  const { resetProgress } = useStore();
  const [open, setOpen] = useState(false);
  const btn = 'min-h-[48px] w-full rounded-2xl border px-4 font-medium';
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="min-h-[48px] rounded-xl px-3 text-sm font-medium text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        Reset progress
      </button>
    );
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-3 text-sm">Clear all answers and progress? Saved questions are kept unless you choose otherwise.</p>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => { resetProgress(false); setOpen(false); }}
          className={`${btn} border-red-500 bg-red-600 text-white hover:bg-red-700`}
        >
          Reset progress
        </button>
        <button
          onClick={() => { resetProgress(true); setOpen(false); }}
          className={`${btn} border-red-500 text-red-600 dark:text-red-400`}
        >
          Reset progress and saved questions
        </button>
        <button onClick={() => setOpen(false)} className={`${btn} border-slate-300 dark:border-slate-700`}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { state } = useStore();
  const wrongCount = allQuestions.filter((q) => state.answers[q.id] && !state.answers[q.id].correct).length;
  const savedCount = state.saved.filter((id) => questionById[id]).length;

  const pill =
    'flex min-h-[56px] flex-1 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 py-2 text-center text-sm font-medium shadow-sm active:scale-[0.99] hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900';

  return (
    <div className="animate-fade">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">IoT Quiz</h1>
        <ThemeToggle />
      </header>

      <div className="space-y-3">
        <Card href="/quiz/all" title="ALL" qs={allQuestions} />
        {weeks.map((w) => (
          <Card
            key={w.week}
            href={`/quiz/week-${w.week}`}
            title={`Week ${w.week}`}
            qs={w.questions}
            disabled={w.questions.length === 0}
          />
        ))}
      </div>

      <h2 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Revision
      </h2>
      <div className="flex gap-3">
        <Link href="/quiz/saved" className={pill}>
          Saved
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{savedCount}</span>
        </Link>
        <Link href="/quiz/wrong" className={pill}>
          Wrong
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{wrongCount}</span>
        </Link>
        <Link href="/revise" className={pill}>
          Quick Revision
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">saved</span>
        </Link>
      </div>

      <h2 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Settings
      </h2>
      <ResetProgress />
    </div>
  );
}
