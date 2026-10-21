'use client';
import { useEffect, useState } from 'react';

export default function IntroScreen({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Start fading out after 2.8 seconds
    const fadeTimer = setTimeout(() => setFade(true), 2800);
    // Completely remove from DOM after 3.3 seconds
    const removeTimer = setTimeout(() => {
      setShow(false);
      onComplete();
    }, 3300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] bg-[#09090b] flex flex-col items-center justify-center transition-opacity duration-500 pointer-events-none ${
        fade ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="perspective-1000">
        <div className="intro-3d-wrapper flex items-center gap-6">
          
          {/* 3D Logo Box */}
          <div className="intro-3d-box logo-wrapper relative h-20 w-20 flex items-center justify-center bg-ink-950 p-2">
             <img 
               src="/logo.png" 
               alt="Wallvine Logo" 
               className="h-full w-full object-contain" 
             />
          </div>
          
          {/* New Text Effect */}
          <div className="overflow-hidden">
            <h1 className="intro-text-reveal text-6xl font-display font-black tracking-tighter text-white">
              Wallvine
            </h1>
          </div>
        </div>
      </div>
      
      {/* Loading Bar */}
      <div className="mt-10 h-[3px] w-56 bg-white/10 overflow-hidden rounded-full">
        <div className="intro-loading-bar h-full bg-accent" />
      </div>
    </div>
  );
}