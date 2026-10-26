import type { Question } from '@/lib/types';

interface Props {
  q: Question;
  /** Selected indices after answering (locked), if any. */
  answered?: number[];
  /** Pending (not yet submitted) selection for MSQ. */
  pending?: number[];
  /** Show correct answers without needing an answer (quick revision). */
  reveal?: boolean;
  onPick?: (i: number) => void;
}

export default function OptionList({ q, answered, pending = [], reveal, onPick }: Props) {
  const locked = !!answered || !!reveal;
  return (
    <ul className="space-y-3">
      {q.options.map((opt, i) => {
        const isCorrect = q.correct.includes(i);
        const isSel = answered?.includes(i) ?? false;
        let cls = 'border-slate-200 bg-white hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900';
        let tag = '';
        if (locked) {
          if (isCorrect && (isSel || reveal)) {
            cls = 'border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-500';
          } else if (isSel && !isCorrect) {
            cls = 'border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-500';
            tag = 'Your answer';
          } else if (isCorrect) {
            cls = 'border-green-500 border-dashed bg-white dark:bg-slate-900';
            tag = 'Correct answer';
          } else {
            cls = 'border-slate-200 bg-white opacity-60 dark:border-slate-800 dark:bg-slate-900';
          }
        } else if (pending.includes(i)) {
          cls = 'border-blue-500 bg-blue-50 dark:bg-blue-950';
        }
        return (
          <li key={i}>
            <button
              type="button"
              disabled={locked}
              onClick={() => onPick?.(i)}
              className={`flex min-h-[56px] w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base transition-colors ${cls}`}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {'abcd'[i]}
              </span>
              <span className="flex-1">{opt}</span>
              {tag && (
                <span className="mt-0.5 shrink-0 text-xs text-slate-500 dark:text-slate-400">{tag}</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
