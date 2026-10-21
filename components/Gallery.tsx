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

  useEffect(() => { setIsClient(true); }, []);
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
    const filtered = category === 'all' ? withDevice : withDevice.filter((w) => w.category === category);
    return isClient ? shuffle(filtered) : filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withDevice, category, seed, isClient]);

  const searchList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return withDevice;
    return withDevice.filter((w) => w.title.toLowerCase().includes(q) || w.slug.toLowerCase().includes(q));
  }, [withDevice, query]);

  const favouritesList = useMemo(
    () => withDevice.filter((w) => favourites.includes(w.slug)),
    [withDevice, favourites]
  );

  const list = tab === 'feed' ? feedList : tab === 'search' ? searchList : favouritesList;

  return (
    <section id="latest" className="relative w-full pb-10 scroll-mt-16 overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none"><CubeBackground /></div>
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(5,5,10,0.85) 100%)' }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div key={`${tab}-${category}`} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 border-b border-white/10 pb-4">
          <div>
            <h2 className="blur-fade-in blur-fade-in-1 text-2xl font-bold tracking-tight">
              {tab === 'feed' && (category === 'all' ? 'Latest Additions' : labelFor(category))}
              {tab === 'search' && 'Search Results'}
              {tab === 'favourites' && 'Saved Wallpapers'}
            </h2>
            <p className="blur-fade-in blur-fade-in-2 text-sm text-neutral-400 mt-1">
              {tab === 'feed' && category === 'all' && 'Freshly added and randomly sorted.'}
              {tab === 'feed' && category !== 'all' && `Browsing ${labelFor(category)} collection.`}
              {tab === 'search' && 'Finding the perfect match.'}
              {tab === 'favourites' && (favourites.length === 0 ? 'Nothing saved yet.' : `${favourites.length} saved.`)}
            </p>
          </div>

          <div className="blur-fade-in blur-fade-in-3 flex items-center gap-3 self-start">
            {tab === 'feed' && (
              <button
                type="button"
                onClick={() => setSeed((s) => s + 1)}
                className="group relative px-4 py-1.5 rounded-md text-xs font-medium border border-white/10 text-neutral-300 hover:text-white transition-all duration-300 hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] bg-ink-800 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                <span className="relative z-10">Shuffle</span>
              </button>
            )}

            {/* NEW GLOWING TOGGLE SWITCH */}
            <div className="relative flex items-center p-1 bg-ink-900 border border-white/10 rounded-full shadow-inner">
              {/* Sliding glowing background */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-neon-cyan/20 border border-neon-cyan/50 shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-transform duration-300 ease-out ${
                  device === 'laptop' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                }`} 
              />
              
              <button
                onClick={() => pickDevice('phone')}
                className={`relative z-10 px-4 py-1.5 text-xs font-semibold capitalize transition-colors duration-300 ${
                  device === 'phone' ? 'text-neon-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Phone
              </button>
              <button
                onClick={() => pickDevice('laptop')}
                className={`relative z-10 px-4 py-1.5 text-xs font-semibold capitalize transition-colors duration-300 ${
                  device === 'laptop' ? 'text-neon-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Laptop
              </button>
            </div>
          </div>
        </div>

        {list.length === 0 ? (
          <p className="text-neutral-400 py-16 text-center">No wallpapers found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {list.map((w, i) => (
              <div key={w.slug} className="blur-fade-in" style={{ animationDelay: `${Math.min(i * 40, 600)}ms` }}>
                <WallpaperCard wallpaper={w} device={device} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}