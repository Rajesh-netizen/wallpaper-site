'use client';
import { useState } from 'react';
import { useFavourites } from './useFavourites';

export default function WallpaperCard({ wallpaper, device }: any) {
  const [open, setOpen] = useState(false);
  const { favourites, toggle } = useFavourites();
  const isFav = favourites.includes(wallpaper.slug);

  const pool = wallpaper.variants
    .filter((v: any) => v.device === device)
    .sort((a: any, b: any) => a.width - b.width);

  if (pool.length === 0) return null;
  const thumb = pool[0];

  function bestVariant() {
    const physicalW = window.screen.width * (window.devicePixelRatio || 1);
    return (
      [...pool].reverse().find((v: any) => v.width <= physicalW * 1.15) ??
      pool[pool.length - 1]
    );
  }

  const downloadName = (v: any) => `${wallpaper.slug}-${v.width}x${v.height}.webp`;

  return (
    <>
      <div
        className={[
          'group relative rounded-card overflow-hidden',
          'bg-ink-800 shadow-card',
          'ring-1 ring-white/5 hover:ring-white/10',
          'transition-all duration-300 ease-out',
          'hover:-translate-y-1',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`View ${wallpaper.title}`}
          className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 rounded-card"
        >
          <img
            src={thumb.path}
            alt={`${wallpaper.title} wallpaper preview`}
            loading="lazy"
            decoding="async"
            width={thumb.width}
            height={thumb.height}
            className="w-full h-auto"
          />
        </button>

        {/* Heart button — top-right corner */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle(wallpaper.slug);
          }}
          aria-label={isFav ? `Remove ${wallpaper.title} from favourites` : `Add ${wallpaper.title} to favourites`}
          aria-pressed={isFav}
          className={[
            'absolute top-3 right-3 h-9 w-9 rounded-full',
            'flex items-center justify-center',
            'bg-black/50 backdrop-blur-sm',
            'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
            'transition-all duration-200',
            'hover:scale-110 hover:bg-black/70',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan',
            isFav ? 'opacity-100' : '',
          ].join(' ')}
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition-colors ${
              isFav ? 'fill-neon-pink stroke-neon-pink' : 'fill-none stroke-white'
            }`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Hover overlay with title */}
        <div
          className={[
            'pointer-events-none absolute inset-x-0 bottom-0 p-3',
            'bg-gradient-to-t from-black/80 to-transparent',
            'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
            'transition-opacity duration-200',
          ].join(' ')}
        >
          <p className="text-sm font-medium text-white truncate">
            {wallpaper.title}
          </p>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up"
          role="dialog"
          aria-modal="true"
          aria-label={`${wallpaper.title} options`}
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-ink-900 neon-border rounded-card p-5 max-w-sm w-full shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="font-semibold text-lg">{wallpaper.title}</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-neutral-400 hover:text-white text-xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan rounded transition-colors"
              >
                ×
              </button>
            </div>

            <a
              href={bestVariant().path}
              download={downloadName(bestVariant())}
              className="block w-full text-center px-4 py-2.5 rounded-pill bg-neon-gradient text-ink-950 font-medium glow-gradient hover:-translate-y-0.5"
            >
              Download for my {device}
            </a>

            <button
              type="button"
              onClick={() => toggle(wallpaper.slug)}
              className={[
                'mt-3 w-full text-center px-4 py-2 rounded-pill text-sm font-medium',
                'border transition-colors duration-200',
                isFav
                  ? 'border-neon-pink/60 text-neon-pink hover:bg-neon-pink/10'
                  : 'border-white/15 text-neutral-300 hover:bg-white/5 hover:border-white/25',
              ].join(' ')}
            >
              {isFav ? '♥ In favourites' : '♡ Add to favourites'}
            </button>

            <div className="mt-4 text-sm space-y-1">
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-2">
                All sizes
              </p>
              {pool.map((v: any) => (
                <a
                  key={v.path}
                  href={v.path}
                  download={downloadName(v)}
                  className="block text-neutral-300 hover:text-neon-cyan underline decoration-neutral-600 hover:decoration-neon-cyan transition-colors"
                >
                  {v.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}