'use client';

import Link from 'next/link';
import { useState } from 'react';
import { allQuestions } from '@/lib/data';
import { useStore } from '@/lib/store';
import BookmarkButton from './BookmarkButton';
import OptionList from './OptionList';

export default function Revise() {
  const { ready, state, toggleSaved } = useStore();
  const [index, setIndex] = useState(0);

  const list = allQuestions.filter((q) => state.saved.includes(q.id));
  const q = list[Math.min(index, list.length - 1)];
  const i = Math.min(index, Math.max(list.length - 1, 0));

  const btn =
    'min-h-[52px] flex-1 rounded-2xl border border-slate-300 font-medium disabled:opacity-40 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800';

  return (
    <div className="animate-fade">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="Home"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold">Quick Revision</h1>
        </div>
        {q && <BookmarkButton saved onClick={() => toggleSaved(q.id)} />}
      </div>

      {!ready ? null : !q ? (
        <p className="py-16 text-center text-slate-500 dark:text-slate-400">
          Nothing saved yet. Bookmark questions while practicing to revise them here.
        </p>
      ) : (
        <>
          <p className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            {i + 1} / {list.length} · Week {q.week} · Q{q.number}
          </p>
          <div key={q.id} className="animate-fade">
            <h2 className="mb-4 text-lg font-semibold leading-snug">{q.question}</h2>
            <OptionList q={q} reveal />
            <p className="mt-4 leading-relaxed text-slate-700 dark:text-slate-300">{q.explanation}</p>
          </div>
          <div className="mt-6 flex gap-3">
            <button className={btn} disabled={i === 0} onClick={() => setIndex(i - 1)}>
              Previous
            </button>
            <button className={btn} disabled={i === list.length - 1} onClick={() => setIndex(i + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
