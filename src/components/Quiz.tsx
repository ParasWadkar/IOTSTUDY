'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { modeTitle, poolFor, questionById, shuffle } from '@/lib/data';
import { useStore } from '@/lib/store';
import type { Answer } from '@/lib/types';
import BookmarkButton from './BookmarkButton';
import { ArrowRight, Check, ChevronLeft, Shuffle, X } from './icons';
import OptionList from './OptionList';

const typeLabel = { MCQ: 'Single choice', MSQ: 'Select all that apply', TF: 'True / False' } as const;

const primaryBtn =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 text-[15px] font-semibold text-accent-ink shadow-card transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40';
const secondaryBtn =
  'flex h-12 w-full items-center justify-center rounded-xl border border-line-strong bg-surface px-5 text-[15px] font-medium text-ink transition-colors hover:bg-surface-2 active:bg-line';

export default function Quiz({ id }: { id: string }) {
  const { ready, state, recordAnswer, toggleSaved, setPosition, resetAnswers } = useStore();
  const [order, setOrder] = useState<string[] | null>(null);
  const [index, setIndex] = useState(0);
  const [session, setSession] = useState<Record<string, Answer>>({});
  const [pending, setPending] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);

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

  if (!order) return <div className="py-24 text-center text-sm text-ink-3">Loading…</div>;

  const header = (
    <div className="mb-3 flex items-center justify-between">
      <div className="-ml-2 flex min-w-0 items-center gap-0.5">
        <Link
          href="/"
          aria-label="Home"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink active:bg-line"
        >
          <ChevronLeft />
        </Link>
        <h1 className="truncate text-[17px] font-semibold tracking-tight">{modeTitle(id)}</h1>
      </div>
      <button
        onClick={() => {
          // Keep everything already done (and an answered current question) in place; shuffle only what's ahead.
          const keep = session[order[index]] ? index + 1 : index;
          setOrder([...order.slice(0, keep), ...shuffle(order.slice(keep))]);
          setPending([]);
        }}
        disabled={order.length - (session[order[index]] ? index + 1 : index) < 2}
        className="-mr-2 flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink active:bg-line disabled:pointer-events-none disabled:opacity-40"
      >
        <Shuffle className="h-[18px] w-[18px]" />
        Shuffle
      </button>
    </div>
  );

  if (order.length === 0) {
    return (
      <div className="animate-fade">
        {header}
        <p className="mx-auto max-w-xs py-20 text-center text-[15px] leading-relaxed text-ink-3">
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
        <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-card sm:p-8">
          <p className="text-4xl font-semibold tabular-nums tracking-tight">
            {correct} / {order.length}
          </p>
          <p className="mt-2 text-[15px] text-ink-2">
            {correct} correct · {answers.length - correct} incorrect · {order.length - answers.length} skipped
          </p>
          <div className="mt-7 flex flex-col gap-2.5">
            {confirmRestart && (
              <p className="text-sm leading-relaxed text-ink-2">
                Restarting clears your recorded answers for {modeTitle(id)}, including its wrong-question history.
              </p>
            )}
            <button
              onClick={() => {
                if (!fresh && !confirmRestart) {
                  setConfirmRestart(true);
                  return;
                }
                if (!fresh) resetAnswers(order, id);
                setSession({});
                setIndex(0);
                setDone(false);
                setConfirmRestart(false);
              }}
              className={primaryBtn}
            >
              {confirmRestart ? 'Clear answers and restart' : 'Restart'}
            </button>
            {confirmRestart && (
              <button onClick={() => setConfirmRestart(false)} className={secondaryBtn}>
                Cancel
              </button>
            )}
            <Link href="/quiz/wrong" className={secondaryBtn}>
              Practice wrong questions
            </Link>
            <Link href="/" className={secondaryBtn}>
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
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm tabular-nums text-ink-3">
            <b className="font-semibold text-ink">{index + 1}</b>
            {' / '}
            {order.length}
          </span>
          <BookmarkButton saved={state.saved.includes(q.id)} onClick={() => toggleSaved(q.id)} />
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${((index + 1) / order.length) * 100}%` }}
          />
        </div>
      </div>

      <div key={q.id} className="animate-fade">
        <p data-meta className="mb-2.5 text-[13px] font-medium text-ink-3">
          {typeLabel[q.type]} · Week {q.week} · Q{q.number}
        </p>
        <h2 className="mb-6 max-w-[44rem] text-xl font-semibold leading-[1.45] tracking-tight sm:text-[22px]">{q.question}</h2>

        <OptionList q={q} answered={ans?.selected} pending={pending} onPick={pick} />

        {!ans && q.type === 'MSQ' && (
          <button onClick={() => submit(pending)} disabled={pending.length === 0} className={`${primaryBtn} mt-5`}>
            Check answer
          </button>
        )}

        {ans && (
          <section className="mt-6 animate-fade rounded-2xl bg-surface-2 p-5">
            <p className={`mb-2.5 flex items-center gap-2 text-sm font-semibold ${ans.correct ? 'text-ok' : 'text-bad'}`}>
              {ans.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {ans.correct ? 'Correct' : 'Incorrect'}
            </p>
            <p className="text-[15.5px] leading-[1.7] text-ink">{q.explanation}</p>
            {q.source && <p className="mt-3.5 border-t border-line pt-3 text-xs leading-relaxed text-ink-3">{q.source}</p>}
          </section>
        )}

        {ans && (
          <button onClick={next} className={`${primaryBtn} mt-4`}>
            {isLast ? 'Finish' : 'Next'}
            <ArrowRight className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>
    </div>
  );
}
