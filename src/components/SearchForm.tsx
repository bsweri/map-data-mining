import { useState } from 'react';
import { Search, MapPin, Navigation, Crosshair } from 'lucide-react';

interface SearchFormProps {
  onSearch: (keyword: string, location: string, radius: number) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState<number>(5);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolokasi tidak didukung oleh browser Anda.');
      return;
    }
    
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            setIsDetecting(false);
            if (status === 'OK' && results && results[0]) {
              setLocation(results[0].formatted_address);
            } else {
              setLocation(`${latitude}, ${longitude}`);
            }
          });
        } else {
          setIsDetecting(false);
          setLocation(`${latitude}, ${longitude}`);
        }
      },
      () => {
        setIsDetecting(false);
        alert('Gagal mendapatkan lokasi. Pastikan izin geolokasi diaktifkan.');
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword && location && radius) {
      onSearch(keyword, location, radius);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 transition-all hover:shadow-md">
      <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <Search className="text-blue-500" size={24} />
        Mulai Pencarian Data
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-4 space-y-2">
          <label htmlFor="keyword" className="block text-sm font-medium text-slate-700">
            Nama Bisnis / Keyword
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="keyword"
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-800"
              placeholder="Contoh: Kopi, Apotek..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="md:col-span-5 space-y-2">
          <label htmlFor="location" className="block text-sm font-medium text-slate-700">
            Area / Titik Pusat
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="location"
              className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-800"
              placeholder="Contoh: Jakarta Selatan"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500 hover:text-blue-700 disabled:opacity-50 transition-colors"
              title="Gunakan lokasi saya"
            >
              {isDetecting ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Crosshair className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="md:col-span-3 space-y-2">
          <label htmlFor="radius" className="block text-sm font-medium text-slate-700 flex justify-between">
            <span>Radius (KM)</span>
            <span className="text-blue-600 font-bold">{radius} KM</span>
          </label>
          <div className="relative flex items-center h-[50px] px-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500">
            <Navigation className="h-5 w-5 text-slate-400 mr-2" />
            <input
              type="range"
              id="radius"
              min="1"
              max="50"
              step="1"
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="md:col-span-12 mt-2">
          <button
            type="submit"
            disabled={isLoading || !keyword || !location}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mencari Data...
              </>
            ) : (
              'Cari Lokasi'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
