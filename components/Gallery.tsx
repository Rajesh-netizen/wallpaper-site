'use client';
import { useMemo, useState, useEffect } from 'react';
import WallpaperCard from './WallpaperCard';
import { useFavourites } from './useFavourites';
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
    <section id="latest" className="relative w-full pb-10 scroll-mt-16 overflow-hidden bg-ink-950">
      {/* Cube background removed for performance */}
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 pt-8 sm:pt-16 pb-24">
        <div key={`${tab}-${category}`} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-6">
          <div>
            <h2 className="blur-fade-in blur-fade-in-1 text-3xl font-display font-bold tracking-tight text-white">
              {tab === 'feed' && (category === 'all' ? 'Recent uploads' : labelFor(category))}
              {tab === 'search' && 'Search Results'}
              {tab === 'favourites' && 'Saved Art'}
            </h2>
            <p className="blur-fade-in blur-fade-in-2 text-sm text-neutral-400 mt-2 font-mono">
              {tab === 'feed' && category === 'all' && 'A personal collection, updated regularly.'}
              {tab === 'feed' && category !== 'all' && `Viewing all ${labelFor(category)} pieces.`}
              {tab === 'search' && 'Matches found for your search.'}
              {tab === 'favourites' && (favourites.length === 0 ? 'Nothing saved yet.' : `${favourites.length} pieces saved.`)}
            </p>
          </div>

          <div className="blur-fade-in blur-fade-in-3 flex items-center gap-4 self-start md:self-auto">
            {tab === 'feed' && (
              <button
                type="button"
                onClick={() => setSeed((s) => s + 1)}
                className="px-4 py-2 rounded-[2px] text-xs font-mono uppercase tracking-wider border border-white/20 text-neutral-300 hover:text-black hover:bg-white transition-all duration-300"
              >
                Mix it up
              </button>
            )}

            {/* Lightweight Glass Toggle Switch */}
            <div className="relative flex items-center p-1 bg-white/5 border border-white/10 rounded-[4px] shadow-sm">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[2px] bg-accent/20 border border-accent/50 shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-transform duration-300 ease-out ${
                  device === 'laptop' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                }`} 
              />
              <button
                onClick={() => pickDevice('phone')}
                className={`relative z-10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                  device === 'phone' ? 'text-accent drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Phone
              </button>
              <button
                onClick={() => pickDevice('laptop')}
                className={`relative z-10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                  device === 'laptop' ? 'text-accent drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Laptop
              </button>
            </div>
          </div>
        </div>

        {list.length === 0 ? (
          <p className="text-neutral-500 py-20 text-center font-mono text-sm">No wallpapers found.</p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {list.map((w, i) => (
              <div key={w.slug} className="blur-fade-in break-inside-avoid" style={{ animationDelay: `${Math.min(i * 40, 600)}ms` }}>
                <WallpaperCard wallpaper={w} device={device} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}