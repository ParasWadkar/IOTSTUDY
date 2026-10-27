'use client';

import Link from 'next/link';
import { useState } from 'react';
import { allQuestions, questionById, weeks } from '@/lib/data';
import { useStore } from '@/lib/store';
import type { Question } from '@/lib/types';
import { Bookmark, ChevronRight, Layers, X } from './icons';
import ThemeToggle from './ThemeToggle';

function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-line">
      <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
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

function Row({
  href,
  title,
  qs,
  disabled,
  featured,
}: {
  href: string;
  title: string;
  qs: Question[];
  disabled?: boolean;
  featured?: boolean;
}) {
  const { state } = useStore();
  const s = stats(qs, state.answers);
  const pct = qs.length ? Math.round((s.attempted / qs.length) * 100) : 0;
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className={featured ? 'text-lg font-semibold tracking-tight' : 'text-base font-semibold'}>{title}</span>
        <span className="flex items-center gap-1 text-sm text-ink-3">
          {disabled ? 'Coming soon' : `${qs.length} questions`}
          {!disabled && <ChevronRight className="h-4 w-4" />}
        </span>
      </div>
      {!disabled && (
        <>
          <div className="mt-2.5">
            <Bar pct={pct} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-0.5 text-xs text-ink-3">
            <span>{s.attempted} attempted</span>
            <span className="text-ok">{s.correct} correct</span>
            <span className="text-bad">{s.incorrect} incorrect</span>
            <span className="ml-auto tabular-nums">{pct}%</span>
          </div>
        </>
      )}
    </>
  );
  const pad = featured ? 'px-4 py-4' : 'px-4 py-3.5';
  if (disabled) return <div className={`${pad} opacity-60`}>{body}</div>;
  return (
    <Link href={href} className={`block ${pad} transition-colors hover:bg-surface-2 active:bg-line`}>
      {body}
    </Link>
  );
}

function ResetProgress() {
  const { resetProgress } = useStore();
  const [open, setOpen] = useState(false);
  const btn = 'flex h-12 w-full items-center justify-center rounded-xl border px-4 text-[15px] font-medium transition-colors';
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="-ml-3 flex h-12 items-center rounded-xl px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
      >
        Reset progress
      </button>
    );
  }
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <p className="mb-3.5 text-sm leading-relaxed text-ink-2">
        Clear all answers and progress? Saved questions are kept unless you choose otherwise.
      </p>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => { resetProgress(false); setOpen(false); }}
          className={`${btn} border-bad bg-bad text-surface hover:opacity-90`}
        >
          Reset progress
        </button>
        <button
          onClick={() => { resetProgress(true); setOpen(false); }}
          className={`${btn} border-bad-line text-bad hover:bg-bad-soft`}
        >
          Reset progress and saved questions
        </button>
        <button onClick={() => setOpen(false)} className={`${btn} border-line-strong text-ink hover:bg-surface-2`}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const sectionLabel = 'mb-2.5 mt-9 text-xs font-semibold uppercase tracking-wider text-ink-3';

export default function Home() {
  const { state } = useStore();
  const wrongCount = allQuestions.filter((q) => state.answers[q.id] && !state.answers[q.id].correct).length;
  const savedCount = state.saved.filter((id) => questionById[id]).length;

  const tile =
    'flex min-h-[76px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl border border-line bg-surface px-2 py-3 text-center text-sm font-medium shadow-card transition-colors hover:bg-surface-2 active:bg-line';

  return (
    <div className="animate-fade">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">IoT Quiz</h1>
          <p className="mt-0.5 text-sm text-ink-3">Introduction to Internet of Things</p>
        </div>
        <div className="-mr-2.5 -mt-1">
          <ThemeToggle />
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <Row href="/quiz/all" title="ALL" qs={allQuestions} featured />
      </div>

      <div className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        {weeks.map((w) => (
          <Row
            key={w.week}
            href={`/quiz/week-${w.week}`}
            title={`Week ${w.week}`}
            qs={w.questions}
            disabled={w.questions.length === 0}
          />
        ))}
      </div>

      <h2 className={sectionLabel}>Revision</h2>
      <div className="flex gap-2.5">
        <Link href="/quiz/saved" className={tile}>
          <Bookmark className="h-[18px] w-[18px] text-ink-2" />
          Saved
          <span className="text-xs font-normal tabular-nums text-ink-3">{savedCount}</span>
        </Link>
        <Link href="/quiz/wrong" className={tile}>
          <X className="h-[18px] w-[18px] text-ink-2" />
          Wrong
          <span className="text-xs font-normal tabular-nums text-ink-3">{wrongCount}</span>
        </Link>
        <Link href="/revise" className={tile}>
          <Layers className="h-[18px] w-[18px] text-ink-2" />
          Quick Revision
          <span className="text-xs font-normal text-ink-3">saved</span>
        </Link>
      </div>

      <h2 className={sectionLabel}>Settings</h2>
      <ResetProgress />
    </div>
  );
}
