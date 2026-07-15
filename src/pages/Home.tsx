import { useState } from 'react';
import Header from '../components/Header';
import SearchForm from '../components/SearchForm';
import DataGrid from '../components/DataGrid';
import ExportButton from '../components/ExportButton';
import AdSenseBanner from '../components/AdSenseBanner';
import PricingPackages from '../components/PricingPackages';
import Footer from '../components/Footer';
import type { MapPlace } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { hasExceededLocalQuota, getLocalQuota, incrementLocalQuota } from '../lib/quota';
import { CreditCard, ShieldCheck, Star, Phone, Map } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<MapPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState('');
  
  const [donationAmount, setDonationAmount] = useState<string>('50000');
  const [isDonating, setIsDonating] = useState(false);
  const { user, profile } = useAuth();

  const handleSearch = async (keyword: string, location: string, radius: number) => {
    // 1. Client-side Quota Check for Free Users
    const isFree = !user || profile?.current_membership === 'free';
    if (isFree && hasExceededLocalQuota()) {
      setError('Batas kuota harian pencarian Anda telah habis. Silakan buat akun atau upgrade paket untuk pencarian tanpa batas.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setData([]);
    setCurrentKeyword(keyword);

    try {
      const localData = getLocalQuota();
      const payload = { 
        keyword, 
        location, 
        radius,
        user_id: user?.id,
        local_id: isFree ? localData.localId : null
      };

      const response = await fetch('https://egtnncvpaznfdzwpbfse.supabase.co/functions/v1/search-maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` })
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat mengambil data dari server.');
      }

      // 2. Increment Local Quota on Success (for free users)
      if (isFree) {
        incrementLocalQuota();
      }

      setData(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayPalDonation = () => {
    const amountStr = donationAmount.replace(/\D/g, '');
    const amount = parseInt(amountStr, 10);
    if (!amount || amount < 10000) {
      alert('Minimal donasi adalah Rp 10.000');
      return;
    }

    setIsDonating(true);
    setTimeout(() => {
      alert(`Simulasi Donasi: Pembayaran Rp ${amount.toLocaleString('id-ID')} melalui PayPal berhasil! Terima kasih atas dukungan Anda.`);
      setIsDonating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-inter flex flex-col selection:bg-primary-container selection:text-white">
      <Header />
      
      <main className="pt-16 flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-surface to-background pt-20 pb-12 px-gutter">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-hanken text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight font-bold text-on-background">
              Extract Google Maps business data within a specific radius into Excel <span className="text-primary">in one click.</span>
            </h1>
            <p className="font-inter text-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">
              Precise geospatial data mining for market research, competitor analysis, and lead generation. No technical skills required.
            </p>
            
            {/* Sponsored Area (Leaderboard Top) */}
            <div className="max-w-adsense-leaderboard mx-auto mb-12">
              <AdSenseBanner className="mb-2" slot="2121996370" />
            </div>
          </div>
        </section>

        {/* Main Workspace (Grid Layout) */}
        <section className="max-w-container-max mx-auto px-gutter py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Extraction Form Canvas (Left/Main) */}
            <div className="lg:col-span-8 space-y-8">
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl shadow-sm">
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {!error && data.length > 0 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="font-hanken text-2xl font-bold text-on-surface">Extraction Preview</h3>
                      <p className="text-on-surface-variant text-sm mt-1">Live sample data from your extraction.</p>
                    </div>
                    <span className="font-inter text-xs px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-medium">
                      Showing {data.length} results
                    </span>
                  </div>
                  
                  <DataGrid data={data} />
                  <ExportButton data={data} keyword={currentKeyword} />
                </div>
              )}

              {!error && data.length === 0 && !isLoading && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="font-hanken text-2xl font-bold text-on-surface">Mock Extraction Preview</h3>
                      <p className="text-on-surface-variant text-sm mt-1">Visualizing live sample data from the last global extraction.</p>
                    </div>
                    <span className="font-inter text-xs px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-medium">
                      Showing 2 of 142 results
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mock Card 1 */}
                    <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-inter text-sm font-bold text-primary">The Roasting Point</h4>
                        <span className="text-[10px] font-bold uppercase tracking-tighter bg-surface-container-high px-2 py-0.5 rounded text-on-surface">Active</span>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-4 truncate">Jl. Senopati No. 42, Kebayoran Baru, Jakarta</p>
                      <div className="flex items-center gap-4 text-outline mb-4">
                        <div className="flex items-center gap-1 text-xs">
                          <Star size={14} className="fill-amber-400 stroke-amber-400" />
                          <span>4.8</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Phone size={14} />
                          <span>+62 21 555 0192</span>
                        </div>
                      </div>
                      <a className="text-primary font-inter text-xs font-semibold flex items-center gap-1 hover:underline" href="#">
                        <Map size={14} />
                        View on Google Maps
                      </a>
                    </div>
                    
                    {/* Mock Card 2 */}
                    <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-inter text-sm font-bold text-primary">Studio Caffeine</h4>
                        <span className="text-[10px] font-bold uppercase tracking-tighter bg-surface-container-high px-2 py-0.5 rounded text-on-surface">Active</span>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-4 truncate">Plaza Indonesia Level 3, Jakarta Pusat</p>
                      <div className="flex items-center gap-4 text-outline mb-4">
                        <div className="flex items-center gap-1 text-xs">
                          <Star size={14} className="fill-amber-400 stroke-amber-400" />
                          <span>4.5</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Phone size={14} />
                          <span>+62 21 777 0044</span>
                        </div>
                      </div>
                      <a className="text-primary font-inter text-xs font-semibold flex items-center gap-1 hover:underline" href="#">
                        <Map size={14} />
                        View on Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Sponsored Area (Mid-Content) */}
              <div className="mt-8">
                <AdSenseBanner slot="4773612818" />
              </div>
              
              <PricingPackages />
            </div>

            {/* Sidebar (Right) */}
            <aside className="lg:col-span-4 space-y-8">
              {/* Donation Component: PayPal */}
              <div className="bg-gradient-to-br from-primary/5 to-tertiary/10 border border-primary/20 p-8 rounded-xl relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-surface-container-lowest text-primary font-inter text-[10px] font-bold uppercase px-2 py-1 rounded border border-primary/10 flex items-center gap-1">
                      <ShieldCheck size={14} className="text-primary" />
                      Secure Payment
                    </span>
                  </div>
                  <h3 className="font-hanken text-2xl font-bold text-on-surface mb-2">Donate via PayPal</h3>
                  <p className="text-inter text-sm text-on-surface-variant mb-6">Support our server costs to keep GeoExtract free for basic users.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block font-inter text-sm font-medium text-on-surface-variant mb-2">Custom Amount (IDR)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-outline">Rp</span>
                        <input 
                          type="text" 
                          value={donationAmount}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setDonationAmount(val);
                          }}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-surface-lowest text-on-surface" 
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handlePayPalDonation}
                      disabled={isDonating || parseInt(donationAmount || '0') < 10000}
                      className="w-full bg-primary text-on-primary font-inter text-sm font-medium py-4 rounded-xl hover:brightness-110 transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 disabled:bg-surface-variant disabled:text-outline"
                    >
                      {isDonating ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : 'Pay with PayPal'}
                    </button>
                    <div className="flex justify-center items-center gap-4 grayscale opacity-60">
                      <CreditCard size={18} className="text-outline" />
                      <span className="text-[10px] font-inter text-outline uppercase font-bold tracking-widest">Visa / Mastercard / Amex</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Stats Card */}
              <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl">
                <h4 className="font-inter text-sm font-medium text-on-surface mb-4">Mining Statistics</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                    <span className="font-inter text-sm text-on-surface-variant">Global Extractions</span>
                    <span className="font-inter text-sm font-medium text-primary">12.4K+</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                    <span className="font-inter text-sm text-on-surface-variant">Data Accuracy</span>
                    <span className="font-inter text-sm font-medium text-primary">99.2%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-inter text-sm text-on-surface-variant">Active Analysts</span>
                    <span className="font-inter text-sm font-medium text-primary">850+</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
