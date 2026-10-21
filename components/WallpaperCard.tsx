'use client';
import { useEffect, useRef, useState } from 'react';
import { useFavourites } from './useFavourites';
import { useModal, Portal } from './ModalContext';
import CropModal from './CropModal';

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
      window.setTimeout(() => { if (el) el.style.transition = ''; }, 340);
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
  const [downloads, setDownloads] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('wallvine_downloads');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data[wallpaper.slug]) setDownloads(data[wallpaper.slug]);
      } catch (e) {}
    }
  }, [wallpaper.slug]);

  const trackDownload = () => {
    const stored = localStorage.getItem('wallvine_downloads');
    let data: Record<string, number> = {};
    try { data = stored ? JSON.parse(stored) : {}; } catch (e) {}
    const newCount = (data[wallpaper.slug] || 0) + 1;
    data[wallpaper.slug] = newCount;
    localStorage.setItem('wallvine_downloads', JSON.stringify(data));
    setDownloads(newCount);
  };

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
  const downloadName = (v: any) => `${wallpaper.slug}-${v.width}x${v.height}.webp`;
  const originalExt = original?.path.split('.').pop() ?? 'webp';
  const originalName = `${wallpaper.slug}-original.${originalExt}`;

  async function shareImage() {
    const url = `${window.location.origin}${previewVariant.path}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: wallpaper.title, text: `Wallpaper: ${wallpaper.title}`, url });
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
      } catch { alert('Could not copy the link.'); }
    }
  }

  return (
    <>
      <div className="grid-card-wrapper rounded-card">
        <div
          ref={cardRef}
          className="group relative rounded-card overflow-hidden bg-ink-900 shadow-card transition-shadow duration-200 ease-out will-change-transform"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-card"
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
            onClick={(e) => { e.stopPropagation(); toggle(wallpaper.slug); }}
            className={`absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/70 opacity-0 group-hover:opacity-100 ${isFav ? 'opacity-100' : ''}`}
          >
            <svg viewBox="0 0 24 24" className={`h-4 w-4 ${isFav ? 'fill-accent stroke-accent' : 'fill-none stroke-white'}`} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-sm font-medium text-white truncate">{wallpaper.title}</p>
          </div>
        </div>
      </div>

      {open && (
        <Portal>
          <div
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up"
            role="dialog"
            aria-modal="true"
            onClick={() => setOpen(false)}
          >
            {/* Added glowing border to the modal */}
            <div
              ref={previewRef}
              className="bg-ink-950 border border-accent/30 shadow-[0_0_40px_rgba(16,185,129,0.15)] rounded-card max-w-sm w-full max-h-[90vh] overflow-y-auto will-change-transform"
              style={{ transformStyle: 'preserve-3d' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 p-5 pb-3">
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-lg truncate text-white">{wallpaper.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-neutral-400 font-mono">
                      {device} · {previewVariant.width} × {previewVariant.height}
                    </p>
                    {downloads > 0 && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded-sm">
                        {downloads} Download{downloads !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={shareImage} className="h-9 w-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
                    {copied ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg>
                    )}
                  </button>
                  <button onClick={() => setOpen(false)} className="h-9 w-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 text-xl transition-colors">×</button>
                </div>
              </div>

              <div className="px-5">
                <div className="rounded-card overflow-hidden bg-ink-800 border border-white/5">
                  <img src={previewVariant.path} alt="Preview" className="block w-full h-auto max-h-56 object-contain" draggable={false} />
                </div>
              </div>

              <div className="p-5 pt-4 space-y-2">
                {/* Filled Emerald Button with Glow */}
                <a
                  href={previewVariant.path}
                  download={downloadName(previewVariant)}
                  onClick={trackDownload}
                  className="block w-full text-center px-4 py-3 rounded-sm bg-accent text-black font-bold hover:bg-white transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                >
                  Download for my {device}
                </a>

                <button onClick={shareImage} className="w-full text-center px-4 py-2.5 rounded-sm text-sm font-medium border border-white/10 text-neutral-300 hover:bg-white/5 transition-colors">
                  {copied ? '✓ Link copied' : 'Send this wallpaper'}
                </button>

                {original && (
                  <button onClick={() => setCropOpen(true)} className="w-full text-center px-4 py-2.5 rounded-sm border border-accent/30 text-accent text-sm font-medium hover:bg-accent/10 transition-colors">
                    Crop it yourself
                  </button>
                )}

                <button onClick={() => toggle(wallpaper.slug)} className={`w-full text-center px-4 py-2 rounded-sm text-sm font-medium border transition-colors ${isFav ? 'border-accent text-accent bg-accent/10' : 'border-white/10 text-neutral-300 hover:bg-white/5'}`}>
                  {isFav ? '♥ In favourites' : '♡ Add to favourites'}
                </button>
              </div>

              <div className="px-5 pb-5">
                <p className="text-neutral-500 text-xs uppercase tracking-wider mb-2 font-mono">All sizes</p>
                <div className="text-sm space-y-1 max-h-40 overflow-y-auto pr-1">
                  {original && (
                    <a href={original.path} download={originalName} onClick={trackDownload} className="block text-accent hover:text-white underline decoration-accent/50 font-medium">
                      {original.label} — highest quality
                    </a>
                  )}
                  {[...pool].reverse().map((v: any) => (
                    <a key={v.path} href={v.path} download={downloadName(v)} onClick={trackDownload} className="block text-neutral-300 hover:text-accent underline decoration-neutral-600">
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
          <CropModal wallpaper={{ slug: wallpaper.slug, title: wallpaper.title }} srcUrl={original.path} onClose={() => setCropOpen(false)} />
        </Portal>
      )}
    </>
  );
}