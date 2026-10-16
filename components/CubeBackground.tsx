'use client';
import { useEffect, useRef } from 'react';

/**
 * Cursor-responsive 3D cube lattice behind the Feed section.
 * Pink/purple/cyan palette, on a near-black backdrop.
 * Responds to mouse on desktop and touch on mobile.
 * Respects prefers-reduced-motion.
 */
export default function CubeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- setup ----------
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    const SPACING = 70;
    let points: { x: number; y: number; z: number; baseX: number; baseY: number }[] = [];

    // Palettes
    const PINK = '255,62,165';
    const PURPLE = '168,85,247';
    const CYAN = '34,211,238';

    // Cursor influence
    let mx = 0;
    let my = 0;
    let targetMx = 0;
    let targetMy = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(W / SPACING) + 1;
      rows = Math.ceil(H / SPACING) + 1;

      points = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const baseX = c * SPACING;
          const baseY = r * SPACING;
          points.push({
            x: baseX,
            y: baseY,
            z: 0,
            baseX,
            baseY,
          });
        }
      }
    }

    // ---------- interaction ----------
    function setTargetFromClient(clientX: number, clientY: number) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      targetMx = (clientX - rect.left - rect.width / 2) / (rect.width / 2);
      targetMy = (clientY - rect.top - rect.height / 2) / (rect.height / 2);
      // clamp
      targetMx = Math.max(-1, Math.min(1, targetMx));
      targetMy = Math.max(-1, Math.min(1, targetMy));
    }

    const onMouseMove = (e: MouseEvent) => setTargetFromClient(e.clientX, e.clientY);
    const onMouseLeave = () => {
      targetMx = 0;
      targetMy = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setTargetFromClient(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => {
      targetMx = 0;
      targetMy = 0;
    };

    // Pause when off-screen
    let visible = true;
    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // ---------- animation ----------
    let t = 0;

    function frame() {
      raf = requestAnimationFrame(frame);
      if (!visible || !canvas || !ctx) return;

      // ease cursor
      mx += (targetMx - mx) * 0.08;
      my += (targetMy - my) * 0.08;

      t += 0.008;

      ctx.clearRect(0, 0, W, H);

      // ---------- compute transformed points ----------
      const tiltX = my * 0.35; // rotation around X (from cursor Y)
      const tiltY = mx * 0.35; // rotation around Y (from cursor X)

      const cosX = Math.cos(tiltX);
      const sinX = Math.sin(tiltX);
      const cosY = Math.cos(tiltY);
      const sinY = Math.sin(tiltY);

      const cx = W / 2;
      const cy = H / 2;

      const transformed: { sx: number; sy: number; depth: number; alpha: number }[] = [];

      for (const p of points) {
        // offset from center
        const ox = p.baseX - cx;
        const oy = p.baseY - cy;

        // subtle continuous wave motion
        const wave = Math.sin((p.baseX + p.baseY) * 0.008 + t * 2) * 10;
        const wz = wave;

        // 3D point (x, y, z)
        let x = ox;
        let y = oy;
        let z = wz;

        // rotate around Y axis
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        x = x1;
        z = z1;

        // rotate around X axis
        const y1 = y * cosX - z * sinX;
        const z2 = y * sinX + z * cosX;
        y = y1;
        z = z2;

        // perspective projection
        const focal = 700;
        const depth = z + focal;
        const scale = focal / Math.max(depth, 1);

        const sx = cx + x * scale;
        const sy = cy + y * scale;

        // alpha varies with depth
        const alpha = Math.max(0.05, Math.min(0.85, 0.5 + z / 400));

        transformed.push({ sx, sy, depth: z, alpha });
      }

      // ---------- draw connections ----------
      ctx.lineWidth = 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const p = transformed[idx];
          if (!p) continue;

          // color based on position: pink → purple → cyan horizontally
          const colorMix = c / Math.max(cols - 1, 1);
          let rgb: string;
          if (colorMix < 0.5) {
            const k = colorMix * 2;
            rgb = blend(PINK, PURPLE, k);
          } else {
            const k = (colorMix - 0.5) * 2;
            rgb = blend(PURPLE, CYAN, k);
          }

          // connect to right neighbor
          if (c < cols - 1) {
            const pr = transformed[idx + 1];
            if (pr) {
              ctx.strokeStyle = `rgba(${rgb},${Math.min(p.alpha, pr.alpha) * 0.35})`;
              ctx.beginPath();
              ctx.moveTo(p.sx, p.sy);
              ctx.lineTo(pr.sx, pr.sy);
              ctx.stroke();
            }
          }

          // connect to bottom neighbor
          if (r < rows - 1) {
            const pb = transformed[idx + cols];
            if (pb) {
              ctx.strokeStyle = `rgba(${rgb},${Math.min(p.alpha, pb.alpha) * 0.35})`;
              ctx.beginPath();
              ctx.moveTo(p.sx, p.sy);
              ctx.lineTo(pb.sx, pb.sy);
              ctx.stroke();
            }
          }

          // draw point
          const dotSize = Math.max(0.6, 1.6 * (p.alpha));
          ctx.fillStyle = `rgba(${rgb},${p.alpha * 0.7})`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function blend(a: string, b: string, k: number) {
      const [ar, ag, ab] = a.split(',').map(Number);
      const [br, bg, bb] = b.split(',').map(Number);
      const r = Math.round(ar + (br - ar) * k);
      const g = Math.round(ag + (bg - ag) * k);
      const bl = Math.round(ab + (bb - ab) * k);
      return `${r},${g},${bl}`;
    }

    // ---------- lifecycle ----------
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    if (!prefersReduced) {
      frame();
    } else {
      // Draw one static frame
      frame();
      cancelAnimationFrame(raf);
      raf = 0;
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}