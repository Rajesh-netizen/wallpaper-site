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
import Link from 'next/link';

export default function Home() {
  const [tab, setTab] = useState<Tab>('feed');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategorySlug>('all');
  const { favourites } = useFavourites();

  return (
    <ModalProvider>
      <Nav category={category} onCategoryChange={setCategory} />
      <main className="flex-1">
        <Hero />

        {tab === 'search' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search wallpapers by name or category..."
              autoFocus
              className="w-full sm:max-w-md px-4 py-2.5 rounded-md
                         bg-ink-800 border border-white/10
                         text-sm text-white placeholder:text-neutral-400
                         transition-colors duration-200
                         hover:border-white/25
                         focus:outline-none focus:border-neon-cyan/60"
            />
          </div>
        )}

        <Gallery wallpapers={index} tab={tab} query={query} category={category} />
        
        {/* New About Us Section at the bottom */}
        <section id="about-us" className="border-t border-white/5 bg-ink-900/30 py-20 mt-10">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-6">About Us</h2>
            <p className="text-neutral-400 leading-relaxed text-lg mb-8">
              Wallvine started as a personal project to solve a simple problem: finding high-quality wallpapers that actually look good on modern screens. 
              We don't believe in cluttering the web with ads, pop-ups, or fake download links. 
              Every image on this site is manually curated, optimized for performance, and delivered exactly as it was intended to be seen.
            </p>
            <div className="flex justify-center gap-6 text-sm font-medium">
              <Link href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-neon-cyan transition-colors">
                Twitter
              </Link>
              <Link href="https://github.com/Rajesh-netizen" target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-neon-cyan transition-colors">
                GitHub
              </Link>
              <Link href="mailto:contact@wallvine.com" className="text-neutral-300 hover:text-neon-cyan transition-colors">
                Contact
              </Link>
            </div>
            <p className="text-xs text-neutral-600 mt-12">
              &copy; {new Date().getFullYear()} Wallvine. All rights reserved.
            </p>
          </div>
        </section>
      </main>

      <BottomNav tab={tab} onChange={setTab} favouriteCount={favourites.length} />
    </ModalProvider>
  );
}