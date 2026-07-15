import { useState, useEffect } from 'react';
import { Users, Activity, Target, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  totalUsers: number;
  totalFreeUsers: number;
  totalMembers: number;
  monthlyApiRequests: number;
  membershipCounts: Record<string, number>;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      
      // Get all user profiles (excluding admins)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('current_membership, role')
        .eq('role', 'user');

      const membershipCounts: Record<string, number> = {
        free: 0, silver: 0, gold: 0, platinum: 0
      };

      let totalMembers = 0;
      let totalUsers = 0;

      if (profiles) {
        totalUsers = profiles.length;
        profiles.forEach(p => {
          membershipCounts[p.current_membership] = (membershipCounts[p.current_membership] || 0) + 1;
          if (p.current_membership !== 'free') {
            totalMembers++;
          }
        });
      }

      // Get this month's API usage
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);
      
      const { count: monthlyApiRequests } = await supabase
        .from('api_usage_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Get unique free users from logs (estimated by local_storage_id)
      // Since supabase doesn't support COUNT DISTINCT directly via JS client, we fetch local_ids
      const { data: localIds } = await supabase
        .from('api_usage_logs')
        .select('local_storage_id')
        .not('local_storage_id', 'is', null)
        .gte('created_at', startOfMonth.toISOString());

      const uniqueLocalIds = new Set(localIds?.map(item => item.local_storage_id));
      const totalFreeUsers = membershipCounts.free + uniqueLocalIds.size; // registered free + anonymous free

      setStats({
        totalUsers,
        totalFreeUsers,
        totalMembers,
        monthlyApiRequests: monthlyApiRequests || 0,
        membershipCounts
      });
      setIsLoading(false);
    }
    
    fetchStats();
  }, []);

  if (isLoading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>Failed to load stats.</div>;

  const statCards = [
    { label: 'Total API Requests (Bulan Ini)', value: stats.monthlyApiRequests.toLocaleString(), icon: Activity, color: 'text-blue-500', bg: 'bg-blue-100' },
    { label: 'Total Paid Members', value: stats.totalMembers, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { label: 'Total Free Users (Aktif)', value: stats.totalFreeUsers, icon: Users, color: 'text-slate-500', bg: 'bg-slate-100' },
    { label: 'Total Registered Users', value: stats.totalUsers, icon: Target, color: 'text-purple-500', bg: 'bg-purple-100' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${card.bg} ${card.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Membership Distribution</h2>
        <div className="space-y-4">
          {Object.entries(stats.membershipCounts).map(([level, count]) => (
            <div key={level} className="flex items-center">
              <div className="w-24 text-sm font-semibold text-slate-700 capitalize">{level}</div>
              <div className="flex-1 ml-4 h-4 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${level === 'platinum' ? 'bg-slate-800' : level === 'gold' ? 'bg-yellow-500' : level === 'silver' ? 'bg-slate-400' : 'bg-blue-300'}`}
                  style={{ width: `${stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="w-12 text-right text-sm text-slate-500 font-medium">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
