'use client';

import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface VenomButtonProps {
  label: string;
  href?: string;
  variant?: 'venom' | 'red';
  onClick?: (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
}

export default function VenomButton({ label, href, variant = 'venom', onClick }: VenomButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const handlePointerEnter = () => {
    if (isReducedMotion) return;
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    if (isReducedMotion) return;
    setIsHovered(false);
  };

  const handleClick = (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (window.matchMedia('(pointer: coarse)').matches && !isReducedMotion) {
      setIsHovered(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsHovered(false), 1200);
    }
    if (onClick) onClick(e);
  };

  const tendrils = [
    { id: 1, x: 20, y: 0, length: 60, width: 12, type: 'top', delay: 0 },
    { id: 2, x: 60, y: 0, length: 40, width: 8, type: 'top', delay: 0.05 },
    { id: 3, x: 140, y: 0, length: 70, width: 14, type: 'top', delay: 0.1 },
    { id: 4, x: 180, y: 0, length: 50, width: 10, type: 'top', delay: 0.15 },
    { id: 5, x: 40, y: 64, length: 55, width: 10, type: 'bottom', delay: 0.02 },
    { id: 6, x: 90, y: 64, length: 35, width: 7, type: 'bottom', delay: 0.07 },
    { id: 7, x: 150, y: 64, length: 65, width: 12, type: 'bottom', delay: 0.12 },
  ];

  const content = (
    <>
      {/* The Gooey Filter SVG */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="gooey-effect">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" 
              result="gooey" 
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* The Liquid Layer */}
      <div 
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        style={{ filter: variant === 'venom' ? 'url(#gooey-effect)' : 'none' }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: variant === 'venom' 
              ? 'linear-gradient(180deg, #1a1a1a 0%, #050505 100%)' 
              : 'linear-gradient(180deg, #ff2a2a 0%, #b30000 100%)',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -4px 8px rgba(0,0,0,0.5)',
          }}
        />

        <AnimatePresence>
          {isHovered && variant === 'venom' && (
            <motion.div className="absolute inset-0">
              {tendrils.map((t) => (
                <motion.div
                  key={t.id}
                  className="absolute bg-black rounded-full"
                  style={{
                    width: t.width,
                    height: t.width,
                    left: t.x,
                    top: t.type === 'top' ? 0 : 'auto',
                    bottom: t.type === 'bottom' ? 0 : 'auto',
                  }}
                  initial={{ y: 0, scale: 0 }}
                  animate={{
                    y: t.type === 'top' ? -t.length : t.length,
                    scale: [1, 1.1, 0.9, 1],
                  }}
                  exit={{ y: 0, scale: 0 }}
                  transition={{
                    y: { type: 'spring', stiffness: 200, damping: 15, delay: t.delay },
                    scale: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: t.delay }
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gloss Overlay */}
      {variant === 'venom' && (
        <div className="absolute inset-0 rounded-full overflow-hidden z-10 pointer-events-none">
          <div className="absolute top-0 left-1 right-1 h-1/2 rounded-t-full bg-gradient-to-b from-white/30 to-transparent opacity-80" />
          <div className="absolute inset-0 rounded-full border border-white/20" />
          <div className="absolute bottom-0 left-1 right-1 h-1/3 rounded-b-full bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      )}

      {/* Red Shine Sweep */}
      {variant === 'red' && (
        <div className="absolute inset-0 rounded-full overflow-hidden z-10 pointer-events-none">
          <div className="absolute inset-0 rounded-full border border-white/20" />
          <motion.div 
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
            initial={{ left: '-100%' }}
            whileHover={{ left: '150%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Text */}
      <span className="relative z-20 text-white font-medium tracking-wide drop-shadow-md">
        {label}
      </span>
    </>
  );

  const className = [
    "relative flex items-center justify-center overflow-visible outline-none",
    "w-[180px] h-[54px] md:w-[220px] md:h-[64px]",
    "rounded-full transition-all duration-300",
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:ring-accent-main",
  ].join(' ');

  if (href) {
    return (
      <Link 
        href={href}
        aria-label={label}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      className={className}
    >
      {content}
    </button>
  );
}