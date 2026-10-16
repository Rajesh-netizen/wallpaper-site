'use client';
import { useEffect, useRef } from 'react';

/**
 * Lightweight sparkle field — falls downward from under the Wallvine logo.
 * Pure Canvas 2D, no dependencies. Pink/purple/cyan palette.
 * Respects prefers-reduced-motion.
 */
export default function LogoSparkles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const COLORS = ['#ff3ea5', '#a855f7', '#22d3ee'];

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;
    };

    let particles: Particle[] = [];

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(): Particle {
      // Particles fall from the top downward
      const x = Math.random() * W;
      const y = Math.random() * 6;
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.25,
        vy: 0.15 + Math.random() * 0.25,
        size: 0.6 + Math.random() * 1.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        maxLife: 90 + Math.random() * 60,
      };
    }

    // Pre-fill so the effect is alive at page load
    for (let i = 0; i < 40; i++) {
      const p = spawn();
      p.life = Math.random() * p.maxLife;
      p.y = Math.random() * H;
      particles.push(p);
    }

    let raf = 0;
    let visible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    function frame() {
      raf = requestAnimationFrame(frame);
      if (!visible || !canvas || !ctx) return;

      ctx.clearRect(0, 0, W, H);

      // Keep the field alive
      if (particles.length < 55) {
        particles.push(spawn());
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Alpha: fade in, hold, fade out
        const t = p.life / p.maxLife;
        let alpha: number;
        if (t < 0.15) alpha = t / 0.15;
        else if (t > 0.7) alpha = 1 - (t - 0.7) / 0.3;
        else alpha = 1;

        alpha *= 0.85;

        // Draw with a soft glow
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Soft halo
        ctx.globalAlpha = alpha * 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;

        // Remove particles that fall below the canvas or expire
        if (p.life >= p.maxLife || p.y > H + 5) {
          particles.splice(i, 1);
        }
      }

      ctx.globalCompositeOperation = 'source-over';
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (!prefersReduced) {
      frame();
    } else {
      frame();
      cancelAnimationFrame(raf);
      raf = 0;
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute left-0 right-0 pointer-events-none"
      style={{
        bottom: '-14px',
        height: '44px',
        width: '100%',
        maskImage:
          'radial-gradient(ellipse 80% 100% at 50% 100%, black 30%, transparent 80%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 80% 100% at 50% 100%, black 30%, transparent 80%)',
      }}
    />
  );
}