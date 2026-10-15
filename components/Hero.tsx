import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-neon-soft animate-glow-pulse"
      />

      {/* Hero: tight vertical rhythm on short screens, generous on tall ones.
          pt/pb scale with viewport but never balloon to a full empty screen. */}
      <div className="relative mx-auto max-w-5xl px-5 pt-14 pb-8 sm:pt-20 sm:pb-10 md:pt-24 md:pb-12 text-center">
        <p className="animate-fade-up text-xs uppercase tracking-[0.2em] text-neutral-300 mb-4">
          Premium wallpapers
        </p>

        <h1 className="animate-fade-up text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.08]">
          Wallpapers that fit <span className="text-neon">your screen</span>.
        </h1>

        <p className="animate-fade-up mt-4 text-base sm:text-lg text-neutral-300 max-w-xl mx-auto leading-relaxed">
          One collection, tuned for every device. Pick phone or laptop, download
          the exact resolution you need.
        </p>

        <div className="animate-fade-up mt-6 flex items-center justify-center">
          <Link
            href="#latest"
            className="px-5 py-2.5 rounded-pill text-sm font-medium bg-neon-gradient text-ink-950 glow-gradient hover:-translate-y-0.5"
          >
            Browse wallpapers
          </Link>
        </div>
      </div>
    </section>
  );
}