import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { MapPlace } from '../types';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, 
  Compass, 
  CreditCard, 
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
  ExternalLink,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  AlertTriangle
} from 'lucide-react';

export default function UserDashboard() {
  const { user, profile, signOut } = useAuth();

  const [searchParams] = useSearchParams();
  
  // Baca state awal dari sessionStorage (jika dialihkan dari Home page via Login)
  // Atau fallback ke query parameters (jika user manual share URL)
  const pendingSearchStr = sessionStorage.getItem('pendingSearch');
  const pendingSearch = pendingSearchStr ? JSON.parse(pendingSearchStr) : null;

  const [keyword, setKeyword] = useState(pendingSearch?.keyword || searchParams.get('keyword') || '');
  const [location, setLocation] = useState(pendingSearch?.location || searchParams.get('location') || '');
  const [radius, setRadius] = useState<number>(pendingSearch?.radius || Number(searchParams.get('radius')) || 3);
  
  const parsedMinRating = pendingSearch?.minRating ?? (Number(searchParams.get('minRating')) || 0);
  const parsedHasPhone = pendingSearch?.hasPhoneOnly ?? (searchParams.get('hasPhoneOnly') === 'true');
  
  const autoTriggered = useRef(false);
  const [data, setData] = useState<MapPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // New UI & Revision states
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  const [showAdvanced, setShowAdvanced] = useState(parsedMinRating > 0 || parsedHasPhone);
  const [minRating, setMinRating] = useState<number>(parsedMinRating);
  const [hasPhoneOnly, setHasPhoneOnly] = useState(parsedHasPhone);

  // Credit System States
  const [credit, setCredit] = useState(0);
  const [status, setStatus] = useState('active');
  const [activeUntil, setActiveUntil] = useState<string | null>(null);
  const [lastExtractionAt, setLastExtractionAt] = useState<string | null>(null);
  const [adminSettings, setAdminSettings] = useState<{
    extraction_interval_seconds: number;
    ads_min_credit: number;
    active_period_price_credit: number;
    active_period_days_addition: number;
  } | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isBuyingActivePeriod, setIsBuyingActivePeriod] = useState(false);

  useEffect(() => {
    async function loadData() {
       if (user) {
          const { data: p } = await supabase.from('profiles').select('credit, status, active_until, last_extraction_at').eq('id', user.id).single();
          if (p) {
             setCredit(p.credit);
             setStatus(p.status);
             setActiveUntil(p.active_until);
             setLastExtractionAt(p.last_extraction_at);
          }
       }
       const { data: s } = await supabase.from('admin_settings').select('*').single();
       if (s) {
          setAdminSettings(s);
       }
    }
    loadData();
  }, [user]);

  useEffect(() => {
    if (!lastExtractionAt || !adminSettings) return;
    
    const intervalId = setInterval(() => {
       const last = new Date(lastExtractionAt).getTime();
       const now = new Date().getTime();
       const diffSeconds = (now - last) / 1000;
       const remaining = Math.ceil(adminSettings.extraction_interval_seconds - diffSeconds);
       
       if (remaining > 0) {
          setCooldownRemaining(remaining);
       } else {
          setCooldownRemaining(0);
       }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [lastExtractionAt, adminSettings]);

  useEffect(() => {
    // Auto-trigger search if query params are present from Home page redirect
    if (keyword && location && !autoTriggered.current && status === 'active' && credit >= 1) {
      autoTriggered.current = true;
      sessionStorage.removeItem('pendingSearch');
      handleSearch();
    }
  }, [keyword, location, status, credit]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keyword || !location) return;

    setIsLoading(true);
    setError(null);
    setData([]);
    setCurrentKeyword(keyword);

    try {
      const payload = { 
        keyword, 
        location, 
        radius,
        user_id: user?.id
      };

      const response = await fetch('https://egtnncvpaznfdzwpbfse.supabase.co/functions/v1/search-maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat mengambil data dari server.');
      }

      if (result.creditsUsed) {
         setCredit(prev => Math.max(0, prev - result.creditsUsed));
      }
      setLastExtractionAt(new Date().toISOString());

      let filtered = result.data || [];
      if (minRating > 0) {
        filtered = filtered.filter((place: any) => (place.rating || 0) >= minRating);
      }
      if (hasPhoneOnly) {
        filtered = filtered.filter((place: any) => place.phone && place.phone.trim() !== '' && place.phone !== '-');
      }

      setData(filtered);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyActivePeriod = async () => {
     if (credit < (adminSettings?.active_period_price_credit || 0)) {
        alert('Kredit tidak cukup');
        return;
     }
     setIsBuyingActivePeriod(true);
     try {
        const { data, error } = await supabase.rpc('buy_active_period');
        if (error) throw error;
        if (data.success) {
           setCredit(data.new_credit);
           setActiveUntil(data.new_active_until);
           setStatus('active');
           alert('Masa aktif berhasil diperpanjang!');
        } else {
           alert(data.error);
        }
     } catch (err: any) {
        alert(err.message || 'Terjadi kesalahan sistem.');
     } finally {
        setIsBuyingActivePeriod(false);
     }
  };

  // Filtered data for display and export
  const displayedData = data.filter(place => {
    const query = localSearchQuery.toLowerCase();
    return (
      place.name.toLowerCase().includes(query) ||
      place.address.toLowerCase().includes(query) ||
      (place.phone && place.phone.toLowerCase().includes(query))
    );
  });

  const handleExport = () => {
    if (displayedData.length === 0) return;
    setIsExporting(true);

    try {
      const exportData = displayedData.map((item, index) => ({
        'No': index + 1,
        'Name': item.name,
        'Address': item.address,
        'Phone': item.phone || '-',
        'Radius Zone': item.radiusZone,
        'Rating': item.rating || '-',
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
        { wch: 10 },
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
    window.location.href = import.meta.env.BASE_URL || '/';
  };

  const showAds = adminSettings && credit < adminSettings.ads_min_credit && status === 'grace';

  return (
    <div className="min-h-screen bg-surface text-on-surface font-inter flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity duration-300" 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex flex-col py-6 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Close button for mobile */}
        <button 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="md:hidden absolute right-4 top-4 p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all"
        >
          <X size={18} />
        </button>

        <div className="px-6 mb-8">
          <h1 className="font-hanken text-2xl font-bold text-primary tracking-tight">GeoExtract</h1>
        </div>
        
        <nav className="flex-grow">
          <div className="px-2 space-y-1">

            <a className="bg-secondary-container text-on-secondary-container duration-200 ease-in-out px-4 py-3 mx-2 flex items-center gap-3 rounded-lg font-bold font-inter text-sm font-medium" href="/dashboard">
              <Compass size={18} />
              Dashboard
            </a>
            <a className="text-on-surface-variant hover:bg-surface-container-high duration-200 ease-in-out px-4 py-3 mx-2 flex items-center gap-3 rounded-lg font-inter text-sm font-medium" href="/pricing">
              <CreditCard size={18} />
              Buy Credits
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
                <span className="text-xs text-on-surface-variant capitalize">Role: {profile?.role || 'Member'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                <span>Credit Balance</span>
                <span className="text-primary text-sm font-bold">{credit}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                <span>Status</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${status === 'active' ? 'bg-green-100 text-green-700' : status === 'grace' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{status.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                <span>Active Until</span>
                <span>{activeUntil ? new Date(activeUntil).toLocaleDateString() : 'N/A'}</span>
              </div>
              
              <button 
                onClick={handleBuyActivePeriod}
                disabled={isBuyingActivePeriod || !adminSettings || credit < adminSettings.active_period_price_credit}
                className="w-full mt-2 py-2 bg-primary text-on-primary rounded-lg font-inter text-xs font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuyingActivePeriod ? 'Processing...' : `Extend Active Period (${adminSettings?.active_period_price_credit || '-'} Cr)`}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-outline-variant pt-4 px-2 space-y-1">
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
      <main className="md:ml-64 flex-grow min-h-screen flex flex-col transition-all duration-300">
        {/* Top Header */}
        <header className="h-16 px-gutter flex items-center justify-between sticky top-0 bg-surface/80 backdrop-blur-md border-b border-outline-variant z-40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-hanken text-lg font-bold text-on-surface">User Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setUnreadNotificationsCount(0)}
              className="p-2 text-on-surface-variant hover:text-primary transition-colors relative"
            >
              <Bell size={18} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
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
                    disabled={isLoading || !keyword || !location || !isOnline || cooldownRemaining > 0 || status !== 'active' || credit < 1}
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
                    ) : cooldownRemaining > 0 ? (
                      `Cooldown: ${cooldownRemaining}s`
                    ) : status !== 'active' ? (
                      'Status Inactive'
                    ) : credit < 1 ? (
                      'Out of Credit'
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
              <div className={`p-6 rounded-xl shadow-sm border relative overflow-hidden flex-1 transition-colors duration-500 ${
                isOnline ? 'bg-primary-container text-on-primary-container border-primary' : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                <div className="relative z-10">
                  <span className="font-inter text-xs uppercase tracking-widest opacity-80 font-bold">Extraction Health</span>
                  <div className="mt-2 font-hanken text-2xl font-bold">{isOnline ? '99.8% Success' : 'Offline'}</div>
                  <div className="mt-4 flex items-center gap-2 bg-on-primary-container/10 w-fit px-3 py-1 rounded-full text-[10px] font-bold">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {isOnline ? 'API Connection Stable' : 'No Internet Connection'}
                  </div>
                </div>
                <Zap className="absolute -right-4 -bottom-4 text-9xl opacity-10" size={144} />
              </div>
              
              {showAds && (
                 <div className="bg-surface-container-high p-6 rounded-xl shadow-sm border border-outline-variant flex-1 flex flex-col justify-center">
                   <span className="font-inter text-xs text-on-surface-variant uppercase tracking-widest font-bold">Sponsored Insights</span>
                   <div className="mt-2 text-on-surface font-inter text-sm font-semibold">Need real-time phone verification?</div>
                   <a className="mt-3 text-primary font-bold text-xs underline flex items-center gap-1" href="#" onClick={(e) => e.preventDefault()}>
                     Integrate VerifyAPI
                     <ExternalLink size={12} />
                   </a>
                 </div>
              )}
            </div>
          </section>
          {/* Results Section */}
          <section className="mb-8">
            {error && (
              <div className="bg-error-container border-l-4 border-error text-on-error-container p-4 rounded-r-xl shadow-sm mb-6 flex items-start gap-3 animate-fade-in-up">
                <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-sm">Pemberitahuan Sistem</h4>
                  <p className="font-medium text-xs mt-1 opacity-90">{error}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h3 className="font-hanken text-xl font-bold text-on-surface">Extracted Results</h3>
                {displayedData.length > 0 && (
                  <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase">
                    {displayedData.length} items
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {data.length > 0 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={14} />
                    <input 
                      type="text"
                      placeholder="Cari di hasil..."
                      value={localSearchQuery}
                      onChange={(e) => setLocalSearchQuery(e.target.value)}
                      className="pl-8 pr-4 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-48 transition-all"
                    />
                  </div>
                )}
                {displayedData.length > 0 && (
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
            </div>

            {/* Results Grid */}
            {displayedData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedData.map((place, index) => {
                  const hasValidPhone = place.phone && place.phone.trim() !== '' && place.phone !== '-';
                  return (
                    <div 
                      key={place.id} 
                      className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
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
                          <span className="text-on-surface">
                            {place.rating ? `${place.rating} (${place.rating >= 4 ? 'Highly Rated' : 'Verified Reviews'})` : 'No rating'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-surface border-t border-outline-variant flex gap-2">
                        {hasValidPhone ? (
                          <a 
                            href={`https://wa.me/${place.phone?.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-grow py-2 bg-[#25D366] text-white rounded-lg flex items-center justify-center gap-2 font-inter text-xs font-bold hover:brightness-95 active:scale-[0.98] transition-all text-center"
                          >
                            WhatsApp
                          </a>
                        ) : (
                          <button 
                            disabled
                            className="flex-grow py-2 bg-surface-container-high text-outline rounded-lg flex items-center justify-center gap-2 font-inter text-xs font-bold cursor-not-allowed opacity-50"
                          >
                            No WhatsApp
                          </button>
                        )}
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
                  );
                })}
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-12 text-center">
                <div className="bg-primary-container w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <MapPin size={40} />
                </div>
                <h3 className="text-lg font-hanken font-bold text-on-surface mb-1">
                  {localSearchQuery ? 'Tidak ada hasil pencarian local' : 'No Active Extraction'}
                </h3>
                <p className="font-inter text-sm text-on-surface-variant max-w-md mx-auto">
                  {localSearchQuery 
                    ? `Tidak ada data yang cocok dengan "${localSearchQuery}" di hasil scraping saat ini.`
                    : 'Run a new extraction using the parameters above to preview geospatial lead data.'}
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
