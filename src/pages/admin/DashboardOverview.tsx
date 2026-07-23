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
  MoreVertical
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface Stats {
  totalUsers: number;
  totalFreeUsers: number; // For users with 0 credit or anonymous
  totalActiveUsers: number; // Users with status 'active' and credit > 0
  monthlyApiRequests: number;
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
  
  const [onlineUsersCount, setOnlineUsersCount] = useState<number>(0);
  
  // Config state
  const [globalLimit, setGlobalLimit] = useState(50000);
  const [strictMode, setStrictMode] = useState(true);
  const [autoScaling, setAutoScaling] = useState(false);
  const [isApplyingConfig, setIsApplyingConfig] = useState(false);

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
      // 1. Get total users count (role = user) using exact count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user');

      // 2. Get total active users (status = active AND credit > 0)
      const { count: totalActiveUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user')
        .eq('status', 'active')
        .gt('credit', 0);

      // 3. Get total free/inactive users (credit = 0 or status != active)
      const totalFreeUsers = (totalUsers || 0) - (totalActiveUsers || 0);

      // Get this month's API usage
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);
      
      const { count: monthlyApiRequests } = await supabase
        .from('api_usage_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

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
        totalUsers: totalUsers || 0,
        totalFreeUsers,
        totalActiveUsers: totalActiveUsers || 0,
        monthlyApiRequests: monthlyApiRequests || 0
      });
      setIsLoading(false);
    }
    
    fetchStats();
  }, []);

  // Poll database for Online Users count (Analytics sync)
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      // 11 minutes tolerance for heartbeat
      const elevenMinsAgo = new Date(Date.now() - 11 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('user_sessions')
        .select('user_id')
        .gte('last_seen_at', elevenMinsAgo);
        
      if (data && !error) {
        const uniqueUsers = new Set(data.map(d => d.user_id));
        setOnlineUsersCount(uniqueUsers.size);
      }
    };

    fetchOnlineUsers();
    // Refresh the count every 10 seconds to keep it "live"
    const interval = setInterval(fetchOnlineUsers, 10000);
    return () => clearInterval(interval);
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
          <h2 className="font-hanken text-3xl font-bold text-on-surface">Administrator Dashboard</h2>
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
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

        {/* Active Users */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-tertiary-fixed rounded-lg text-primary">
              <ShieldCheck size={20} />
            </div>
            <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
              {stats.totalUsers > 0 ? `${((stats.totalActiveUsers / stats.totalUsers) * 100).toFixed(0)}%` : '0%'} Ratio
            </span>
          </div>
          <div>
            <h3 className="font-inter text-xs text-on-surface-variant mb-1 font-semibold uppercase tracking-wider">Active Users</h3>
            <p className="font-hanken text-2xl font-bold text-on-surface">{stats.totalActiveUsers}</p>
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

        {/* Online Users */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary-container text-secondary rounded-lg">
              <Globe size={20} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Live</span>
          </div>
          <div>
            <h3 className="font-inter text-xs text-on-surface-variant mb-1 font-semibold uppercase tracking-wider">Online Users</h3>
            <p className="font-hanken text-2xl font-bold text-on-surface">{onlineUsersCount}</p>
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
                  <th className="px-6 py-4 font-inter text-xs font-semibold text-on-surface-variant">Credits</th>
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
                        <span className="font-inter text-xs text-outline font-semibold">Unlimited</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status || 'Inactive'}
                          </span>
                          <span className="font-inter text-xs font-bold text-on-surface">
                            {user.credit} <span className="font-normal text-on-surface-variant">Cr</span>
                          </span>
                        </div>
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

    </div>
  );
}
