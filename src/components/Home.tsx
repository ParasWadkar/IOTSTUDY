'use client';

import Link from 'next/link';
import { allQuestions, weeks } from '@/lib/data';
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

export default function Home() {
  const { state } = useStore();
  const wrongCount = allQuestions.filter((q) => state.answers[q.id] && !state.answers[q.id].correct).length;
  const savedCount = state.saved.length;

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
    </div>
  );
}
