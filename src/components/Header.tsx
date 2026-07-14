import { MapPinned, LogIn, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LanguageCurrencySwitcher from './LanguageCurrencySwitcher';

export default function Header() {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant shadow-sm h-16">
      <div className="flex justify-between items-center px-gutter max-w-container-max mx-auto h-full">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-hanken font-bold text-primary cursor-pointer active:scale-95 transition-all flex items-center gap-2">
            <MapPinned size={24} strokeWidth={2.5} />
            GeoExtract
          </Link>
          <div className="hidden md:flex gap-6">
            <Link to="/" className="text-primary border-b-2 border-primary pb-1 font-inter text-sm font-medium cursor-pointer transition-all active:scale-95">Home</Link>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-inter text-sm font-medium cursor-pointer active:scale-95">Dashboard</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-inter text-sm font-medium cursor-pointer active:scale-95">About</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-inter text-sm font-medium cursor-pointer active:scale-95">Contact</a>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <LanguageCurrencySwitcher />
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-on-surface-variant bg-surface-variant px-3 py-1.5 rounded-full">
                <User size={16} />
                <span className="font-medium truncate max-w-[120px]">{user.email}</span>
                <span className="bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full text-xs font-bold uppercase">
                  {profile?.current_membership || 'FREE'}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-error transition-colors"
                title={t('header.logout')}
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">{t('header.logout')}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden md:block px-4 py-2 text-primary font-inter text-sm font-medium hover:bg-surface-container-low rounded-lg transition-all active:scale-95">
                Login
              </Link>
              <Link to="/login" className="px-5 py-2 bg-primary text-on-primary rounded-lg font-inter text-sm font-medium shadow-sm hover:brightness-110 transition-all active:scale-95">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
