import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

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
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${inter.variable}`}>
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