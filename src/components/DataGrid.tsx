import type { MapPlace } from '../types';
import { ExternalLink, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DataGridProps {
  data: MapPlace[];
}

export default function DataGrid({ data }: DataGridProps) {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant p-12 text-center mt-6">
        <div className="bg-primary-container w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          <MapPin size={40} />
        </div>
        <h3 className="text-lg font-medium text-on-surface mb-1">{t('results.empty_title')}</h3>
        <p className="text-on-surface-variant max-w-md mx-auto">
          {t('results.empty_desc')}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-variant/50">
        <h3 className="text-lg font-semibold text-on-surface">
          {t('results.title')} <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-fixed text-on-primary-fixed">{data.length} {t('results.locations')}</span>
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-outline-variant">
          <thead className="bg-surface-variant">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {t('results.no')}
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {t('results.name')}
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {t('results.address')}
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {t('results.phone')}
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {t('results.radius_zone')}
              </th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {t('results.action')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-outline-variant">
            {data.map((place, index) => (
              <tr key={place.id} className="hover:bg-surface-variant/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant font-medium">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-on-surface">
                  {place.name}
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant max-w-md truncate" title={place.address}>
                  {place.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                  {place.phone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-fixed-dim text-on-primary-fixed-variant border border-primary-fixed">
                    {place.radiusZone}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <a
                    href={place.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:text-primary-container hover:bg-primary-container/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {t('results.open')} <ExternalLink size={14} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
