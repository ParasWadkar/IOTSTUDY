'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { modeTitle, poolFor, questionById, shuffle } from '@/lib/data';
import { useStore } from '@/lib/store';
import type { Answer } from '@/lib/types';
import BookmarkButton from './BookmarkButton';
import OptionList from './OptionList';

const typeLabel = { MCQ: 'Single choice', MSQ: 'Select all that apply', TF: 'True / False' } as const;

export default function Quiz({ id }: { id: string }) {
  const { ready, state, recordAnswer, toggleSaved, setPosition, resetAnswers } = useStore();
  const [order, setOrder] = useState<string[] | null>(null);
  const [index, setIndex] = useState(0);
  const [session, setSession] = useState<Record<string, Answer>>({});
  const [pending, setPending] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  // Saved/Wrong are practice modes: they start fresh and don't persist their own order.
  const fresh = id === 'saved' || id === 'wrong';

  useEffect(() => {
    if (!ready || order) return;
    let ids = poolFor(id)
      .filter((q) => {
        if (id === 'saved') return state.saved.includes(q.id);
        if (id === 'wrong') return state.answers[q.id] && !state.answers[q.id].correct;
        return true;
      })
      .map((q) => q.id);
    let idx = 0;
    const pos = state.positions[id];
    if (!fresh && pos) {
      const valid = pos.order.filter((x) => ids.includes(x));
      ids = [...valid, ...ids.filter((x) => !valid.includes(x))];
      idx = Math.min(pos.index, Math.max(ids.length - 1, 0));
    }
    setOrder(ids);
    setIndex(idx);
    setSession(fresh ? {} : { ...state.answers });
  }, [ready, order, id, fresh, state]);

  useEffect(() => {
    if (order && !fresh) setPosition(id, { order, index });
  }, [order, index, id, fresh, setPosition]);

  if (!order) return <div className="py-20 text-center text-slate-500">Loading…</div>;

  const header = (
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
        <h1 className="text-lg font-bold">{modeTitle(id)}</h1>
      </div>
      <button
        onClick={() => {
          // Keep everything already done (and an answered current question) in place; shuffle only what's ahead.
          const keep = session[order[index]] ? index + 1 : index;
          setOrder([...order.slice(0, keep), ...shuffle(order.slice(keep))]);
          setPending([]);
        }}
        disabled={order.length - (session[order[index]] ? index + 1 : index) < 2}
        className="flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
        </svg>
        Shuffle
      </button>
    </div>
  );

  if (order.length === 0) {
    return (
      <div className="animate-fade">
        {header}
        <p className="py-16 text-center text-slate-500 dark:text-slate-400">
          {id === 'saved' ? 'No saved questions yet. Tap the bookmark while practicing.' : 'No wrong questions. Nice work!'}
        </p>
      </div>
    );
  }

  if (done) {
    const answers = order.map((x) => session[x]).filter(Boolean);
    const correct = answers.filter((a) => a.correct).length;
    return (
      <div className="animate-fade">
        {header}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-4xl font-bold">
            {correct} / {order.length}
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {correct} correct · {answers.length - correct} incorrect · {order.length - answers.length} skipped
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                if (!fresh) resetAnswers(order, id);
                setSession({});
                setIndex(0);
                setDone(false);
              }}
              className="min-h-[52px] rounded-2xl bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700"
            >
              Restart
            </button>
            <Link href="/quiz/wrong" className="flex min-h-[52px] items-center justify-center rounded-2xl border border-slate-300 font-medium dark:border-slate-700">
              Practice wrong questions
            </Link>
            <Link href="/" className="flex min-h-[52px] items-center justify-center rounded-2xl border border-slate-300 font-medium dark:border-slate-700">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const q = questionById[order[index]];
  const ans = session[q.id];
  const isLast = index === order.length - 1;

  function submit(sel: number[]) {
    const ok = sel.length === q.correct.length && sel.every((s) => q.correct.includes(s));
    const a: Answer = { selected: sel, correct: ok };
    setSession((s) => ({ ...s, [q.id]: a }));
    recordAnswer(q.id, a);
  }

  function pick(i: number) {
    if (ans) return;
    if (q.type === 'MSQ') setPending((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
    else submit([i]);
  }

  function next() {
    setPending([]);
    if (isLast) setDone(true);
    else setIndex(index + 1);
  }

  return (
    <div>
      {header}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {index + 1} / {order.length}
        </span>
        <BookmarkButton saved={state.saved.includes(q.id)} onClick={() => toggleSaved(q.id)} />
      </div>

      <div key={q.id} className="animate-fade">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {typeLabel[q.type]} · Week {q.week} · Q{q.number}
        </p>
        <h2 className="mb-5 text-lg font-semibold leading-snug">{q.question}</h2>

        <OptionList q={q} answered={ans?.selected} pending={pending} onPick={pick} />

        {!ans && q.type === 'MSQ' && (
          <button
            onClick={() => submit(pending)}
            disabled={pending.length === 0}
            className="mt-4 min-h-[52px] w-full rounded-2xl bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
          >
            Check answer
          </button>
        )}

        {ans && (
          <div className="mt-5 animate-fade rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className={`mb-2 font-semibold ${ans.correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {ans.correct ? 'Correct' : 'Incorrect'}
            </p>
            <p className="leading-relaxed">{q.explanation}</p>
            {q.source && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{q.source}</p>}
          </div>
        )}

        {ans && (
          <button
            onClick={next}
            className="mt-5 min-h-[56px] w-full rounded-2xl bg-blue-600 text-lg font-semibold text-white hover:bg-blue-700 active:scale-[0.99]"
          >
            {isLast ? 'Finish' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}
