'use client';

export default function BookmarkButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save question'}
      className={`flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 ${
        saved ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'
      }`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M6 3h12v18l-6-4-6 4z" />
      </svg>
    </button>
  );
}
