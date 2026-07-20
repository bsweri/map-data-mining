import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';

interface CreditPackage {
  id: string;
  name: string;
  credit_amount: number;
  active_days_addition: number;
  price_idr: number;
  price_usd: number;
}

export default function PricingSettings() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    setIsLoading(true);
    const { data } = await supabase
      .from('credit_packages')
      .select('*')
      .order('price_idr', { ascending: true });

    if (data) setPackages(data);
    setIsLoading(false);
  }

  const handleUpdate = (id: string, field: keyof CreditPackage, value: number | string) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const updates = packages.map(p =>
        supabase.from('credit_packages').update({
          name: p.name,
          credit_amount: p.credit_amount,
          active_days_addition: p.active_days_addition,
          price_idr: p.price_idr,
          price_usd: p.price_usd
        }).eq('id', p.id)
      );

      await Promise.all(updates);
      alert('Paket kredit berhasil disimpan!');
    } catch (e: any) {
      alert(e.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Loading packages...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Credit Packages Settings</h1>
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
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 capitalize">{pkg.name} Package</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Package Name</label>
                <input
                  type="text"
                  value={pkg.name}
                  onChange={(e) => handleUpdate(pkg.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Credit Amount</label>
                <input
                  type="number"
                  value={pkg.credit_amount}
                  onChange={(e) => handleUpdate(pkg.id, 'credit_amount', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Active Days Addition</label>
                <input
                  type="number"
                  value={pkg.active_days_addition}
                  onChange={(e) => handleUpdate(pkg.id, 'active_days_addition', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Price (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                  <input
                    type="number"
                    value={pkg.price_idr}
                    onChange={(e) => handleUpdate(pkg.id, 'price_idr', Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    value={pkg.price_usd}
                    onChange={(e) => handleUpdate(pkg.id, 'price_usd', Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
