'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Answer, PersistedState, Position } from './types';

const KEY = 'iot-quiz-v1';

const empty: PersistedState = { answers: {}, saved: [], theme: 'light', positions: {} };

interface Store {
  ready: boolean;
  state: PersistedState;
  recordAnswer: (id: string, a: Answer) => void;
  toggleSaved: (id: string) => void;
  setPosition: (mode: string, p: Position) => void;
  resetAnswers: (ids: string[], mode?: string) => void;
  resetProgress: (alsoSaved: boolean) => void;
  toggleTheme: () => void;
}

const Ctx = createContext<Store | null>(null);

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Keep only well-formed saved data so a damaged entry can't crash the app or wipe unrelated fields. */
function sanitize(raw: unknown, fallbackTheme: 'light' | 'dark'): PersistedState {
  const r = isObj(raw) ? raw : {};
  const answers: PersistedState['answers'] = {};
  if (isObj(r.answers)) {
    for (const [id, a] of Object.entries(r.answers)) {
      if (isObj(a) && typeof a.correct === 'boolean' && Array.isArray(a.selected) && a.selected.every((n) => Number.isInteger(n))) {
        answers[id] = { selected: a.selected as number[], correct: a.correct };
      }
    }
  }
  const positions: PersistedState['positions'] = {};
  if (isObj(r.positions)) {
    for (const [id, p] of Object.entries(r.positions)) {
      if (isObj(p) && Array.isArray(p.order) && p.order.every((x) => typeof x === 'string') && Number.isInteger(p.index)) {
        positions[id] = { order: p.order as string[], index: p.index as number };
      }
    }
  }
  return {
    answers,
    positions,
    saved: Array.isArray(r.saved) ? r.saved.filter((x): x is string => typeof x === 'string') : [],
    theme: r.theme === 'dark' || r.theme === 'light' ? r.theme : fallbackTheme,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(empty);
  const [ready, setReady] = useState(false);
  const stateRef = useRef<PersistedState>(empty);
  const readyRef = useRef(false);

  useEffect(() => {
    const dark = document.documentElement.classList.contains('dark');
    let parsed: unknown = null;
    try {
      const raw = localStorage.getItem(KEY);
      parsed = raw ? JSON.parse(raw) : null;
    } catch {}
    const loaded = sanitize(parsed, dark ? 'dark' : 'light');
    stateRef.current = loaded;
    readyRef.current = true;
    setState(loaded);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme, ready]);

  // Every change is written to localStorage immediately, so closing/reloading right after a tap can't lose it.
  const update = useCallback((fn: (s: PersistedState) => PersistedState) => {
    const next = fn(stateRef.current);
    stateRef.current = next;
    setState(next);
    if (!readyRef.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      localStorage.setItem('quiz-theme', next.theme);
    } catch {}
  }, []);

  const recordAnswer = useCallback(
    (id: string, a: Answer) => update((s) => ({ ...s, answers: { ...s.answers, [id]: a } })),
    [],
  );
  const toggleSaved = useCallback(
    (id: string) =>
      update((s) => ({
        ...s,
        saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
      })),
    [],
  );
  const setPosition = useCallback(
    (mode: string, p: Position) =>
      update((s) => ({ ...s, positions: { ...s.positions, [mode]: p } })),
    [],
  );
  const resetAnswers = useCallback(
    (ids: string[], mode?: string) =>
      update((s) => {
        const answers = { ...s.answers };
        ids.forEach((i) => delete answers[i]);
        const positions = { ...s.positions };
        if (mode) delete positions[mode];
        return { ...s, answers, positions };
      }),
    [],
  );
  const resetProgress = useCallback(
    (alsoSaved: boolean) =>
      update((s) => ({ ...s, answers: {}, positions: {}, saved: alsoSaved ? [] : s.saved })),
    [],
  );
  const toggleTheme = useCallback(
    () => update((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' })),
    [],
  );

  const value = useMemo(
    () => ({ ready, state, recordAnswer, toggleSaved, setPosition, resetAnswers, resetProgress, toggleTheme }),
    [ready, state, recordAnswer, toggleSaved, setPosition, resetAnswers, resetProgress, toggleTheme],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside StoreProvider');
  return v;
}
