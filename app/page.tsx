'use client';
import { useState } from 'react';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Gallery from '@/components/Gallery';
import BottomNav, { type Tab } from '@/components/BottomNav';
import { useFavourites } from '@/components/useFavourites';
import { ModalProvider } from '@/components/ModalContext';
import type { CategorySlug } from '@/components/CategoryMenu';
import index from '@/data/wallpapers.json';

export default function Home() {
  const [tab, setTab] = useState<Tab>('feed');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategorySlug>('all');
  const { favourites } = useFavourites();

  return (
    <ModalProvider>
      <Nav category={category} onCategoryChange={setCategory} />
      <main>
        <Hero />

        {tab === 'search' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search wallpapers…"
              autoFocus
              className="w-full sm:max-w-md px-4 py-2.5 rounded-pill
                         bg-ink-800 border border-white/10
                         text-sm text-white placeholder:text-neutral-400
                         transition-colors duration-200
                         hover:border-white/25
                         focus:outline-none focus:border-neon-cyan/60 focus:shadow-glow-cyan"
            />
          </div>
        )}

        <Gallery wallpapers={index} tab={tab} query={query} category={category} />
      </main>

      <BottomNav tab={tab} onChange={setTab} favouriteCount={favourites.length} />
    </ModalProvider>
  );
}