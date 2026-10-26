'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  toggleTheme: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...empty, ...JSON.parse(raw) });
      else {
        const dark = document.documentElement.classList.contains('dark');
        setState((s) => ({ ...s, theme: dark ? 'dark' : 'light' }));
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      localStorage.setItem('quiz-theme', state.theme);
    } catch {}
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state, ready]);

  const recordAnswer = useCallback(
    (id: string, a: Answer) => setState((s) => ({ ...s, answers: { ...s.answers, [id]: a } })),
    [],
  );
  const toggleSaved = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
      })),
    [],
  );
  const setPosition = useCallback(
    (mode: string, p: Position) =>
      setState((s) => ({ ...s, positions: { ...s.positions, [mode]: p } })),
    [],
  );
  const resetAnswers = useCallback(
    (ids: string[], mode?: string) =>
      setState((s) => {
        const answers = { ...s.answers };
        ids.forEach((i) => delete answers[i]);
        const positions = { ...s.positions };
        if (mode) delete positions[mode];
        return { ...s, answers, positions };
      }),
    [],
  );
  const toggleTheme = useCallback(
    () => setState((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' })),
    [],
  );

  const value = useMemo(
    () => ({ ready, state, recordAnswer, toggleSaved, setPosition, resetAnswers, toggleTheme }),
    [ready, state, recordAnswer, toggleSaved, setPosition, resetAnswers, toggleTheme],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside StoreProvider');
  return v;
}
