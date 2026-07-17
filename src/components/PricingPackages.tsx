import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Plan {
  id: string;
  level: string;
  price_idr: number;
  price_usd: number;
  discount_1_month: number;
  discount_3_months: number;
  discount_6_months: number;
  discount_12_months: number;
  daily_credit_quota: number;
  monthly_credit_quota: number;
}

const PERIODS = [
  { value: 1, label: '1 Bulan' },
  { value: 3, label: '3 Bulan' },
  { value: 6, label: '6 Bulan' },
  { value: 12, label: '1 Tahun' },
];

export default function PricingPackages() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [period, setPeriod] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      const { data } = await supabase
        .from('membership_plans')
        .select('*')
        .neq('level', 'free')
        .order('price_idr', { ascending: true });
      
      if (data) setPlans(data);
      setIsLoading(false);
    }
    fetchPlans();
  }, []);

  const formatPrice = (price: number) => {
    if (i18n.resolvedLanguage === 'en') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const getDiscount = (plan: Plan) => {
    switch (period) {
      case 3: return plan.discount_3_months;
      case 6: return plan.discount_6_months;
      case 12: return plan.discount_12_months;
      default: return plan.discount_1_month;
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const basePrice = i18n.resolvedLanguage === 'en' ? plan.price_usd : plan.price_idr;
    const discount = getDiscount(plan);
    const finalPrice = (basePrice * period) * (1 - discount / 100);

    // TODO: Connect to payment gateways here
    alert(`Mengarahkan ke pembayaran untuk paket ${plan.level.toUpperCase()} selama ${period} bulan.\nTotal: ${formatPrice(finalPrice)}`);
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading packages...</div>;
  }

  return (
    <div className="py-12 bg-surface rounded-3xl shadow-sm border border-outline-variant my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-on-surface sm:text-4xl">Upgrade Paket Anda</h2>
        <p className="mt-4 text-lg text-on-surface-variant">Dapatkan akses pencarian tanpa batas dan fitur eksklusif lainnya dengan berlangganan.</p>
      </div>

      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-surface-variant p-1 rounded-xl">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                period === p.value 
                  ? 'bg-surface text-primary shadow-sm' 
                  : 'text-outline hover:text-on-surface-variant'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const basePrice = i18n.resolvedLanguage === 'en' ? plan.price_usd : plan.price_idr;
          const discount = getDiscount(plan);
          const finalPrice = (basePrice * period) * (1 - discount / 100);

          return (
            <div key={plan.id} className="relative bg-surface border border-outline-variant rounded-2xl p-8 shadow-sm flex flex-col hover:border-primary hover:shadow-md transition-all">
              {discount > 0 && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
                  <span className="bg-error text-on-error text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
                    Hemat {discount}%
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-on-surface capitalize">{plan.level}</h3>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold text-on-surface">
                  {formatPrice(finalPrice)}
                  <span className="ml-1 text-xl font-medium text-on-surface-variant">/{period > 1 ? `${period} bln` : 'bln'}</span>
                </div>
                {discount > 0 && (
                  <div className="mt-1 text-sm text-outline line-through">
                    {formatPrice(basePrice * period)}
                  </div>
                )}
              </div>

              <ul className="mt-6 space-y-4 flex-1">
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-on-surface-variant text-sm">Batas Harian: <strong>{plan.daily_credit_quota}</strong> request</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-on-surface-variant text-sm">Batas Bulanan: <strong>{plan.monthly_credit_quota}</strong> request</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-on-surface-variant text-sm">Akses penuh ke pencarian Google Maps</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-xl text-center text-sm font-semibold transition-colors ${
                  plan.level === 'business' ? 'bg-inverse-surface text-inverse-on-surface hover:bg-inverse-surface/90' : 'bg-primary text-on-primary hover:bg-primary/90'
                }`}
              >
                Pilih {plan.level}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
