'use client';
import Link from 'next/link';
import CategoryMenu, { type CategorySlug } from './CategoryMenu';
import LogoSparkles from './LogoSparkles';

export default function Nav({
  category,
  onCategoryChange,
  introFinished,
}: {
  category: CategorySlug;
  onCategoryChange: (c: CategorySlug) => void;
  introFinished: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/[0.03] border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <nav className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <CategoryMenu active={category} onChange={onCategoryChange} />
          
          <Link
            href="/"
            className="brand-link relative flex items-center gap-3 group"
            aria-label="Wallvine home"
          >
            {/* Applied logo-wrapper for glow and shine */}
            <div className="logo-wrapper h-9 w-9 flex items-center justify-center bg-ink-950 p-0.5">
              <img 
                src="/logo.png" 
                alt="Wallvine Logo" 
                className="h-full w-full object-contain" 
              />
            </div>
            
            <span className="brand-text relative text-2xl font-display font-bold tracking-tight text-white">
              Wallvine
              {introFinished && <LogoSparkles key="sparkles" />}
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}