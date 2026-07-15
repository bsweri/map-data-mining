import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, Settings, HelpCircle, MapPinned } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Pricing & Quota', path: '/admin/pricing', icon: CreditCard },
    { name: 'Global Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background font-inter">
      {/* Sidebar Navigation */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-surface-container-low border-r border-outline-variant flex flex-col py-6 z-50">
        <div className="px-6 mb-8">
          <Link to="/" className="text-2xl font-hanken font-bold text-primary cursor-pointer active:scale-95 transition-all flex items-center gap-2">
            <MapPinned size={24} />
            GeoExtract
          </Link>
          <p className="text-[10px] font-bold text-on-surface-variant opacity-70 mt-1 uppercase tracking-widest">ADMIN CONSOLE</p>
        </div>
        
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-secondary-container text-on-secondary-container font-bold' 
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Profile Card / Quota */}
        <div className="px-4 mt-auto border-t border-outline-variant pt-6">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
              AD
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Mining Admin</p>
              <p className="text-xs text-on-surface-variant">Quota: 850/1k</p>
            </div>
          </div>
          <button className="w-full py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:brightness-110 active:scale-95 transition-all mb-4">
            Upgrade Plan
          </button>
          
          <div className="flex flex-col gap-1">
            <a href="#" className="px-2 py-2 flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors text-xs font-medium" onClick={(e) => e.preventDefault()}>
              <HelpCircle size={16} />
              Support
            </a>
            <button 
              onClick={handleLogout}
              className="px-2 py-2 flex items-center gap-3 text-on-surface-variant hover:text-error transition-colors text-xs font-medium text-left"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 overflow-y-auto bg-surface flex flex-col min-h-screen">
        <div className="p-gutter flex-grow">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
