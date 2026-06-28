import { MapPinned } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-blue-600">
          <div className="bg-blue-50 p-2 rounded-lg">
            <MapPinned size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">Map Data Mining</h1>
        </div>
        <div className="hidden sm:block text-sm text-blue-500 font-semibold bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Smart Marketing Tools
        </div>
      </div>
    </header>
  );
}
