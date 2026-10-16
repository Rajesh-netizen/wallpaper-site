'use client';

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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-ink-950"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <ul className="mx-auto max-w-md grid grid-cols-3">
        {items.map((item) => {
          const active = tab === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
                className={[
                  'relative w-full flex flex-col items-center gap-0.5 py-2',
                  'text-[10px] font-medium tracking-wide uppercase',
                  'transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan rounded-lg',
                  active
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-neutral-100',
                ].join(' ')}
              >
                <span
                  className={[
                    'transition-all duration-200',
                    active
                      ? 'text-neon-pink drop-shadow-[0_0_8px_rgba(255,62,165,0.6)]'
                      : '',
                  ].join(' ')}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>

                {item.id === 'favourites' && favouriteCount > 0 && (
                  <span
                    className="absolute top-1 right-[calc(50%-22px)] min-w-[16px] h-[16px] px-1
                               rounded-full bg-neon-pink text-[9px] font-semibold text-ink-950
                               flex items-center justify-center"
                  >
                    {favouriteCount > 99 ? '99+' : favouriteCount}
                  </span>
                )}

                {active && (
                  <span
                    aria-hidden
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8
                               rounded-full bg-neon-gradient"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}