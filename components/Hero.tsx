import Link from 'next/link';
import { AuroraBackground } from './ui/aurora-background';

export default function Hero() {
  const points = [
    { title: "Perfectly Optimized", desc: "Carefully cropped and color-corrected." },
    { title: "Exact Resolution", desc: "Made to fit your phone and laptop." },
    { title: "Zero Distractions", desc: "No ads, watermarks, or fake buttons." },
    { title: "Pure Art", desc: "Just beautiful wallpapers, nothing else." }
  ];

  return (
    <AuroraBackground className="min-h-[500px] md:min-h-[700px] flex items-center">
      <div className="relative w-full mx-auto max-w-6xl px-6 md:px-12 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <p className="hero-eyebrow text-xs uppercase tracking-[0.3em] text-accent mb-6 font-semibold font-display">
              Wallvine / Vol. 01
            </p>

            <h1 className="hero-headline text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter leading-[0.95] text-white">
              <span className="hero-word" style={{ animationDelay: '0.05s' }}>Wallpapers</span>{' '}
              <span className="hero-word" style={{ animationDelay: '0.18s' }}>that</span>{' '}
              <span className="hero-word" style={{ animationDelay: '0.30s' }}>actually</span>{' '}
              <span className="hero-word text-accent" style={{ animationDelay: '0.42s' }}>fit</span>{' '}
              <span className="hero-word text-accent" style={{ animationDelay: '0.54s' }}>your</span>{' '}
              <span className="hero-word text-accent" style={{ animationDelay: '0.66s' }}>screen</span>
              <span className="hero-dot text-accent" style={{ animationDelay: '0.78s' }}>.</span>
            </h1>

            <div className="hero-cta mt-10 flex items-center gap-6">
              
              {/* Hover + Glow + Glass effect Button */}
              <Link
                href="#latest"
                className="group relative px-8 py-4 rounded-sm bg-white/5 border border-white/20 text-white font-bold font-display text-lg transition-all duration-300 hover:bg-white/10 hover:border-accent/50 hover:text-accent hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 overflow-hidden"
              >
                {/* Shimmer sweep on hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                <span className="relative z-10">View Collection</span>
              </Link>
              
            </div>
          </div>

          {/* Lightweight Glass Feature List */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:pl-10 lg:border-l border-white/10 p-6 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
            {points.map((p, i) => (
              <div 
                key={i} 
                className="hero-point flex flex-col gap-1"
                style={{ animationDelay: `${0.8 + (i * 0.15)}s` }}
              >
                <span className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  {p.title}
                </span>
                <span className="text-neutral-400 text-sm leading-relaxed pl-3.5">
                  {p.desc}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </AuroraBackground>
  );
}