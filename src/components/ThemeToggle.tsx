'use client';

import { useStore } from '@/lib/store';
import { Moon, Sun } from './icons';

export default function ThemeToggle() {
  const { state, toggleTheme } = useStore();
  const dark = state.theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-11 w-11 items-center justify-center rounded-xl text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink active:bg-line"
    >
      {dark ? <Sun /> : <Moon />}
    </button>
  );
}
