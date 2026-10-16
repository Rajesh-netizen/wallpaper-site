'use client';
import { useEffect, useRef, useState } from 'react';

export const CATEGORIES = [
  { slug: 'anime',       label: 'Anime' },
  { slug: 'lord',        label: 'Lord' },
  { slug: 'marvel',      label: 'Marvel' },
  { slug: 'aesthetic',   label: 'Aesthetic' },
  { slug: 'automobiles', label: 'Automobiles' },
  { slug: 'nature',      label: 'Nature' },
] as const;

export type CategorySlug = 'all' | (typeof CATEGORIES)[number]['slug'];

export default function CategoryMenu({
  active,
  onChange,
}: {
  active: CategorySlug;
  onChange: (c: CategorySlug) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function pick(slug: CategorySlug) {
    onChange(slug);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Categories"
        onClick={() => setOpen((o) => !o)}
        className={[
          'h-9 w-9 rounded-md flex items-center justify-center',
          'text-neutral-300 hover:text-white hover:bg-white/5',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan',
          open ? 'bg-white/5 text-white' : '',
        ].join(' ')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" className="h-5 w-5">
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Categories"
          className={[
            'absolute left-0 top-full mt-2 z-50',
            'min-w-[180px] p-1',
            'rounded-card bg-ink-900 border border-white/10 shadow-card',
            'animate-fade-up',
          ].join(' ')}
        >
          <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            Category
          </p>

          <MenuItem label="All" active={active === 'all'} onClick={() => pick('all')} />

          <div className="my-1 h-px bg-white/5" />

          {CATEGORIES.map((c) => (
            <MenuItem
              key={c.slug}
              label={c.label}
              active={active === c.slug}
              onClick={() => pick(c.slug as CategorySlug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="menuitemradio"
      aria-checked={active}
      onClick={onClick}
      className={[
        'w-full text-left px-3 py-2 rounded-md text-sm',
        'flex items-center justify-between gap-3',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan',
        active
          ? 'bg-white/10 text-white'
          : 'text-neutral-300 hover:bg-white/5 hover:text-white',
      ].join(' ')}
    >
      <span>{label}</span>
      {active && <span className="text-neon-pink text-xs">●</span>}
    </button>
  );
}