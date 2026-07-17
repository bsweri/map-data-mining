import { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  Download, 
  Globe, 
  Settings, 
  Search, 
  MoreVertical,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface Stats {
  totalUsers: number;
  totalFreeUsers: number;
  totalMembers: number;
  monthlyApiRequests: number;
  membershipCounts: Record<string, number>;
}

interface LogMessage {
  time: string;
  type: 'OK' | 'INFO' | 'WARN';
  message: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [latestUsers, setLatestUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Config state
  const [globalLimit, setGlobalLimit] = useState(50000);
  const [strictMode, setStrictMode] = useState(true);
  const [autoScaling, setAutoScaling] = useState(false);
  const [isApplyingConfig, setIsApplyingConfig] = useState(false);

  // Donation state

  const [isDonating, setIsDonating] = useState(false);

  // Live Logs state
  const [logs, setLogs] = useState<LogMessage[]>([
    { time: '14:22:01', type: 'OK', message: 'Extraction engine initialized' },
    { time: '14:22:05', type: 'INFO', message: 'API Request from IP 192.168.1.1' },
    { time: '14:22:08', type: 'INFO', message: 'GeoJSON chunk processed (3.2MB)' },
    { time: '14:22:15', type: 'WARN', message: 'Latency spike detected in EU-West' },
    { time: '14:22:20', type: 'INFO', message: 'Backup synchronization complete' },
    { time: '14:22:25', type: 'INFO', message: 'User #GE-9021 authenticated' },
  ]);

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
      const { data: localIds } = await supabase
        .from('api_usage_logs')
        .select('local_storage_id')
        .not('local_storage_id', 'is', null)
        .gte('created_at', startOfMonth.toISOString());

      const uniqueLocalIds = new Set(localIds?.map(item => item.local_storage_id));
      const totalFreeUsers = membershipCounts.free + uniqueLocalIds.size; // registered free + anonymous free

      // Get latest users
      const { data: latest } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (latest) {
        setLatestUsers(latest);
      }

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

  // Simulate server logs live streaming
  useEffect(() => {
    const logInterval = setInterval(() => {
      const messages = [
        'Garbage collector started',
        'Database query cache flushed',
        'Outbound webhook delivered to client #8192',
        'Supabase Auth callback resolved successfully',
        'Resource usage check: CPU 24% | Memory 62%',
        'GeoExtract proxy server health checks passed',
      ];
      const types: ('OK' | 'INFO' | 'WARN')[] = ['OK', 'INFO', 'WARN'];
      
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const randomType = types[Math.floor(Math.random() * 1.8)]; // skew towards OK/INFO
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      setLogs(prev => [...prev.slice(1), { time: timeStr, type: randomType, message: randomMsg }]);
    }, 4500);

    return () => clearInterval(logInterval);
  }, []);

  const handleApplyConfig = () => {
    setIsApplyingConfig(true);
    setTimeout(() => {
      setIsApplyingConfig(false);
      alert('Success: Configuration updated successfully.');
    }, 1200);
  };

  const handlePayPalDonation = () => {
    setIsDonating(true);
    // Kunci donasi ke 5 USD
    const finalAmount = 5;
    
    // Bentuk URL donasi PayPal Mode Production ke akun tujuan eriandi.susanto@gmail.com
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=eriandi.susanto@gmail.com&currency_code=USD&amount=${finalAmount.toFixed(2)}&item_name=GeoExtract+Development+Support`;
    
    window.location.href = paypalUrl;
  };

  if (isLoading) return <div className="p-8 text-center text-sm font-semibold text-on-surface-variant">Loading dashboard stats...</div>;
  if (!stats) return <div className="p-8 text-center text-sm font-semibold text-on-surface-variant">Failed to load stats.</div>;

  const filteredUsers = latestUsers.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Top Header */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-hanken text-3xl font-bold text-on-surface">Mining Dashboard</h2>
          <p className="font-inter text-sm text-on-surface-variant mt-1">System-wide monitoring and geospatial resource management.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 bg-surface-container-high text-on-surface rounded-lg font-inter text-xs font-semibold flex items-center gap-2 hover:bg-surface-variant transition-all active:scale-[0.98]">
            <Download size={16} /> Export Report
          </button>
          <button className="px-4 py-2.5 bg-primary text-on-primary rounded-lg font-inter text-xs font-bold flex items-center gap-2 hover:brightness-110 transition-all active:scale-[0.98]">
            <RefreshCw size={16} /> Force Sync
          </button>
        </div>
      </header>

      {/* Stats Grid (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <div>
            <h3 className="font-inter text-xs text-on-surface-variant mb-1 font-semibold uppercase tracking-wider">Total Users</h3>
            <p className="font-hanken text-2xl font-bold text-on-surface">{stats.totalUsers.toLocaleString()}</p>
          </div>
        </div>

        {/* API Calls */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary-container text-on-secondary-container rounded-lg">
              <Activity size={20} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+{stats.monthlyApiRequests > 1000 ? `${(stats.monthlyApiRequests / 1000).toFixed(1)}k` : stats.monthlyApiRequests}</span>
          </div>
          <div>
            <h3 className="font-inter text-xs text-on-surface-variant mb-1 font-semibold uppercase tracking-wider">API Calls (Month)</h3>
            <p className="font-hanken text-2xl font-bold text-on-surface">{stats.monthlyApiRequests.toLocaleString()}</p>
          </div>
        </div>

        {/* Active Premium */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-tertiary-fixed rounded-lg text-primary">
              <ShieldCheck size={20} />
            </div>
            <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
              {stats.totalUsers > 0 ? `${((stats.totalMembers / stats.totalUsers) * 100).toFixed(0)}%` : '0%'} Ratio
            </span>
          </div>
          <div>
            <h3 className="font-inter text-xs text-on-surface-variant mb-1 font-semibold uppercase tracking-wider">Active Premium</h3>
            <p className="font-hanken text-2xl font-bold text-on-surface">{stats.totalMembers}</p>
          </div>
        </div>

        {/* Server Latency */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-error-container text-error rounded-lg">
              <Database size={20} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Stable</span>
          </div>
          <div>
            <h3 className="font-inter text-xs text-on-surface-variant mb-1 font-semibold uppercase tracking-wider">Server Latency</h3>
            <p className="font-hanken text-2xl font-bold text-on-surface">42ms</p>
          </div>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {/* User Management Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant flex flex-col overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
            <h3 className="font-hanken text-lg font-bold text-on-surface">User Management</h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg font-inter text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-surface text-on-surface"
              />
              <Search className="absolute left-3 top-2.5 text-on-surface-variant" size={16} />
            </div>
          </div>
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 font-inter text-xs font-semibold text-on-surface-variant">Email</th>
                  <th className="px-6 py-4 font-inter text-xs font-semibold text-on-surface-variant">Joined</th>
                  <th className="px-6 py-4 font-inter text-xs font-semibold text-on-surface-variant">Role</th>
                  <th className="px-6 py-4 font-inter text-xs font-semibold text-on-surface-variant">Membership</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4 font-inter text-xs font-medium text-on-surface">{user.email}</td>
                    <td className="px-6 py-4 font-inter text-xs text-on-surface-variant">
                      {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.role === 'admin' ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'admin' ? (
                        <span className="font-inter text-xs text-outline font-semibold">N/A</span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          user.current_membership === 'platinum' ? 'bg-slate-800 text-slate-100' :
                          user.current_membership === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                          user.current_membership === 'silver' ? 'bg-slate-200 text-slate-800' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {user.current_membership}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to="/admin/users" className="p-1 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant opacity-0 group-hover:opacity-100">
                        <MoreVertical size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-xs text-on-surface-variant">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-outline-variant flex justify-center bg-surface-container-lowest">
            <Link to="/admin/users" className="text-primary font-inter text-xs font-bold hover:underline hover:text-primary-container transition-colors">
              View All {stats.totalUsers} Registered Accounts
            </Link>
          </div>
        </div>

        {/* Config & System Status Panel */}
        <div className="space-y-6">
          {/* System Config */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 hover:shadow-md transition-shadow">
            <h3 className="font-hanken text-base font-bold text-on-surface mb-6 flex items-center gap-2">
              <Settings className="text-primary" size={18} /> Config Panel
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-inter text-xs text-on-surface">API Global Limit</span>
                <input 
                  type="number" 
                  value={globalLimit} 
                  onChange={(e) => setGlobalLimit(Number(e.target.value))}
                  className="w-24 px-2 py-1.5 border border-outline-variant rounded-md bg-surface-container-low font-inter text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center transition-all"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-inter text-xs text-on-surface">Strict Extraction</span>
                <button 
                  onClick={() => setStrictMode(!strictMode)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${strictMode ? 'bg-primary' : 'bg-outline-variant'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${strictMode ? 'right-1' : 'left-1'}`}></span>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-inter text-xs text-on-surface">Auto-Scaling</span>
                <button 
                  onClick={() => setAutoScaling(!autoScaling)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${autoScaling ? 'bg-primary' : 'bg-outline-variant'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${autoScaling ? 'right-1' : 'left-1'}`}></span>
                </button>
              </div>
              <hr className="border-outline-variant" />
              <button 
                onClick={handleApplyConfig}
                disabled={isApplyingConfig}
                className="w-full py-2.5 bg-primary text-on-primary rounded-lg font-inter text-xs font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-75"
              >
                {isApplyingConfig ? 'Applying...' : 'Apply Changes'}
              </button>
            </div>
          </div>

          {/* Server Logs (Terminal Style) */}
          <div className="bg-inverse-surface rounded-xl shadow-lg border border-inverse-surface p-6 flex flex-col h-64 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="font-inter text-xs font-bold uppercase tracking-wider text-inverse-on-surface">Live Server Logs</h3>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-green-400">ACTIVE</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto font-mono text-[10.5px] leading-relaxed text-inverse-on-surface bg-black/40 p-3.5 rounded-lg space-y-1.5 custom-scrollbar relative z-10 border border-white/5">
              {logs.map((log, idx) => (
                <p key={idx} className={log.type === 'OK' ? 'text-green-400' : log.type === 'WARN' ? 'text-amber-400' : 'text-slate-300'}>
                  <span className="opacity-50">[{log.time}]</span> <span className="font-bold">[{log.type}]</span> <span className="opacity-90">{log.message}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Focus Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <div className="lg:col-span-3 rounded-xl overflow-hidden relative h-[360px] shadow-sm border border-outline-variant bg-slate-100 flex flex-col justify-between p-6">
          {/* Map Overlay Simulation */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-tertiary/10 z-0"></div>
          
          <div className="z-10 bg-surface/90 backdrop-blur-md px-4 py-2.5 rounded-lg border border-outline-variant flex items-center gap-3 w-fit shadow-sm">
            <Globe className="text-primary animate-spin" style={{ animationDuration: '8s' }} size={20} />
            <div>
              <p className="font-inter text-xs font-bold text-on-surface">San Francisco, CA</p>
              <p className="font-inter text-[10px] text-on-surface-variant">Active Monitoring Zone</p>
            </div>
          </div>

          <div className="z-10 bg-surface/90 backdrop-blur-md p-3 rounded-lg border border-outline-variant w-fit self-end shadow-sm">
            <p className="font-inter text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Live Extraction Rate</p>
            <p className="font-hanken text-lg font-bold text-primary">2.4 GB/s</p>
          </div>
        </div>

        {/* Side Ad Container */}
        <div className="bg-surface-container-low rounded-xl border border-outline-variant flex flex-col items-center justify-center p-6 text-center space-y-4 hover:border-primary/30 transition-colors">
          <span className="font-inter text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-50">Advertisement</span>
          <div className="w-full bg-surface-container-lowest rounded-lg flex flex-col items-center p-5 shadow-sm border border-outline-variant/50 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
              <Globe size={24} />
            </div>
            <p className="font-inter text-sm font-bold text-on-surface mb-1">Precision Maps Pro</p>
            <p className="font-inter text-[10px] text-on-surface-variant mb-4 leading-relaxed px-2">Unlock vector data across 40 countries instantly with no rate limits.</p>
            <button className="text-primary font-bold text-xs hover:underline" onClick={(e) => e.preventDefault()}>Learn More</button>
          </div>
        </div>
      </div>

      {/* Featured PayPal Fund Component (Infrastructure Fund) */}
      <section className="pb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 to-tertiary/10 p-8 border border-primary/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-full border border-primary/20 mb-4 shadow-sm">
                <CheckCircle className="text-primary" size={14} />
                <span className="font-inter text-[10px] font-bold text-primary uppercase tracking-wider">SUPPORT OUR DEVELOPMENT</span>
              </div>
              <h2 className="font-hanken text-2xl font-bold text-on-surface mb-3">Buy me a Coffee</h2>
              <p className="font-inter text-sm text-on-surface-variant leading-relaxed max-w-lg">
                Contribute to our open geospatial research fund. All transactions are securely handled with end-to-end encryption.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3 flex-shrink-0">
              <div className="text-center md:text-right w-full">
                <p className="font-inter text-[10px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Amount (USD)</p>
                <input 
                  className="text-center font-hanken text-lg font-bold bg-surface-variant/50 border border-outline-variant rounded-xl w-32 md:w-40 py-2 text-on-surface opacity-80 cursor-not-allowed" 
                  type="text" 
                  value="5.00"
                  readOnly
                />
              </div>
              <button 
                onClick={handlePayPalDonation}
                disabled={isDonating}
                className="w-full md:w-auto px-8 py-3 bg-primary text-on-primary rounded-xl font-bold font-inter text-xs shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70"
              >
                {isDonating ? 'Connecting...' : 'Buy me a Coffee'}
              </button>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
        </div>
      </section>
    </div>
  );
}
