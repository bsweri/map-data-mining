import { useState } from 'react';
import { Search, MapPin, Crosshair, FileDown, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchFormProps {
  onSearch: (keyword: string, location: string, radius: number, minRating: number, hasPhoneOnly: boolean) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState<number>(3);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [hasPhoneOnly, setHasPhoneOnly] = useState(false);
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
      onSearch(keyword, location, radius, minRating, hasPhoneOnly);
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-inter text-xs font-semibold text-on-surface-variant px-1">{t('search.keyword') || 'Business Category'}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
              <input 
                className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-inter text-sm text-on-surface" 
                placeholder={t('search.keyword_placeholder') || 'e.g. Coffee Shops, Tech Hubs'} 
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="font-inter text-xs font-semibold text-on-surface-variant px-1">{t('search.location') || 'Area / City'}</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
              <input 
                className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-inter text-sm text-on-surface" 
                placeholder={t('search.location_placeholder') || 'e.g. Jakarta Selatan, NY'} 
                type="text"
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
        </div>

        <div className="pt-2 border-t border-outline-variant/50">
          <button 
            type="button" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-85 transition-opacity"
          >
            <Filter size={14} />
            <span>Advanced Options</span>
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-4 bg-surface rounded-lg border border-outline-variant/60 transition-all duration-300">
              <div className="space-y-1.5">
                <label className="font-inter text-xs font-semibold text-on-surface-variant flex justify-between">
                  <span>Minimum Rating</span>
                  <span className="text-primary font-bold">{minRating || 'Any'} ★</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="flex items-center gap-2 pt-5 sm:pt-4">
                <input 
                  type="checkbox"
                  id="hasPhoneOnly"
                  checked={hasPhoneOnly}
                  onChange={(e) => setHasPhoneOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary border-outline"
                />
                <label htmlFor="hasPhoneOnly" className="font-inter text-xs font-semibold text-on-surface-variant cursor-pointer select-none">
                  Hanya nomor telepon saja
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <label className="font-inter text-xs font-semibold text-on-surface-variant">Radius:</label>
            <select 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))}
              className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
            >
              <option value={1}>1 KM</option>
              <option value={2}>2 KM</option>
              <option value={3}>3 KM</option>
              <option value={4}>4 KM</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={isLoading || !keyword || !location}
            className="px-8 py-3 bg-primary text-on-primary rounded-lg font-bold font-inter text-sm shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:bg-surface-variant disabled:text-outline disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('search.loading') || 'Running...'}
              </>
            ) : (
              <>
                <FileDown size={16} />
                Extract Data
              </>
            )}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-on-surface-variant font-medium">Your remaining free daily usage: <span className="text-primary font-bold">Login to view</span></p>
        </div>
      </form>
    </div>
  );
}
