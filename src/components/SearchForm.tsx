import { useState } from 'react';
import { Search, MapPin, Navigation, Crosshair, Heart, Coffee } from 'lucide-react';

interface SearchFormProps {
  onSearch: (keyword: string, location: string, radius: number) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState<number>(5);
  const [isDetecting, setIsDetecting] = useState(false);
  const [donationAmount, setDonationAmount] = useState<string>('10000');
  const [isDonating, setIsDonating] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolokasi tidak didukung oleh browser Anda.');
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

  const handleDonation = async () => {
    const amountStr = donationAmount.replace(/\D/g, '');
    const amount = parseInt(amountStr, 10);
    if (!amount || amount < 10000) {
      alert('Minimal donasi adalah Rp 10.000');
      return;
    }

    setIsDonating(true);
    try {
      const response = await fetch('https://egtnncvpaznfdzwpbfse.supabase.co/functions/v1/create-midtrans-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal membuat transaksi');

      window.snap.pay(data.token, {
        onSuccess: function() {
          alert('Terima kasih banyak atas donasi Anda! 💖');
        },
        onPending: function() {
          alert('Menunggu pembayaran donasi Anda diselesaikan.');
        },
        onError: function() {
          alert('Pembayaran donasi gagal. Silakan coba lagi.');
        },
        onClose: function() {
          setIsDonating(false);
        }
      });
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem.');
      setIsDonating(false);
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
              max="4"
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

      {/* Bagian Donasi */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-orange-50/50 p-4 md:p-5 rounded-xl border border-orange-100">
          <div className="flex items-start md:items-center gap-3 w-full">
            <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Dukung Aplikasi Ini</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Bantu kami mempertahankan dan mengembangkan fitur baru.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
            <div className="relative w-full md:w-32 shrink-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">Rp</span>
              <input 
                type="text" 
                value={donationAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setDonationAmount(val);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="10000"
              />
            </div>
            <button 
              type="button"
              onClick={handleDonation}
              disabled={isDonating || parseInt(donationAmount || '0') < 10000}
              className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isDonating ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Coffee className="w-4 h-4" />
              )}
              Donasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
