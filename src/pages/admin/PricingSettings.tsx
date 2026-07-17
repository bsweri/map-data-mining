import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';

interface Plan {
  id: string;
  level: string;
  price_idr: number;
  price_usd: number;
  daily_credit_quota: number;
  weekly_credit_quota: number;
  monthly_credit_quota: number;
}

export default function PricingSettings() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    setIsLoading(true);
    const { data } = await supabase
      .from('membership_plans')
      .select('*')
      .order('price_idr', { ascending: true });

    if (data) setPlans(data);
    setIsLoading(false);
  }

  const handleUpdate = (id: string, field: keyof Plan, value: number) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const updates = plans.map(p =>
        supabase.from('membership_plans').update({
          price_idr: p.price_idr,
          price_usd: p.price_usd,
          daily_credit_quota: p.daily_credit_quota,
          weekly_credit_quota: p.weekly_credit_quota,
          monthly_credit_quota: p.monthly_credit_quota
        }).eq('id', p.id)
      );

      await Promise.all(updates);
      alert('Pengaturan harga & kuota berhasil disimpan!');
    } catch (e: any) {
      alert(e.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Pricing & Quota Settings</h1>
        <button
          onClick={saveChanges}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 capitalize">{plan.level} Plan</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${plan.level === 'business' ? 'bg-slate-800 text-slate-100' :
                  plan.level === 'pro' ? 'bg-yellow-100 text-yellow-800' :
                    plan.level === 'starter' ? 'bg-slate-200 text-slate-800' :
                      'bg-blue-50 text-blue-600'
                }`}>
                {plan.level}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Price per Month (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                  <input
                    type="number"
                    value={plan.price_idr}
                    onChange={(e) => handleUpdate(plan.id, 'price_idr', Number(e.target.value))}
                    disabled={plan.level === 'free'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Price per Month (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    value={plan.price_usd}
                    onChange={(e) => handleUpdate(plan.id, 'price_usd', Number(e.target.value))}
                    disabled={plan.level === 'free'}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Daily Credit Limit</label>
                <input
                  type="number"
                  value={plan.daily_credit_quota}
                  onChange={(e) => handleUpdate(plan.id, 'daily_credit_quota', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Weekly Credit Limit</label>
                <input
                  type="number"
                  value={plan.weekly_credit_quota}
                  onChange={(e) => handleUpdate(plan.id, 'weekly_credit_quota', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Monthly Credit Limit</label>
                <input
                  type="number"
                  value={plan.monthly_credit_quota}
                  onChange={(e) => handleUpdate(plan.id, 'monthly_credit_quota', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
