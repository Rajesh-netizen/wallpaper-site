import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wallvine — Wallpapers that fit your screen',
  description:
    'Download premium wallpapers built for your phone and laptop. One tap, the right size.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}