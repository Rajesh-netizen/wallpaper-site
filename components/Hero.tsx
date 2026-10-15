import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-neon-soft animate-glow-pulse"
      />

      <div className="relative mx-auto max-w-5xl px-5 pt-14 pb-8 sm:pt-20 sm:pb-10 md:pt-24 md:pb-12 text-center">
        {/* ---------- eyebrow: animated fade-up with gradient shimmer ---------- */}
        <p className="hero-eyebrow text-xs uppercase tracking-[0.28em] text-neutral-300 mb-4">
          <span className="hero-eyebrow-text">Premium wallpapers</span>
        </p>

        {/* ---------- headline: glow + letter-by-letter entrance ---------- */}
        <h1 className="hero-headline text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.08]">
          <span className="hero-word" style={{ animationDelay: '0.05s' }}>
            Wallpapers
          </span>{' '}
          <span className="hero-word" style={{ animationDelay: '0.18s' }}>
            that
          </span>{' '}
          <span className="hero-word" style={{ animationDelay: '0.30s' }}>
            fit
          </span>{' '}
          <span
            className="hero-word text-neon hero-word-neon"
            style={{ animationDelay: '0.42s' }}
          >
            your
          </span>{' '}
          <span
            className="hero-word text-neon hero-word-neon"
            style={{ animationDelay: '0.54s' }}
          >
            screen
          </span>
          <span className="hero-dot text-neon" style={{ animationDelay: '0.66s' }}>
            .
          </span>
        </h1>

        {/* ---------- description: subtle rise ---------- */}
        <p className="hero-description mt-4 text-base sm:text-lg text-neutral-300 max-w-xl mx-auto leading-relaxed">
          One collection, tuned for every device. Pick phone or laptop, download
          the exact resolution you need.
        </p>

        {/* ---------- CTA ---------- */}
        <div className="hero-cta mt-6 flex items-center justify-center">
          <Link
            href="#latest"
            className="browse-btn px-5 py-2.5 rounded-pill text-sm font-medium bg-neon-gradient text-ink-950 glow-gradient hover:-translate-y-0.5"
          >
            Browse wallpapers
          </Link>
        </div>
      </div>
    </section>
  );
}