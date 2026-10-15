'use client';
import { useEffect, useState } from 'react';
import { getFavourites, toggleFavourite } from '@/lib/favourites';

export function useFavourites() {
  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    setFavourites(getFavourites());

    const onChange = () => setFavourites(getFavourites());
    window.addEventListener('wallvine:favourites-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('wallvine:favourites-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  function toggle(slug: string) {
    const next = toggleFavourite(slug);
    setFavourites(next);
  }

  return { favourites, toggle };
}