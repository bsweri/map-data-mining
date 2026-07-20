import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';

interface AdminSettings {
  id: string;
  monthly_free_credit: number;
  max_active_days: number;
  extraction_interval_seconds: number;
  ads_min_credit: number;
  grace_period_days: number;
  active_period_price_credit: number;
  active_period_days_addition: number;
}

export default function GlobalSettings() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setIsLoading(true);
    const { data } = await supabase
      .from('admin_settings')
      .select('*')
      .single();

    if (data) setSettings(data);
    setIsLoading(false);
  }

  const handleUpdate = (field: keyof AdminSettings, value: number) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const saveChanges = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('admin_settings').update({
        monthly_free_credit: settings.monthly_free_credit,
        max_active_days: settings.max_active_days,
        extraction_interval_seconds: settings.extraction_interval_seconds,
        ads_min_credit: settings.ads_min_credit,
        grace_period_days: settings.grace_period_days,
        active_period_price_credit: settings.active_period_price_credit,
        active_period_days_addition: settings.active_period_days_addition,
      }).eq('id', settings.id);

      if (error) throw error;
      alert('Global Settings berhasil disimpan!');
    } catch (e: any) {
      alert(e.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Loading settings...</div>;
  if (!settings) return <div>Failed to load settings.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Global Settings</h1>
        <button
          onClick={saveChanges}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
             <label className="text-xs font-medium text-slate-500">Monthly Free Credit</label>
             <input
               type="number"
               value={settings.monthly_free_credit}
               onChange={(e) => handleUpdate('monthly_free_credit', Number(e.target.value))}
               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
             />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-medium text-slate-500">Max Active Days Accumulation</label>
             <input
               type="number"
               value={settings.max_active_days}
               onChange={(e) => handleUpdate('max_active_days', Number(e.target.value))}
               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
             />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-medium text-slate-500">Extraction Interval (Seconds)</label>
             <input
               type="number"
               value={settings.extraction_interval_seconds}
               onChange={(e) => handleUpdate('extraction_interval_seconds', Number(e.target.value))}
               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
             />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-medium text-slate-500">Grace Period (Days)</label>
             <input
               type="number"
               value={settings.grace_period_days}
               onChange={(e) => handleUpdate('grace_period_days', Number(e.target.value))}
               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
             />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-medium text-slate-500">Minimum Credit to Show Ads</label>
             <input
               type="number"
               value={settings.ads_min_credit}
               onChange={(e) => handleUpdate('ads_min_credit', Number(e.target.value))}
               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
             />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-medium text-slate-500">Active Period Price (Credit)</label>
             <input
               type="number"
               value={settings.active_period_price_credit}
               onChange={(e) => handleUpdate('active_period_price_credit', Number(e.target.value))}
               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
             />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-medium text-slate-500">Active Period Addition (Days)</label>
             <input
               type="number"
               value={settings.active_period_days_addition}
               onChange={(e) => handleUpdate('active_period_days_addition', Number(e.target.value))}
               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
             />
          </div>
        </div>
      </div>
    </div>
  );
}
