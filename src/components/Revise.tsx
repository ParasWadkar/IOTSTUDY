'use client';

import Link from 'next/link';
import { useState } from 'react';
import { allQuestions } from '@/lib/data';
import { useStore } from '@/lib/store';
import BookmarkButton from './BookmarkButton';
import { ChevronLeft } from './icons';
import OptionList from './OptionList';

export default function Revise() {
  const { ready, state, toggleSaved } = useStore();
  const [index, setIndex] = useState(0);

  const list = allQuestions.filter((q) => state.saved.includes(q.id));
  const q = list[Math.min(index, list.length - 1)];
  const i = Math.min(index, Math.max(list.length - 1, 0));

  const btn =
    'flex h-12 flex-1 items-center justify-center rounded-xl border border-line-strong bg-surface px-5 text-[15px] font-medium text-ink transition-colors hover:bg-surface-2 active:bg-line disabled:pointer-events-none disabled:opacity-40';

  return (
    <div className="animate-fade">
      <div className="mb-3 flex items-center justify-between">
        <div className="-ml-2 flex min-w-0 items-center gap-0.5">
          <Link
            href="/"
            aria-label="Home"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink active:bg-line"
          >
            <ChevronLeft />
          </Link>
          <h1 className="truncate text-[17px] font-semibold tracking-tight">Quick Revision</h1>
        </div>
        {q && <BookmarkButton saved onClick={() => toggleSaved(q.id)} />}
      </div>

      {!ready ? null : !q ? (
        <p className="mx-auto max-w-xs py-20 text-center text-[15px] leading-relaxed text-ink-3">
          Nothing saved yet. Bookmark questions while practicing to revise them here.
        </p>
      ) : (
        <>
          <p className="mb-6 text-sm tabular-nums text-ink-3">
            <b className="font-semibold text-ink">{i + 1}</b>
            {' / '}
            {list.length} · Week {q.week} · Q{q.number}
          </p>
          <div key={q.id} className="animate-fade">
            <h2 className="mb-6 max-w-[44rem] text-xl font-semibold leading-[1.45] tracking-tight sm:text-[22px]">{q.question}</h2>
            <OptionList q={q} reveal />
            <section className="mt-6 rounded-2xl bg-surface-2 p-5">
              <p className="text-[15.5px] leading-[1.7] text-ink">{q.explanation}</p>
            </section>
          </div>
          <div className="mt-5 flex gap-3">
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
