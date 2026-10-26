'use client';

import { Bookmark } from './icons';

export default function BookmarkButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save question'}
      className={`-mr-2 flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-colors hover:bg-surface-2 active:bg-line ${
        saved ? 'text-accent-text' : 'text-ink-2 hover:text-ink'
      }`}
    >
      <Bookmark filled={saved} className="h-[18px] w-[18px]" />
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
