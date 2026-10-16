'use client';
import { useEffect, useRef, useState } from 'react';
import { useFavourites } from './useFavourites';
import { useModal, Portal } from './ModalContext';
import CropModal from './CropModal';

/** 3D tilt on hover — instant tracking, smooth reset. */
function useTilt(
  ref: React.RefObject<HTMLDivElement | null>,
  divisor: number = 12
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (matchMedia('(pointer: coarse)').matches) return;

    let raf = 0;

    const move = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const { left, top, width, height } = el.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / divisor;
        const y = (e.clientY - top - height / 2) / divisor;
        el.style.transition = 'none';
        el.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg)`;
      });
    };

    const leave = () => {
      cancelAnimationFrame(raf);
      el.style.transition = 'transform 320ms cubic-bezier(0.2, 0.7, 0.2, 1)';
      el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
      window.setTimeout(() => {
        if (el) el.style.transition = '';
      }, 340);
    };

    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);

    return () => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
      cancelAnimationFrame(raf);
    };
  }, [ref, divisor]);
}

export default function WallpaperCard({ wallpaper, device }: any) {
  const { openId, setOpenId } = useModal();
  const detailId = `${wallpaper.slug}:detail`;
  const cropId = `${wallpaper.slug}:crop`;

  const open = openId === detailId;
  const cropOpen = openId === cropId;

  const setOpen = (v: boolean) => setOpenId(v ? detailId : null);
  const setCropOpen = (v: boolean) => setOpenId(v ? cropId : null);

  const { favourites, toggle } = useFavourites();
  const isFav = favourites.includes(wallpaper.slug);

  const [copied, setCopied] = useState(false);

  const pool = wallpaper.variants
    .filter((v: any) => v.device === device)
    .sort((a: any, b: any) => a.width - b.width);

  const original = wallpaper.variants.find((v: any) => v.device === 'original');

  const [previewVariant, setPreviewVariant] = useState<any>(
    pool.length ? pool[pool.length - 1] : null
  );

  useEffect(() => {
    if (pool.length === 0) return;
    const physicalW = window.screen.width * (window.devicePixelRatio || 1);
    const best =
      [...pool].reverse().find((v: any) => v.width <= physicalW * 1.15) ??
      pool[pool.length - 1];
    setPreviewVariant(best);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  const cardRef = useRef<HTMLDivElement>(null);
  useTilt(cardRef, 12);

  const previewRef = useRef<HTMLDivElement>(null);
  useTilt(previewRef, 20);

  if (pool.length === 0 || !previewVariant) return null;

  const thumb = pool[pool.length - 1];

  const downloadName = (v: any) =>
    `${wallpaper.slug}-${v.width}x${v.height}.webp`;

  const originalExt = original?.path.split('.').pop() ?? 'webp';
  const originalName = `${wallpaper.slug}-original.${originalExt}`;

  async function shareImage() {
    const url = `${window.location.origin}${previewVariant.path}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: wallpaper.title,
          text: `Wallpaper: ${wallpaper.title}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        alert('Could not copy the link. Copy manually:\n' + url);
      }
    }
  }

  return (
    <>
      {/* ---------- Grid card ---------- */}
      <div className="grid-card-wrapper rounded-card">
        <div
          ref={cardRef}
          className={[
            'group relative rounded-card overflow-hidden',
            'bg-ink-900 shadow-card',
            'transition-shadow duration-200 ease-out',
            'will-change-transform',
          ].join(' ')}
          style={{ transformStyle: 'preserve-3d' }}
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
              draggable={false}
            />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggle(wallpaper.slug);
            }}
            aria-label={
              isFav
                ? `Remove ${wallpaper.title} from favourites`
                : `Add ${wallpaper.title} to favourites`
            }
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
                isFav
                  ? 'fill-neon-pink stroke-neon-pink'
                  : 'fill-none stroke-white'
              }`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

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
      </div>

      {/* ---------- Modal ---------- */}
      {open && (
        <Portal>
          <div
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up"
            role="dialog"
            aria-modal="true"
            aria-label={`${wallpaper.title} options`}
            onClick={() => setOpen(false)}
          >
            <div
              ref={previewRef}
              className="bg-ink-900 neon-border rounded-card max-w-sm w-full shadow-card max-h-[90vh] overflow-y-auto will-change-transform"
              style={{ transformStyle: 'preserve-3d' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 p-5 pb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {wallpaper.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {device} · {previewVariant.width} × {previewVariant.height}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={shareImage}
                    aria-label={copied ? 'Link copied' : 'Send wallpaper link'}
                    title={copied ? 'Link copied!' : 'Send link'}
                    className={[
                      'h-9 w-9 rounded-full flex items-center justify-center',
                      'transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan',
                      copied
                        ? 'text-neon-cyan bg-neon-cyan/10 scale-110'
                        : 'text-neutral-400 hover:text-white hover:bg-white/10',
                    ].join(' ')}
                  >
                    {copied ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 2 11 13" />
                        <path d="M22 2 15 22l-4-9-9-4 20-7z" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="h-9 w-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 text-xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="px-5">
                <div className="rounded-card overflow-hidden bg-ink-800 border border-white/5">
                  <img
                    src={previewVariant.path}
                    alt={`${wallpaper.title} preview at ${previewVariant.width} × ${previewVariant.height}`}
                    className="block w-full h-auto max-h-56 object-contain"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              </div>

              <div className="p-5 pt-4 space-y-2">
                <a
                  href={previewVariant.path}
                  download={downloadName(previewVariant)}
                  className="block w-full text-center px-4 py-2.5 rounded-pill bg-neon-gradient text-ink-950 font-medium glow-gradient hover:-translate-y-0.5 transition-transform"
                >
                  Download for my {device}
                </a>

                <button
                  type="button"
                  onClick={shareImage}
                  className={[
                    'w-full text-center px-4 py-2.5 rounded-pill text-sm font-medium',
                    'border transition-colors duration-200',
                    copied
                      ? 'border-neon-cyan/60 text-neon-cyan bg-neon-cyan/10'
                      : 'border-white/15 text-neutral-300 hover:bg-white/5 hover:border-white/25',
                  ].join(' ')}
                >
                  {copied ? '✓ Link copied' : '🔗 Send this wallpaper'}
                </button>

                {original && (
                  <button
                    type="button"
                    onClick={() => setCropOpen(true)}
                    className="w-full text-center px-4 py-2.5 rounded-pill border border-neon-cyan/50 text-neon-cyan text-sm font-medium hover:bg-neon-cyan/10 transition-colors"
                  >
                    ✂ Crop it yourself
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggle(wallpaper.slug)}
                  className={[
                    'w-full text-center px-4 py-2 rounded-pill text-sm font-medium',
                    'border transition-colors duration-200',
                    isFav
                      ? 'border-neon-pink/60 text-neon-pink hover:bg-neon-pink/10'
                      : 'border-white/15 text-neutral-300 hover:bg-white/5 hover:border-white/25',
                  ].join(' ')}
                >
                  {isFav ? '♥ In favourites' : '♡ Add to favourites'}
                </button>
              </div>

              <div className="px-5 pb-5">
                <p className="text-neutral-400 text-xs uppercase tracking-wider mb-2">
                  All sizes
                </p>
                <div className="text-sm space-y-1 max-h-40 overflow-y-auto pr-1">
                  {original && (
                    <a
                      href={original.path}
                      download={originalName}
                      className="block text-neon-cyan hover:text-white underline decoration-neon-cyan/50 hover:decoration-neon-cyan transition-colors font-medium"
                    >
                      {original.label} — highest quality
                    </a>
                  )}

                  {[...pool].reverse().map((v: any) => (
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
          </div>
        </Portal>
      )}

      {cropOpen && original && (
        <Portal>
          <CropModal
            wallpaper={{ slug: wallpaper.slug, title: wallpaper.title }}
            srcUrl={original.path}
            onClose={() => setCropOpen(false)}
          />
        </Portal>
      )}
    </>
  );
}