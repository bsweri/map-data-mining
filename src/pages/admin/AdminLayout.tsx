import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, Settings, MapPinned, Inbox as InboxIcon, Activity, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'API Monitoring', path: '/admin/api', icon: Activity },
    { name: 'Pricing & Quota', path: '/admin/pricing', icon: CreditCard },
    { name: 'Inbox', path: '/admin/messages', icon: InboxIcon },
    { name: 'Global Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    window.location.href = import.meta.env.BASE_URL || '/';
  };

  return (
    <div className="flex min-h-screen bg-surface text-on-surface font-inter">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity duration-300" 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-64 fixed left-0 top-0 h-screen bg-surface/80 backdrop-blur-xl border-r border-outline-variant flex flex-col py-6 z-50 shadow-sm transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="md:hidden absolute right-4 top-4 p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all"
        >
          <X size={18} />
        </button>

        <div className="px-6 mb-8">
          <Link to="/" className="text-2xl font-hanken font-bold text-primary cursor-pointer active:scale-95 transition-all flex items-center gap-2">
            <MapPinned size={24} />
            GeoExtract
          </Link>
          <p className="text-[10px] font-bold text-on-surface-variant opacity-70 mt-1 uppercase tracking-widest">ADMIN CONSOLE</p>
        </div>
        
        <nav className="px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-300 ease-in-out hover:-translate-y-0.5 ${
                  isActive 
                    ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm' 
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
        <div className="px-4 mt-4">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
                AD
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-on-surface">Mining Admin</p>
                <p className="text-xs text-on-surface-variant">System Administrator</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-outline-variant pt-4 flex flex-col gap-1">
            <button 
              onClick={handleLogout}
              className="px-4 py-2.5 mx-2 rounded-lg flex items-center gap-3 text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-all text-xs font-medium text-left"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-64 flex-1 overflow-y-auto bg-surface flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden h-16 px-gutter flex items-center justify-between sticky top-0 bg-surface/80 backdrop-blur-md border-b border-outline-variant z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-hanken text-lg font-bold text-on-surface">Admin Console</h2>
          </div>
        </header>

        <div className="p-gutter max-w-container-max mx-auto w-full flex-grow">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
