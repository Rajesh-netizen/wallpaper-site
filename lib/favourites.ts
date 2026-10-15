'use client';

const KEY = 'wallvine:favourites';

export function getFavourites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setFavourites(slugs: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event('wallvine:favourites-changed'));
}

export function toggleFavourite(slug: string): string[] {
  const current = getFavourites();
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug];
  setFavourites(next);
  return next;
}