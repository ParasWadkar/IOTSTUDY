import type { Question } from '@/lib/types';
import { Check, X } from './icons';

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

type OptState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'missed' | 'neutral';

const box: Record<OptState, string> = {
  idle: 'border-line bg-surface shadow-card hover:border-line-strong hover:bg-surface-2 active:scale-[0.99]',
  selected: 'border-accent bg-accent-soft ring-1 ring-accent',
  correct: 'border-ok-line bg-ok-soft',
  incorrect: 'border-bad-line bg-bad-soft',
  missed: 'border-dashed border-ok-line bg-surface',
  neutral: 'border-line bg-surface',
};

const badge: Record<OptState, string> = {
  idle: 'bg-surface-2 text-ink-2',
  selected: 'bg-accent text-accent-ink',
  correct: 'bg-ok text-surface',
  incorrect: 'bg-bad text-surface',
  missed: 'border border-ok text-ok',
  neutral: 'bg-surface-2 text-ink-3',
};

export default function OptionList({ q, answered, pending = [], reveal, onPick }: Props) {
  const locked = !!answered || !!reveal;
  return (
    <ul className="space-y-2.5">
      {q.options.map((opt, i) => {
        const isCorrect = q.correct.includes(i);
        const isSel = answered?.includes(i) ?? false;
        let state: OptState = 'idle';
        if (locked) {
          if (isCorrect && (isSel || reveal)) state = 'correct';
          else if (isSel && !isCorrect) state = 'incorrect';
          else if (isCorrect) state = 'missed';
          else state = 'neutral';
        } else if (pending.includes(i)) {
          state = 'selected';
        }
        const note = locked ? q.optionNotes?.[i] : undefined;
        return (
          <li key={i}>
            <button
              type="button"
              disabled={locked}
              onClick={() => onPick?.(i)}
              data-state={state}
              aria-pressed={q.type === 'MSQ' && !locked ? state === 'selected' : undefined}
              className={`flex min-h-[56px] w-full items-start gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-[background-color,border-color,transform] duration-150 disabled:cursor-default ${box[state]}`}
            >
              <span className={`mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold uppercase ${badge[state]}`}>
                {'abcd'[i]}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-base leading-relaxed ${state === 'neutral' ? 'text-ink-2' : 'text-ink'}`}>{opt}</span>
                {locked && (
                  <span
                    className={`mt-1.5 flex items-center gap-1.5 text-sm font-semibold ${
                      isCorrect ? 'text-ok' : state === 'incorrect' ? 'text-bad' : 'text-ink-3'
                    }`}
                  >
                    {isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    {isCorrect ? 'Correct' : 'Incorrect'}
                    {isSel && <span className="sr-only">, selected</span>}
                  </span>
                )}
                {note && <span className="mt-1 block text-sm leading-relaxed text-ink-2">{note}</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
