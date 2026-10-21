'use client';
import Link from 'next/link';
import CategoryMenu, { type CategorySlug } from './CategoryMenu';
import LogoSparkles from './LogoSparkles';

export default function Nav({
  category,
  onCategoryChange,
}: {
  category: CategorySlug;
  onCategoryChange: (c: CategorySlug) => void;
}) {
  return (
    <header 
      className="sticky top-0 z-40 w-full border-b border-white/10 
                 bg-white/[0.03] backdrop-blur-[20px] backdrop-saturate-150
                 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_30px_rgba(0,0,0,0.5)]"
    >
      <nav className="mx-auto max-w-7xl px-5 h-16 flex items-center gap-3">
        <CategoryMenu active={category} onChange={onCategoryChange} />

        <Link
          href="/"
          className="brand-link relative flex items-center gap-2 group"
          aria-label="Wallvine home"
        >
          <span
            aria-hidden
            className="h-6 w-6 rounded-md bg-neon-gradient shadow-glow-pink group-hover:shadow-glow-cyan transition-shadow duration-300"
          />
          <span className="brand-text relative text-lg font-semibold tracking-tight text-white">
            Wall<span className="text-neon">vine</span>

            {/* Sparkles fall from behind the underline */}
            <LogoSparkles />
          </span>
        </Link>
      </nav>
    </header>
  );
}