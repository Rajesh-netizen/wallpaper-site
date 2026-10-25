'use client';

import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';

export type Tab = 'feed' | 'search' | 'favourites';

export default function BottomNav({
  tab,
  onChange,
  favouriteCount,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  favouriteCount: number;
}) {
  const items: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'feed',
      label: 'Feed',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      ),
    },
    {
      id: 'search',
      label: 'Search',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      ),
    },
    {
      id: 'favourites',
      label: 'Favourites',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
  ];

  // Fixed TypeScript typing for the easing array by asserting it as a tuple
  const navVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.4, 
        ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number], 
        staggerChildren: 0.08 
      } 
    },
  };

  return (
    <LazyMotion features={domAnimation}>
      <div 
        className="fixed bottom-6 left-0 right-0 z-50 mx-auto w-[calc(100%-2rem)] max-w-sm px-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <m.nav
          aria-label="Primary"
          /* THEME: Glass effect with surface background and border */
          className="w-full rounded-full border border-border bg-surface/80 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={navVariants}
          style={{ transform: 'translateZ(0)', willChange: 'transform', WebkitBackdropFilter: 'blur(24px)' }}
        >
          <ul className="flex items-center justify-between px-2 py-2">
            {items.map((item) => {
              const active = tab === item.id;
              return (
                <li key={item.id} className="relative flex-1">
                  <m.button
                    type="button"
                    onClick={() => onChange(item.id)}
                    aria-current={active ? 'page' : undefined}
                    aria-label={item.label}
                    whileTap={{ scale: 0.85 }}
                    className={[
                      'relative w-full flex items-center justify-center gap-2 py-3 rounded-full',
                      'transition-colors duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green',
                      active ? 'text-text' : 'text-text-muted hover:text-text',
                    ].join(' ')}
                  >
                    <AnimatePresence>
                      {active && (
                        <m.span
                          layoutId="nav-active-glass"
                          /* THEME: Active pill uses Gold soft background and border */
                          className="absolute inset-0 rounded-full bg-gold-soft border border-gold/30 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>

                    <m.span
                      className={[
                        'relative z-10',
                        active ? 'text-gold drop-shadow-[0_0_8px_rgba(201,169,110,0.6)]' : ''
                      ].join(' ')}
                      animate={active ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      {item.icon}
                    </m.span>

                    <AnimatePresence>
                      {active && (
                        <m.span
                          className="relative z-10 font-bold text-sm tracking-wide overflow-hidden whitespace-nowrap"
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 'auto', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          {item.label}
                        </m.span>
                      )}
                    </AnimatePresence>

                    {item.id === 'favourites' && favouriteCount > 0 && (
                      <m.span
                        /* THEME: Badges use Gold background and dark text */
                        className="absolute top-1.5 right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-gold text-bg text-[9px] font-semibold flex items-center justify-center z-20"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        {favouriteCount > 99 ? '99+' : favouriteCount}
                      </m.span>
                    )}
                  </m.button>
                </li>
              );
            })}
          </ul>
        </m.nav>
      </div>
    </LazyMotion>
  );
}