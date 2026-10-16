'use client';
import { useMemo, useState, useEffect } from 'react';
import WallpaperCard from './WallpaperCard';
import { useFavourites } from './useFavourites';
import CubeBackground from './CubeBackground';
import type { Tab } from './BottomNav';
import { CATEGORIES, type CategorySlug } from './CategoryMenu';

type Device = 'phone' | 'laptop';

function detect(): Device {
  if (typeof window === 'undefined') return 'laptop';
  const w = window.innerWidth;
  const touch = matchMedia('(pointer: coarse)').matches;
  return w < 768 || (touch && w < 1024) ? 'phone' : 'laptop';
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function labelFor(slug: CategorySlug) {
  if (slug === 'all') return 'All';
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? 'All';
}

export default function Gallery({
  wallpapers,
  tab,
  query,
  category,
}: {
  wallpapers: any[];
  tab: Tab;
  query: string;
  category: CategorySlug;
}) {
  const [device, setDevice] = useState<Device>('laptop');
  const [seed, setSeed] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const { favourites } = useFavourites();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('device') as Device | null;
    setDevice(saved ?? detect());
  }, []);

  function pickDevice(d: Device) {
    setDevice(d);
    localStorage.setItem('device', d);
  }

  const withDevice = useMemo(
    () => wallpapers.filter((w) => w.variants.some((v: any) => v.device === device)),
    [wallpapers, device]
  );

  const feedList = useMemo(() => {
    const filtered =
      category === 'all'
        ? withDevice
        : withDevice.filter((w) => w.category === category);
    // Only shuffle on the client — Math.random() during SSR causes
    // a hydration mismatch because server and client pick different orders.
    return isClient ? shuffle(filtered) : filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withDevice, category, seed, isClient]);

  const searchList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return withDevice;
    return withDevice.filter(
      (w) => w.title.toLowerCase().includes(q) || w.slug.toLowerCase().includes(q)
    );
  }, [withDevice, query]);

  const favouritesList = useMemo(
    () => withDevice.filter((w) => favourites.includes(w.slug)),
    [withDevice, favourites]
  );

  const list = tab === 'feed' ? feedList : tab === 'search' ? searchList : favouritesList;

  return (
    <section
      id="latest"
      className="relative w-full pb-20 scroll-mt-16 overflow-hidden"
    >
      {/* ---------- Cube lattice background ---------- */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <CubeBackground />
      </div>

      {/* ---------- Fade edges to black so it doesn't look boxy ---------- */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(5,5,10,0.85) 100%)',
        }}
      />

      {/* ---------- Content wrapper ---------- */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header row — blur-fade on every tab/category change */}
        <div
          key={`${tab}-${category}`}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6"
        >
          <div>
            <h2 className="blur-fade-in blur-fade-in-1 text-2xl font-semibold tracking-tight">
              {tab === 'feed' && (category === 'all' ? 'Feed' : labelFor(category))}
              {tab === 'search' && 'Search'}
              {tab === 'favourites' && 'Favourites'}
            </h2>
            <p className="blur-fade-in blur-fade-in-2 text-sm text-neutral-300 mt-1">
              {tab === 'feed' && category === 'all' && 'Random picks, reshuffled every visit.'}
              {tab === 'feed' && category !== 'all' && `Showing ${labelFor(category)} wallpapers.`}
              {tab === 'search' && 'Find a wallpaper by name.'}
              {tab === 'favourites' &&
                (favourites.length === 0
                  ? 'Tap the heart on any wallpaper to save it here.'
                  : `${favourites.length} saved.`)}
            </p>
          </div>

          <div className="blur-fade-in blur-fade-in-3 flex items-center gap-3 self-start">
            {tab === 'feed' && (
              <button
                type="button"
                onClick={() => setSeed((s) => s + 1)}
                className="px-4 py-2 rounded-pill text-sm font-medium border border-white/10 text-neutral-200
                           hover:bg-white/5 hover:border-white/25 hover:text-white
                           active:translate-y-[1px]
                           transition-all duration-200
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
              >
                ↻ Reshuffle
              </button>
            )}

            <div
              role="tablist"
              aria-label="Device"
              className="inline-flex p-1 rounded-pill bg-ink-800 border border-white/10"
            >
              {(['phone', 'laptop'] as Device[]).map((d) => {
                const active = device === d;
                return (
                  <button
                    key={d}
                    role="tab"
                    aria-selected={active}
                    onClick={() => pickDevice(d)}
                    className={[
                      'px-4 py-1.5 text-sm rounded-pill capitalize transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan',
                      active
                        ? 'bg-white/15 text-white shadow-glow-cyan'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5',
                    ].join(' ')}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grid */}
        {list.length === 0 ? (
          <p className="text-neutral-400 py-16 text-center">
            {tab === 'feed' && category !== 'all' &&
              `No ${device} wallpapers in “${labelFor(category)}” yet.`}
            {tab === 'feed' && category === 'all' && `No ${device} wallpapers yet.`}
            {tab === 'search' &&
              (query ? `No results for “${query}”.` : `No ${device} wallpapers to search.`)}
            {tab === 'favourites' &&
              (favourites.length === 0
                ? 'No favourites yet — tap a heart to save one.'
                : `None of your favourites have a ${device} version.`)}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {list.map((w, i) => (
              <div
                key={w.slug}
                className="blur-fade-in"
                style={{ animationDelay: `${Math.min(i * 40, 600)}ms` }}
              >
                <WallpaperCard wallpaper={w} device={device} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}