import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MapPinned, ShieldCheck, Lock, Activity, AlertTriangle, X } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard' + window.location.search);
      }
    }
  }, [user, profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}login${window.location.search}`,
      }
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-background relative overflow-hidden font-inter selection:bg-primary-container selection:text-white">
      {/* Mesh Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-tertiary/10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(at_0%_0%,rgba(37,99,235,0.05)_0px,transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(at_100%_0%,rgba(0,74,198,0.08)_0px,transparent_50%)]"></div>
      </div>

      <div className="w-full max-w-[480px] z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <MapPinned className="text-primary text-4xl" size={36} />
            <h1 className="font-hanken text-2xl font-bold text-primary tracking-tight">GeoExtract</h1>
          </div>
          <h2 className="font-hanken text-3xl font-bold text-on-surface">Welcome back</h2>
          <p className="font-inter text-sm text-on-surface-variant mt-2">Precision Geospatial Data Mining & Extraction</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg flex items-start gap-3 border border-error/20">
              <AlertTriangle className="text-error flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-grow">
                <p className="font-inter text-sm font-semibold">Authentication Error</p>
                <p className="font-inter text-xs mt-1 text-on-error-container/80">{error}</p>
              </div>
              <button 
                className="hover:bg-error/10 p-1 rounded-full transition-colors flex-shrink-0" 
                onClick={() => setError(null)}
              >
                <X size={16} className="text-on-error-container" />
              </button>
            </div>
          )}

          {/* Email/Password Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block font-inter text-sm font-medium text-on-surface mb-2" htmlFor="email">
                Email Address
              </label>
              <input 
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-inter text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" 
                id="email" 
                placeholder="name@company.com" 
                required 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-inter text-sm font-medium text-on-surface" htmlFor="password">
                  Password
                </label>
                <a className="font-inter text-xs text-primary hover:underline font-medium" href="#">
                  Forgot?
                </a>
              </div>
              <input 
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-inter text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" 
                id="password" 
                placeholder="••••••••" 
                required 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button 
              className="w-full h-12 bg-primary text-on-primary font-inter text-sm font-semibold rounded-lg hover:brightness-110 transition-all duration-200 shadow-sm active:scale-[0.98] disabled:bg-surface-variant disabled:text-outline disabled:cursor-not-allowed flex items-center justify-center" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Registration Link */}
          <p className="mt-8 text-center font-inter text-xs text-on-surface-variant">
            Don't have an account?{' '}
            <Link className="text-primary font-semibold hover:underline" to="/register">
              Request Access
            </Link>
          </p>

          {/* Divider */}
          <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="px-4 font-inter text-[10px] font-bold text-outline uppercase tracking-widest bg-surface-container-lowest">
              OR SIGN IN WITH
            </span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>

          {/* Google Login Button */}
          <button 
            onClick={handleGoogleLogin}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface font-inter text-sm font-semibold rounded-lg transition-all duration-200 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Sign in with Google
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
          <div className="flex items-center gap-1.5 text-on-surface">
            <ShieldCheck size={16} />
            <span className="font-inter text-xs font-semibold uppercase tracking-wider">ISO 27001 Certified</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface">
            <Lock size={16} />
            <span className="font-inter text-xs font-semibold uppercase tracking-wider">End-to-End Encryption</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface">
            <Activity size={16} />
            <span className="font-inter text-xs font-semibold uppercase tracking-wider">99.9% Uptime SLA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
