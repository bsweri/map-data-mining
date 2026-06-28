import { useState } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import DataGrid from './components/DataGrid';
import ExportButton from './components/ExportButton';
import AdSenseBanner from './components/AdSenseBanner';
import type { MapPlace } from './types';

export default function App() {
  const [data, setData] = useState<MapPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState('');
  
  const handleSearch = async (keyword: string, location: string, radius: number) => {
    setIsLoading(true);
    setError(null);
    setData([]);
    setCurrentKeyword(keyword);

    try {
      // Panggil Supabase Edge Function (Production)
      const response = await fetch('https://egtnncvpaznfdzwpbfse.supabase.co/functions/v1/search-maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, location, radius }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat mengambil data dari server.');
      }

      setData(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-50 font-sans pb-12 select-none"
      onCopy={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    >
      <Header />
      
      {/* Iklan Atas (Top Banner) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <AdSenseBanner className="mb-2" slot="2121996370" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        
        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl shadow-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {!error && (
          <>
            <DataGrid data={data} />
            <ExportButton data={data} keyword={currentKeyword} />
            
            {/* Iklan Bawah (Bottom Banner) - Muncul jika data berhasil di-load */}
            {data.length > 0 && (
              <div className="mt-8">
                <AdSenseBanner slot="4773612818" />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
