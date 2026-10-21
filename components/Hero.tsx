import Link from 'next/link';
import { AuroraBackground } from './ui/aurora-background';

export default function Hero() {
  const points = [
    { title: "Perfectly Optimized", desc: "Carefully cropped and color-corrected." },
    { title: "Exact Resolution", desc: "Made to fit your phone and laptop." },
    { title: "Zero Distractions", desc: "No ads, watermarks, or fake download buttons." },
    { title: "Pure Art, Ready to Download", desc: "Just beautiful wallpapers, nothing else." }
  ];

  return (
    <AuroraBackground className="min-h-[420px] sm:min-h-[520px] md:min-h-[600px]">
      <div className="relative mx-auto max-w-4xl px-5 pt-14 pb-8 sm:pt-20 sm:pb-10 md:pt-24 md:pb-12 text-center">
        <p className="hero-eyebrow text-xs uppercase tracking-[0.28em] text-neutral-300 mb-4 font-semibold">
          <span className="hero-eyebrow-text">Curated Wallpapers</span>
        </p>

        <h1 className="hero-headline text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
          <span className="hero-word" style={{ animationDelay: '0.05s' }}>Wallpapers</span>{' '}
          <span className="hero-word" style={{ animationDelay: '0.18s' }}>that</span>{' '}
          <span className="hero-word" style={{ animationDelay: '0.30s' }}>fit</span>{' '}
          <span className="hero-word text-neon hero-word-neon" style={{ animationDelay: '0.42s' }}>your</span>{' '}
          <span className="hero-word text-neon hero-word-neon" style={{ animationDelay: '0.54s' }}>screen</span>
          <span className="hero-dot text-neon" style={{ animationDelay: '0.66s' }}>.</span>
        </h1>

        {/* The 4 glowing points with bullet icons */}
        <div className="mt-8 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-left">
          {points.map((p, i) => (
            <div 
              key={i} 
              className="hero-point flex items-start gap-3"
              style={{ animationDelay: `${0.8 + (i * 0.15)}s` }}
            >
              {/* Glowing Bullet Point */}
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neon-pink shadow-[0_0_8px_rgba(255,62,165,0.8)]"></span>
              
              {/* Text */}
              <div>
                <span className="text-white font-medium">{p.title}</span>
                <span className="text-neutral-400"> — {p.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Only the Browse button remains */}
        <div className="hero-cta mt-10 flex items-center justify-center">
          <Link
            href="#latest"
            className="px-8 py-3 rounded-md bg-neon-gradient text-ink-950 font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-neon-pink/20"
          >
            Browse the collection
          </Link>
        </div>
      </div>
    </AuroraBackground>
  );
}