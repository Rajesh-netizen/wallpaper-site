import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wallvine — Premium Wallpapers',
  description: 'A curated collection of high-quality wallpapers for your phone and laptop. Downloaded directly, no watermarks.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Wallvine',
    url: 'https://wallpaper-site-8cs.pages.dev',
    description: 'A curated collection of high-quality wallpapers for your phone and laptop.',
    author: { '@type': 'Person', name: 'Rajesh' }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-ink-950 text-neutral-100 antialiased flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}