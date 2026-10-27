type P = { className?: string; filled?: boolean };

const svg = (path: React.ReactNode, { className = 'h-5 w-5', filled }: P) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {path}
  </svg>
);

export const ChevronLeft = (p: P) => svg(<path d="M15 18l-6-6 6-6" />, p);
export const ChevronRight = (p: P) => svg(<path d="M9 18l6-6-6-6" />, p);
export const ArrowRight = (p: P) => svg(<path d="M5 12h14M13 6l6 6-6 6" />, p);
export const Check = (p: P) => svg(<path d="M5 12.5l4.5 4.5L19 7.5" />, p);
export const X = (p: P) => svg(<path d="M6 6l12 12M18 6L6 18" />, p);
export const Shuffle = (p: P) => svg(<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />, p);
export const Bookmark = (p: P) => svg(<path d="M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1z" />, p);
export const Sun = (p: P) =>
  svg(
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>,
    p,
  );
export const Moon = (p: P) => svg(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />, p);
export const Layers = (p: P) => svg(<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" />, p);
