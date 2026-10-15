'use client';
import { useState } from 'react';
import Nav from '@/components/Nav';
import Gallery from '@/components/Gallery';
import BottomNav, { type Tab } from '@/components/BottomNav';
import { useFavourites } from '@/components/useFavourites';
import type { CategorySlug } from '@/components/CategoryMenu';
import index from '@/data/wallpapers.json';

export default function BrowsePage() {
  const [tab, setTab] = useState<Tab>('feed');
  const [query] = useState('');
  const [category, setCategory] = useState<CategorySlug>('all');
  const { favourites } = useFavourites();

  return (
    <>
      <Nav category={category} onCategoryChange={setCategory} />
      <main className="pt-4">
        <Gallery wallpapers={index} tab={tab} query={query} category={category} />
      </main>
      <BottomNav tab={tab} onChange={setTab} favouriteCount={favourites.length} />
    </>
  );
}