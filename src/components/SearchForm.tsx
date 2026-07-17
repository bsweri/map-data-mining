import { useState } from 'react';
import { Search, MapPin, Navigation, Crosshair, FileDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchFormProps {
  onSearch: (keyword: string, location: string, radius: number) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState<number>(3);
  const [isDetecting, setIsDetecting] = useState(false);
  const { t } = useTranslation();

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert(t('search.error_geo'));
      return;
    }
    
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Langsung set koordinat karena geocoding sudah ditangani di Edge Function
        setLocation(`${latitude}, ${longitude}`);
        setIsDetecting(false);
      },
      () => {
        setIsDetecting(false);
        alert(t('search.error_geo_fail'));
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
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="text-primary text-3xl">
          <Search size={28} />
        </div>
        <h2 className="font-hanken text-2xl font-bold text-on-surface">Data Mining Configuration</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="keyword" className="block font-inter text-sm font-medium text-on-surface-variant mb-2">
            {t('search.keyword')}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline h-5 w-5" />
            <input
              type="text"
              id="keyword"
              placeholder={t('search.keyword_placeholder')}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-surface-lowest text-on-surface"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block font-inter text-sm font-medium text-on-surface-variant mb-2">
            {t('search.location')}
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-outline h-5 w-5" />
            <input
              type="text"
              id="location"
              placeholder={t('search.location_placeholder')}
              className="w-full pl-10 pr-12 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-surface-lowest text-on-surface"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary hover:text-primary-container disabled:opacity-50 transition-colors"
              title={t('search.use_my_location')}
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

        <div>
          <label htmlFor="radius" className="block font-inter text-sm font-medium text-on-surface-variant mb-2 flex justify-between">
            <span>{t('search.radius')}</span>
            <span className="text-primary font-bold">{radius} KM</span>
          </label>
          <div className="relative flex items-center h-[50px] px-2 bg-surface-variant/30 border border-outline-variant rounded-xl focus-within:ring-2 focus-within:ring-primary">
            <Navigation className="h-5 w-5 text-outline mr-2" />
            <input
              type="range"
              id="radius"
              min="1"
              max="4"
              step="1"
              className="w-full h-2 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={isLoading || !keyword || !location}
            className="w-full bg-primary text-on-primary font-inter text-sm font-medium py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-surface-variant disabled:text-outline disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('search.loading')}
              </>
            ) : (
              <>
                <FileDown size={20} />
                Extract Data
              </>
            )}
          </button>
          <div className="mt-4 text-center">
            <p className="text-xs text-on-surface-variant font-medium">Your remaining free daily usage: <span className="text-primary font-bold">Login to view</span></p>
          </div>
        </div>
      </form>
    </div>
  );
}
