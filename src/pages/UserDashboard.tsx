import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { hasExceededLocalQuota, getLocalQuota, incrementLocalQuota } from '../lib/quota';
import type { MapPlace } from '../types';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Compass, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Bell, 
  MapPin, 
  Search, 
  Zap, 
  Download, 
  Phone, 
  Star, 
  Map, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export default function UserDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState<number>(3);
  const [data, setData] = useState<MapPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !location) return;

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

  const handleExport = () => {
    if (data.length === 0) return;
    setIsExporting(true);

    try {
      const exportData = data.map((item, index) => ({
        'No': index + 1,
        'Name': item.name,
        'Address': item.address,
        'Phone': item.phone || '-',
        'Radius Zone': item.radiusZone,
        'Google Maps URL': item.mapsLink,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      
      const wscols = [
        { wch: 5 },
        { wch: 30 },
        { wch: 50 },
        { wch: 20 },
        { wch: 15 },
        { wch: 45 },
      ];
      worksheet['!cols'] = wscols;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');

      const safeKeyword = currentKeyword.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const date = new Date().toISOString().split('T')[0];
      const fileName = `map_data_${safeKeyword || 'mining'}_${date}.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error(err);
      alert('Gagal mengekspor data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-inter flex">
      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex flex-col py-6 z-50">
        <div className="px-6 mb-8">
          <h1 className="font-hanken text-2xl font-bold text-primary tracking-tight">GeoExtract</h1>
        </div>
        
        <nav className="flex-grow">
          <div className="px-2 space-y-1">
            <a className="text-on-surface-variant hover:bg-surface-container-high duration-200 ease-in-out px-4 py-3 mx-2 flex items-center gap-3 rounded-lg font-inter text-sm font-medium" href="#">
              <LayoutDashboard size={18} />
              Overview
            </a>
            <a className="text-on-surface-variant hover:bg-surface-container-high duration-200 ease-in-out px-4 py-3 mx-2 flex items-center gap-3 rounded-lg font-inter text-sm font-medium" href="#">
              <TrendingUp size={18} />
              Analytics
            </a>
            <a className="bg-secondary-container text-on-secondary-container duration-200 ease-in-out px-4 py-3 mx-2 flex items-center gap-3 rounded-lg font-bold font-inter text-sm font-medium" href="#">
              <Compass size={18} />
              Extraction
            </a>
            <a className="text-on-surface-variant hover:bg-surface-container-high duration-200 ease-in-out px-4 py-3 mx-2 flex items-center gap-3 rounded-lg font-inter text-sm font-medium" href="#">
              <CreditCard size={18} />
              Billing
            </a>
            <a className="text-on-surface-variant hover:bg-surface-container-high duration-200 ease-in-out px-4 py-3 mx-2 flex items-center gap-3 rounded-lg font-inter text-sm font-medium" href="#">
              <Settings size={18} />
              Settings
            </a>
          </div>
        </nav>

        {/* Profile/Quota Section */}
        <div className="px-4 mt-auto mb-6">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full border border-primary flex items-center justify-center bg-primary-fixed text-on-primary-fixed font-bold">
                {profile?.email ? profile.email.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-inter text-sm font-bold text-on-surface truncate" title={profile?.email}>
                  {profile?.email ? profile.email.split('@')[0] : 'User'}
                </span>
                <span className="text-xs text-on-surface-variant capitalize">{profile?.current_membership || 'free'} Member</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                <span>Query Credits</span>
                <span>{profile?.current_membership === 'free' ? '5/5' : '100/100'}</span>
              </div>
              <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '100%' }}></div>
              </div>
              <button className="w-full mt-2 py-2 bg-primary text-on-primary rounded-lg font-inter text-xs font-semibold hover:opacity-90 active:scale-95 transition-all">
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-outline-variant pt-4 px-2 space-y-1">
          <a className="text-on-surface-variant hover:bg-surface-container-high duration-200 ease-in-out px-4 py-3 mx-2 flex items-center gap-3 rounded-lg font-inter text-sm font-medium" href="#">
            <HelpCircle size={18} />
            Support
          </a>
          <button 
            onClick={handleLogout}
            className="w-full text-on-surface-variant hover:bg-surface-container-high duration-200 ease-in-out px-4 py-3 mx-2 flex items-center gap-3 rounded-lg font-inter text-sm font-medium text-left"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-grow min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 px-gutter flex items-center justify-between sticky top-0 bg-surface/80 backdrop-blur-md border-b border-outline-variant z-40">
          <div>
            <h2 className="font-hanken text-lg font-bold text-on-surface">Data Mining Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <Bell size={18} />
            </button>
            <div className="h-8 w-px bg-outline-variant"></div>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              <span className="font-inter text-sm font-medium text-on-surface-variant">Jakarta, ID</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-gutter max-w-container-max mx-auto w-full flex-grow">
          {/* Search Interface: Bento Style */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="font-hanken text-xl font-bold text-on-surface mb-1">New Extraction</h3>
                <p className="font-inter text-sm text-on-surface-variant">Define your parameters to start scraping high-precision lead data.</p>
              </div>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-inter text-xs font-semibold text-on-surface-variant px-1">Business Category</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-inter text-sm text-on-surface" 
                        placeholder="e.g. Coffee Shops, Tech Hubs" 
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-inter text-xs font-semibold text-on-surface-variant px-1">Area / City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-inter text-sm text-on-surface" 
                        placeholder="e.g. Jakarta Selatan, NY" 
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
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
                        Running...
                      </>
                    ) : (
                      <>
                        <Search size={16} />
                        Run Extraction
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Featured Stats / Credits */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="bg-primary-container text-on-primary-container p-6 rounded-xl shadow-sm border border-primary relative overflow-hidden flex-1">
                <div className="relative z-10">
                  <span className="font-inter text-xs uppercase tracking-widest opacity-80 font-bold">Extraction Health</span>
                  <div className="mt-2 font-hanken text-2xl font-bold">99.8% Success</div>
                  <div className="mt-4 flex items-center gap-2 bg-on-primary-container/10 w-fit px-3 py-1 rounded-full text-[10px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    API Connection Stable
                  </div>
                </div>
                <Zap className="absolute -right-4 -bottom-4 text-9xl opacity-10" size={144} />
              </div>
              <div className="bg-surface-container-high p-6 rounded-xl shadow-sm border border-outline-variant flex-1 flex flex-col justify-center">
                <span className="font-inter text-xs text-on-surface-variant uppercase tracking-widest font-bold">Sponsored Insights</span>
                <div className="mt-2 text-on-surface font-inter text-sm font-semibold">Need real-time phone verification?</div>
                <a className="mt-3 text-primary font-bold text-xs underline flex items-center gap-1" href="#" onClick={(e) => e.preventDefault()}>
                  Integrate VerifyAPI
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </section>

          {/* Results Section */}
          <section className="mb-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl shadow-sm mb-6">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="font-hanken text-xl font-bold text-on-surface">Extracted Results</h3>
                {data.length > 0 && (
                  <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase">
                    Last 24 Hours
                  </span>
                )}
              </div>
              {data.length > 0 && (
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-5 py-2.5 border-2 border-primary text-primary font-bold rounded-lg font-inter text-xs hover:bg-primary/5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={14} />
                  <span>{isExporting ? 'Exporting...' : 'Export to Excel'}</span>
                </button>
              )}
            </div>

            {/* Results Grid */}
            {data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((place) => (
                  <div key={place.id} className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                    <div className="p-5 border-b border-surface-container flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-on-surface text-sm line-clamp-1">{place.name}</h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">Business Lead • Zone {place.radiusZone}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[9px] font-bold">
                        VERIFIED
                      </span>
                    </div>
                    <div className="p-5 space-y-3 bg-[#f8fbff] flex-grow">
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                        <Phone size={16} className="text-primary flex-shrink-0" />
                        <span className="text-on-surface truncate">{place.phone || '-'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                        <MapPin size={16} className="text-primary flex-shrink-0" />
                        <span className="text-on-surface truncate" title={place.address}>{place.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                        <Star size={16} className="text-primary flex-shrink-0 fill-amber-400 stroke-amber-400" />
                        <span className="text-on-surface">4.5 (Verified Reviews)</span>
                      </div>
                    </div>
                    <div className="p-4 bg-surface border-t border-outline-variant flex gap-2">
                      <a 
                        href={`https://wa.me/${place.phone?.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-grow py-2 bg-[#25D366] text-white rounded-lg flex items-center justify-center gap-2 font-inter text-xs font-bold hover:brightness-95 active:scale-[0.98] transition-all text-center"
                      >
                        WhatsApp
                      </a>
                      <a 
                        href={place.mapsLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
                      >
                        <Map size={16} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-12 text-center">
                <div className="bg-primary-container w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <MapPin size={40} />
                </div>
                <h3 className="text-lg font-hanken font-bold text-on-surface mb-1">No Active Extraction</h3>
                <p className="font-inter text-sm text-on-surface-variant max-w-md mx-auto">
                  Run a new extraction using the parameters above to preview geospatial lead data.
                </p>
              </div>
            )}
          </section>

          {/* Bottom AdSense Placeholder */}
          <section className="mt-12 py-8 bg-[#F1F5F9] rounded-xl border border-dashed border-outline text-center">
            <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-4 tracking-widest">Advertisement</p>
            <div className="max-w-[728px] h-[90px] mx-auto bg-surface-variant flex items-center justify-center rounded">
              <span className="text-on-surface-variant font-inter text-xs font-semibold">Geo-Targeted Advertising Banner</span>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-surface-container-lowest border-t border-outline-variant mt-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-gutter py-margin-desktop max-w-container-max mx-auto">
            <div className="col-span-1">
              <span className="font-hanken text-lg font-bold text-primary">GeoExtract</span>
              <p className="mt-4 text-on-surface-variant font-inter text-xs">
                Empowering businesses with precision geospatial data mining solutions.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-on-surface text-sm mb-4">Product</h5>
              <ul className="space-y-2 font-inter text-xs text-on-surface-variant">
                <li><a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>API Documentation</a></li>
                <li><a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Coverage Maps</a></li>
                <li><a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Status Page</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-on-surface text-sm mb-4">Company</h5>
              <ul className="space-y-2 font-inter text-xs text-on-surface-variant">
                <li><a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>About Us</a></li>
                <li><a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a></li>
                <li><a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-on-surface text-sm mb-4">Support</h5>
              <ul className="space-y-2 font-inter text-xs text-on-surface-variant">
                <li><a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Help Center</a></li>
                <li><a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Email Support</a></li>
                <li><a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Contact Sales</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-outline-variant py-6 text-center">
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">
              © 2024 GeoExtract. All rights reserved. Precision Geospatial Solutions.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
