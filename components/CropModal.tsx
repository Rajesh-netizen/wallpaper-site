'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

type Aspect = 'phone' | 'laptop' | 'free';

const ASPECTS: { id: Aspect; label: string; ratio: number | null; w: number; h: number }[] = [
  { id: 'phone',  label: 'Phone 9:16',  ratio: 9 / 16,  w: 1440, h: 2560 },
  { id: 'laptop', label: 'Laptop 16:9', ratio: 16 / 9,  w: 2560, h: 1440 },
  { id: 'free',   label: 'Free',        ratio: null,    w: 0,    h: 0 },
];

type Rect = { x: number; y: number; w: number; h: number };

export default function CropModal({
  wallpaper,
  srcUrl,
  onClose,
}: {
  wallpaper: { slug: string; title: string };
  srcUrl: string;
  onClose: () => void;
}) {
  const [aspect, setAspect] = useState<Aspect>('phone');
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [crop, setCrop] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [busy, setBusy] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    mode: 'move' | 'nw' | 'ne' | 'sw' | 'se';
    startX: number;
    startY: number;
    startCrop: Rect;
  } | null>(null);

  // Load image dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = srcUrl;
  }, [srcUrl]);

  // Reset crop to a sensible default when aspect or image changes
  useEffect(() => {
    if (!imgSize) return;
    const ratio = ASPECTS.find((a) => a.id === aspect)?.ratio ?? imgSize.w / imgSize.h;

    let w = imgSize.w;
    let h = w / ratio;
    if (h > imgSize.h) {
      h = imgSize.h;
      w = h * ratio;
    }

    setCrop({
      x: Math.round((imgSize.w - w) / 2),
      y: Math.round((imgSize.h - h) / 2),
      w: Math.round(w),
      h: Math.round(h),
    });
  }, [imgSize, aspect]);

  // ---------- drag setup ----------
  const onPointerDown = useCallback(
    (mode: 'move' | 'nw' | 'ne' | 'sw' | 'se') =>
      (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        dragRef.current = {
          mode,
          startX: e.clientX,
          startY: e.clientY,
          startCrop: { ...crop },
        };
      },
    [crop]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current;
      if (!d || !imgSize || !stageRef.current) return;

      const stageRect = stageRef.current.getBoundingClientRect();
      const scale = imgSize.w / stageRect.width;

      const dx = (e.clientX - d.startX) * scale;
      const dy = (e.clientY - d.startY) * scale;

      const minSize = Math.max(100, imgSize.w * 0.08);
      const ratio = ASPECTS.find((a) => a.id === aspect)?.ratio ?? null;

      let next: Rect = { ...d.startCrop };

      if (d.mode === 'move') {
        next.x = clamp(d.startCrop.x + dx, 0, imgSize.w - next.w);
        next.y = clamp(d.startCrop.y + dy, 0, imgSize.h - next.h);
      } else {
        let x1 = d.startCrop.x;
        let y1 = d.startCrop.y;
        let x2 = d.startCrop.x + d.startCrop.w;
        let y2 = d.startCrop.y + d.startCrop.h;

        if (d.mode === 'nw') { x1 += dx; y1 += dy; }
        if (d.mode === 'ne') { x2 += dx; y1 += dy; }
        if (d.mode === 'sw') { x1 += dx; y2 += dy; }
        if (d.mode === 'se') { x2 += dx; y2 += dy; }

        if (x2 - x1 < minSize) {
          if (d.mode.includes('w')) x1 = x2 - minSize;
          else x2 = x1 + minSize;
        }
        if (y2 - y1 < minSize) {
          if (d.mode.includes('n')) y1 = y2 - minSize;
          else y2 = y1 + minSize;
        }

        x1 = Math.max(0, x1);
        y1 = Math.max(0, y1);
        x2 = Math.min(imgSize.w, x2);
        y2 = Math.min(imgSize.h, y2);

        next = {
          x: Math.round(x1),
          y: Math.round(y1),
          w: Math.round(x2 - x1),
          h: Math.round(y2 - y1),
        };

        if (ratio) {
          next = fitRectToAspect(next, ratio);
          next.x = clamp(next.x, 0, imgSize.w - next.w);
          next.y = clamp(next.y, 0, imgSize.h - next.h);
        }
      }

      setCrop(next);
    },
    [aspect, imgSize]
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  }, []);

  // ---------- download the crop ----------
  const downloadCrop = useCallback(async () => {
    if (!imgSize || !crop.w || !crop.h) return;
    setBusy(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error('load failed'));
        img.src = srcUrl;
      });

      const target = ASPECTS.find((a) => a.id === aspect);
      let outW = crop.w;
      let outH = crop.h;
      if (target && target.w) {
        outW = target.w;
        outH = target.h;
      }

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no canvas ctx');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, outW, outH);

      const blob: Blob | null = await new Promise((res) =>
        canvas.toBlob((b) => res(b), 'image/webp', 0.95)
      );
      if (!blob) throw new Error('toBlob failed');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${wallpaper.slug}-${aspect}-${outW}x${outH}.webp`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Could not generate the crop. Try again.');
    } finally {
      setBusy(false);
    }
  }, [crop, imgSize, aspect, srcUrl, wallpaper.slug]);

  // ---------- ESC closes ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-up"
      role="dialog"
      aria-modal="true"
      aria-label={`Crop ${wallpaper.title}`}
      onClick={onClose}
    >
      {/* Added glowing emerald border to match the main preview modal */}
      <div
        className="bg-ink-950 border border-accent/30 shadow-[0_0_40px_rgba(16,185,129,0.15)] rounded-card w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-4 p-5 border-b border-white/10">
          <h3 className="font-display font-bold text-lg text-white truncate">{wallpaper.title} — crop</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-400 hover:text-white text-xl leading-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
          >
            ×
          </button>
        </div>

        {/* aspect picker */}
        <div className="flex gap-2 p-5 pb-2">
          {ASPECTS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAspect(a.id)}
              className={[
                'px-4 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                aspect === a.id
                  ? 'bg-accent text-black font-bold'
                  : 'bg-ink-900 border border-white/10 text-neutral-300 hover:text-white hover:border-white/30',
              ].join(' ')}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* crop stage */}
        <div className="p-5 flex justify-center">
          <div
            ref={stageRef}
            className="relative select-none overflow-hidden rounded-card bg-black touch-none inline-block max-w-full"
            style={{ maxHeight: '60vh' }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {imgSize ? (
              <>
                <img
                  src={srcUrl}
                  alt=""
                  draggable={false}
                  className="block pointer-events-none select-none"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '60vh',
                    width: 'auto',
                    height: 'auto',
                  }}
                />

                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute bg-black/60"
                    style={{
                      left: 0, right: 0, top: 0,
                      height: `${(crop.y / imgSize.h) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute bg-black/60"
                    style={{
                      left: 0, right: 0, bottom: 0,
                      height: `${((imgSize.h - crop.y - crop.h) / imgSize.h) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute bg-black/60"
                    style={{
                      left: 0,
                      top: `${(crop.y / imgSize.h) * 100}%`,
                      width: `${(crop.x / imgSize.w) * 100}%`,
                      height: `${(crop.h / imgSize.h) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute bg-black/60"
                    style={{
                      right: 0,
                      top: `${(crop.y / imgSize.h) * 100}%`,
                      width: `${((imgSize.w - crop.x - crop.w) / imgSize.w) * 100}%`,
                      height: `${(crop.h / imgSize.h) * 100}%`,
                    }}
                  />
                </div>

                <div
                  className="absolute cursor-move touch-none"
                  style={{
                    left: `${(crop.x / imgSize.w) * 100}%`,
                    top: `${(crop.y / imgSize.h) * 100}%`,
                    width: `${(crop.w / imgSize.w) * 100}%`,
                    height: `${(crop.h / imgSize.h) * 100}%`,
                  }}
                  onPointerDown={onPointerDown('move')}
                >
                  <div className="absolute inset-0 border-2 border-accent rounded-sm pointer-events-none shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <Handle onDown={onPointerDown('nw')} pos="nw" />
                  <Handle onDown={onPointerDown('ne')} pos="ne" />
                  <Handle onDown={onPointerDown('sw')} pos="sw" />
                  <Handle onDown={onPointerDown('se')} pos="se" />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center text-neutral-400 text-sm p-12 font-mono">
                Loading image…
              </div>
            )}
          </div>
        </div>

        {/* footer buttons with new glowing styling */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-5 border-t border-white/10">
          <a
            href={srcUrl}
            download={`${wallpaper.slug}-original`}
            className="flex-1 text-center px-4 py-3 rounded-sm border border-white/20 text-sm font-medium text-white hover:bg-white/10 hover:border-white/40 transition-colors"
          >
            Download original
          </a>
          <button
            onClick={downloadCrop}
            disabled={busy || !imgSize}
            className="flex-1 px-4 py-3 rounded-sm bg-accent text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:bg-white disabled:opacity-50 disabled:shadow-none"
          >
            {busy ? 'Preparing…' : 'Download crop'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= Sub-components ================= */

function Handle({
  onDown,
  pos,
}: {
  onDown: (e: React.PointerEvent) => void;
  pos: 'nw' | 'ne' | 'sw' | 'se';
}) {
  const cls = {
    nw: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
    ne: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
    sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
    se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
  }[pos];

  return (
    <div
      onPointerDown={onDown}
      className={`absolute h-5 w-5 rounded-full bg-accent border-2 border-black touch-none shadow-md ${cls}`}
    />
  );
}

/* ================= Helpers ================= */

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function fitRectToAspect(rect: Rect, ratio: number): Rect {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  let w = rect.w;
  let h = w / ratio;
  if (h > rect.h) {
    h = rect.h;
    w = h * ratio;
  }
  return {
    x: Math.round(cx - w / 2),
    y: Math.round(cy - h / 2),
    w: Math.round(w),
    h: Math.round(h),
  };
}