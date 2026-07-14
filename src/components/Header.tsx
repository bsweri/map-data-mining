import { MapPinned, LogIn, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LanguageCurrencySwitcher from './LanguageCurrencySwitcher';

export default function Header() {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();

  return (
    <header className="bg-surface/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-surface-variant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-primary">
          <div className="bg-primary-container p-2 rounded-lg">
            <MapPinned size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">{t('header.title')}</h1>
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          <LanguageCurrencySwitcher />
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-on-surface-variant bg-surface-variant px-3 py-1.5 rounded-full">
                <User size={16} />
                <span className="font-medium truncate max-w-[120px]">{user.email}</span>
                <span className="bg-primary-fixed text-on-primary-container px-2 py-0.5 rounded-full text-xs font-bold uppercase">
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
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-semibold text-primary bg-primary-container hover:bg-primary-fixed px-4 py-2 rounded-full transition-colors"
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">{t('header.login')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
