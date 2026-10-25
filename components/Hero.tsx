'use client';

import Link from 'next/link';
import { AuroraMesh } from './ui/aurora-mesh';
import { m, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { useRef } from 'react';

const MotionLink = m.create(Link);

function SymbioteButton({ href, children }: { href: string, children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  
  // Raw pointer tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Dragging physics
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const dragVelocity = useMotionValue(0);

  // Smooth springs for the "Goo" effect
  const springConfig = { stiffness: 300, damping: 20, mass: 0.8 };
  const smoothX = useSpring(dragX, springConfig);
  const smoothY = useSpring(dragY, springConfig);
  
  // Rotation based on drag X
  const rotate = useTransform(smoothX, [-100, 100], [-15, 15]);
  
  // The tendrils only stretch vertically based on the drag Y
  const stretch = useSpring(useTransform(dragY, [0, 50], [0, 1.5]), { stiffness: 200, damping: 15 });

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!ref.current) return;
    ref.current.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!ref.current) return;
    dragX.set(0);
    dragY.set(0);
    ref.current.releasePointerCapture(e.pointerId);
  };

  // Dynamically calculate the CSS radial gradient based on the mouse position
  const background = useMotionTemplate`
    radial-gradient(
      circle 120px at ${mouseX}px ${mouseY}px,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0) 100%
    ),
    radial-gradient(circle at 50% -20%, #222 0%, #000 60%, #050505 100%)
  `;

  return (
    <MotionLink 
      href={href} 
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="venom-container cursor-grab active:cursor-grabbing inline-block group"
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.4}
      onDrag={(e, info) => {
        dragX.set(info.offset.x);
        dragY.set(info.offset.y);
      }}
      onDragEnd={() => {
        dragX.set(0);
        dragY.set(0);
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 
        The Tendrils. 
        They have an absolute position, and their height is controlled by the "stretch" spring.
        They only scale up when dragging.
      */}
      <div className="venom-tendrils">
        <m.div className="tendril" style={{ left: '20%', rotate: useTransform(rotate, r => r * -1), scaleY: stretch, originY: 0 }} />
        <m.div className="tendril" style={{ left: '40%', rotate: useTransform(rotate, r => r * -0.5), scaleY: stretch, originY: 0 }} />
        <m.div className="tendril" style={{ left: '50%', rotate: useTransform(rotate, r => r * 0.5), scaleY: stretch, originY: 0 }} />
        <m.div className="tendril" style={{ left: '60%', rotate: useTransform(rotate, r => r * 0.5), scaleY: stretch, originY: 0 }} />
        <m.div className="tendril" style={{ left: '80%', rotate: useTransform(rotate, r => r * 1), scaleY: stretch, originY: 0 }} />
      </div>

      {/* The main button */}
      <m.div
        className="venom-btn flex items-center justify-center gap-3 px-10 py-5 relative overflow-hidden"
        style={{ 
          x: smoothX, 
          y: smoothY, 
          rotate,
          background 
        }}
      >
        <span className="relative z-20 text-white font-bold font-display text-lg tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors group-hover:text-green-100">
          {children}
        </span>
        <svg 
          className="relative z-20 w-5 h-5 text-white/80 group-hover:text-white transition-colors" 
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </m.div>
    </MotionLink>
  );
}

// --- HERO SECTION ---
export default function Hero() {
  const points = [
    { title: "Perfectly Optimized", desc: "Carefully cropped and color-corrected." },
    { title: "Exact Resolution", desc: "Made to fit your phone and laptop." },
    { title: "Zero Distractions", desc: "No ads, watermarks, or fake buttons." },
    { title: "Pure Art", desc: "Just beautiful wallpapers, nothing else." }
  ];

  return (
    <AuroraMesh className="min-h-[500px] md:min-h-[700px] flex items-center bg-bg">
      <div className="relative w-full mx-auto max-w-6xl px-6 md:px-12 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            <p className="hero-eyebrow text-xs uppercase tracking-[0.3em] mb-6 font-semibold font-display text-glow">
              Wallvine / Vol. 01
            </p>

            <div className="reveal-container">
              <h1 className="hero-headline text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter leading-[0.95] text-shimmer">
                Wallpapers that actually fit your screen.
              </h1>
            </div>

            <div className="hero-cta mt-16 flex items-center gap-6">
              <SymbioteButton href="#latest">
                View Collection
              </SymbioteButton>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6 lg:pl-10 lg:border-l border-border p-6 rounded-xl bg-surface border border-border">
            {points.map((p, i) => (
              <div 
                key={i} 
                className="hero-point flex flex-col gap-1"
                style={{ animationDelay: `${0.8 + (i * 0.15)}s` }}
              >
                <span className="font-display text-xl font-bold text-text flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  {p.title}
                </span>
                <span className="text-text-muted text-sm leading-relaxed pl-3.5">
                  {p.desc}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </AuroraMesh>
  );
}