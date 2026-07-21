import { useState, useEffect } from 'react';
import { Check, CreditCard, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Package {
  id: string;
  name: string;
  price_idr: number;
  price_usd: number;
  credit_amount: number;
  active_days_addition: number;
}

export default function PricingPackages() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPackages() {
      const { data } = await supabase
        .from('credit_packages')
        .select('*')
        .order('price_idr', { ascending: true });
      
      if (data) setPackages(data);
      setIsLoading(false);
    }
    fetchPackages();
  }, []);

  const formatPrice = (price: number) => {
    if (i18n.resolvedLanguage === 'en') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const handleSubscribe = async (pkg: Package) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsProcessing(pkg.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-midtrans-transaction', {
        body: { package_id: pkg.id }
      });
      
      if (error) throw new Error(error.message);
      
      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error(data?.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading packages...</div>;
  }

  return (
    <div className="py-12 bg-surface rounded-3xl shadow-sm border border-outline-variant my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-on-surface sm:text-4xl">Upgrade Paket Kredit Anda</h2>
        <p className="mt-4 text-lg text-on-surface-variant">Dapatkan tambahan kredit dan masa aktif untuk akses penuh ke pencarian Google Maps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg) => {
          const price = i18n.resolvedLanguage === 'en' ? pkg.price_usd : pkg.price_idr;

          return (
            <div key={pkg.id} className="relative bg-surface border border-outline-variant rounded-2xl p-8 shadow-sm flex flex-col hover:border-primary hover:shadow-md transition-all">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-on-surface capitalize">{pkg.name}</h3>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold text-on-surface">
                  {formatPrice(price)}
                </div>
              </div>

              <ul className="mt-6 space-y-4 flex-1">
                <li className="flex gap-3">
                  <Zap className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-on-surface-variant text-sm">Tambahan <strong>{new Intl.NumberFormat('id-ID').format(pkg.credit_amount)} Kredit</strong></span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-on-surface-variant text-sm">Masa Aktif +<strong>{pkg.active_days_addition} Hari</strong></span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-on-surface-variant text-sm">Akses penuh hasil ekstraksi</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe(pkg)}
                disabled={isProcessing === pkg.id}
                className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-xl text-center text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                  pkg.name.toLowerCase() === 'business' ? 'bg-inverse-surface text-inverse-on-surface hover:bg-inverse-surface/90' : 'bg-primary text-on-primary hover:bg-primary/90'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isProcessing === pkg.id ? (
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <CreditCard size={18} />
                )}
                {isProcessing === pkg.id ? 'Memproses...' : `Beli Paket ${pkg.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
