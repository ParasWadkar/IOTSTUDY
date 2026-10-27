'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The normal full-width action button, plus a floating copy in the bottom-right (right-thumb) corner of
 * touch / small screens that shows only while the normal one is scrolled out of view and is enabled.
 */
export default function FloatingAction({
  onClick,
  label,
  icon,
  className,
  disabled,
}: {
  onClick: () => void;
  label: string;
  icon: (cls: string) => React.ReactNode;
  className: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.intersectionRatio >= 0.5), {
      threshold: [0, 0.5, 1],
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <button ref={ref} onClick={onClick} disabled={disabled} className={className}>
        {label}
        {icon('h-[18px] w-[18px]')}
      </button>
      {!inView && !disabled && (
        <button
          data-fab
          onClick={onClick}
          aria-hidden="true"
          tabIndex={-1}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 hidden h-14 animate-fade items-center gap-2 rounded-full bg-accent pl-6 pr-5 text-base font-semibold text-accent-ink shadow-[0_6px_20px_rgb(0_0_0/0.28)] transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-95 max-sm:flex [@media(pointer:coarse)]:flex"
        >
          {label}
          {icon('h-5 w-5')}
        </button>
      )}
    </>
  );
}
