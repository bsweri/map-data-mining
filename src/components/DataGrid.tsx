import type { MapPlace } from '../types';
import { MapPin, Phone, Star, Map as MapIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DataGridProps {
  data: MapPlace[];
}

export default function DataGrid({ data }: DataGridProps) {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-12 text-center mt-6">
        <div className="bg-primary-container w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          <MapPin size={40} />
        </div>
        <h3 className="text-lg font-hanken font-bold text-on-surface mb-1">{t('results.empty_title')}</h3>
        <p className="font-inter text-sm text-on-surface-variant max-w-md mx-auto">
          {t('results.empty_desc')}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((place) => (
          <div key={place.id} className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-inter text-sm text-primary font-bold">{place.name}</h4>
              <span className="text-[10px] font-bold uppercase tracking-tighter bg-surface-container-high text-on-surface px-2 py-0.5 rounded">
                {place.radiusZone}
              </span>
            </div>
            <p className="font-inter text-sm text-on-surface-variant mb-4 line-clamp-1" title={place.address}>
              {place.address}
            </p>
            <div className="flex items-center gap-4 text-outline mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-outline" />
                <span className="font-inter text-xs font-medium">--</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-outline" />
                <span className="font-inter text-xs font-medium">{place.phone || '-'}</span>
              </div>
            </div>
            <a href={place.mapsLink} target="_blank" rel="noopener noreferrer" className="text-primary font-inter text-xs font-semibold flex items-center gap-1 hover:underline">
              <MapIcon className="w-4 h-4" />
              View on Google Maps
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
