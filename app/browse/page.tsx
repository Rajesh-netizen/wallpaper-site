import index from '@/data/wallpapers.json';
import Gallery from '@/components/Gallery';

type Variant = {
  device: string;
  label: string;
  width: number;
  height: number;
  path: string;
};
type Wallpaper = { slug: string; title: string; variants: Variant[] };

const wallpapers = index as Wallpaper[];

export default function Browse() {
  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2 text-white">
          Browse wallpapers
        </h1>
        <p className="text-white/50 text-sm">
          Click any wallpaper to download it in the right size for your
          device.
        </p>
      </div>

      <Gallery wallpapers={wallpapers} />
    </main>
  );
}