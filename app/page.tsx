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
import IntroScreen from '@/components/IntroScreen';

export default function Home() {
  const [tab, setTab] = useState<Tab>('feed');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategorySlug>('all');
  const { favourites } = useFavourites();
  const [introFinished, setIntroFinished] = useState(false);

  return (
    <ModalProvider>
      <IntroScreen onComplete={() => setIntroFinished(true)} />
      <Nav category={category} onCategoryChange={setCategory} introFinished={introFinished} />
      
      {/* THEME: Main background is pure deep black */}
      <main className="flex-1 font-body bg-bg">
        <Hero />

        {tab === 'search' && (
          <div className="mx-auto max-w-7xl px-6 lg:px-12 mb-6">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or category..."
              autoFocus
              /* THEME: Search input uses surface, border, and Green focus */
              className="w-full sm:max-w-md px-4 py-3 rounded-sm
                         bg-surface border border-border
                         text-sm text-text placeholder:text-text-muted font-mono
                         transition-colors duration-200
                         focus:outline-none focus:border-green"
            />
          </div>
        )}

        <Gallery wallpapers={index} tab={tab} query={query} category={category} />
        
        {/* THEME: Footer uses Gold divider */}
        <section id="about-us" className="border-t border-gold/30 bg-surface/30 py-32 mt-16">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-4xl font-display font-bold tracking-tight mb-8 text-text">About Wallvine</h2>
            <div className="space-y-6 text-text-muted leading-relaxed text-xl font-light max-w-3xl">
              <p>
                Finding a good wallpaper shouldn't be this hard. Most sites are filled with pop-ups, trick download buttons, and images that get stretched to fit your phone screen.
              </p>
              <p>
                I built Wallvine to be the exact opposite of that. It's a stripped-down, personal collection. If I wouldn't use it as my own background, it doesn't go on the site. Everything is optimized, sharp, and ready to use immediately without any extra hassle.
              </p>
            </div>
            
            <div className="mt-12 flex gap-8 text-sm font-mono uppercase tracking-wider">
              {/* THEME: Links are Green, hover to Gold */}
              <Link href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-green hover:text-gold transition-colors">
                Twitter
              </Link>
              <Link href="https://github.com/Rajesh-netizen" target="_blank" rel="noopener noreferrer" className="text-green hover:text-gold transition-colors">
                GitHub
              </Link>
              <Link href="mailto:contact@wallvine.com" className="text-green hover:text-gold transition-colors">
                Email
              </Link>
            </div>
            
            <p className="text-xs text-text-muted mt-20 font-mono">
              &copy; {new Date().getFullYear()} Wallvine. Built by a human.
            </p>
          </div>
        </section>
      </main>

      <BottomNav tab={tab} onChange={setTab} favouriteCount={favourites.length} />
    </ModalProvider>
  );
}