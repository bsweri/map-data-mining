import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, MapPin, Search, PhoneCall } from 'lucide-react';

interface MonthlyStat {
  id: string;
  month_year: string;
  api_type: string;
  call_count: number;
}

export default function ApiMonitoring() {
  const [stats, setStats] = useState<MonthlyStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase
        .from('api_monthly_stats')
        .select('*')
        .order('month_year', { ascending: false })
        .order('api_type', { ascending: true });
        
      if (data) setStats(data);
      setIsLoading(false);
    }
    fetchStats();
  }, []);

  // Group stats by month
  const groupedStats = stats.reduce((acc, curr) => {
    if (!acc[curr.month_year]) {
      acc[curr.month_year] = [];
    }
    acc[curr.month_year].push(curr);
    return acc;
  }, {} as Record<string, MonthlyStat[]>);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'gmaps_geocode': return <MapPin size={18} className="text-blue-400" />;
      case 'gmaps_nearbysearch': return <Search size={18} className="text-emerald-400" />;
      case 'gmaps_placedetails': return <PhoneCall size={18} className="text-purple-400" />;
      default: return <Activity size={18} className="text-gray-400" />;
    }
  };

  const formatType = (type: string) => {
    switch (type) {
      case 'gmaps_geocode': return 'Geocoding API';
      case 'gmaps_nearbysearch': return 'Nearby Search API';
      case 'gmaps_placedetails': return 'Place Details API';
      default: return type;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(102,126,234,0.2)]">
          <Activity size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-hanken font-bold text-on-surface">API Monitoring</h1>
          <p className="text-on-surface-variant opacity-80 mt-1">Laporan bulanan penggunaan Google Maps API</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center text-on-surface-variant animate-pulse bg-surface-variant rounded-3xl">Memuat data analitik...</div>
      ) : Object.keys(groupedStats).length === 0 ? (
        <div className="p-8 text-center text-on-surface-variant bg-surface-variant rounded-3xl">Belum ada data penggunaan API yang tercatat. Lakukan pencarian peta terlebih dahulu.</div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {Object.entries(groupedStats).map(([month, monthStats]) => {
            const totalCalls = monthStats.reduce((sum, stat) => sum + stat.call_count, 0);
            return (
              <div key={month} className="bg-surface-variant border border-outline-variant rounded-3xl overflow-hidden shadow-lg backdrop-blur-md p-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
                  <h2 className="text-xl font-bold font-hanken text-on-surface">Periode: {month}</h2>
                  <div className="text-sm px-4 py-1.5 bg-primary/20 text-primary rounded-full font-bold">
                    Total: {totalCalls.toLocaleString()} Pemanggilan
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {monthStats.map(stat => (
                    <div key={stat.id} className="bg-surface/50 border border-outline-variant/50 rounded-2xl p-5 hover:bg-surface transition-colors flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-surface-variant rounded-xl flex items-center justify-center border border-outline-variant">
                          {getIconForType(stat.api_type)}
                        </div>
                        <h3 className="font-semibold text-on-surface">{formatType(stat.api_type)}</h3>
                      </div>
                      <div className="mt-auto">
                        <p className="text-3xl font-bold text-on-surface">{stat.call_count.toLocaleString()}</p>
                        <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mt-1">Hits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
