import { useState } from 'react';
import { MapPinned, ChevronDown, Menu, X, Map, FileText, Search, Database, Mail, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  
  // Mobile accordion states
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant h-16">
        <div className="flex justify-between items-center px-gutter max-w-container-max mx-auto h-full">
          <div className="flex items-center gap-10 h-full">
            <Link to="/" className="text-2xl font-hanken font-bold text-primary cursor-pointer active:scale-95 transition-all flex items-center gap-2">
              <MapPinned size={24} strokeWidth={2.5} />
              GeoExtract
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-8 h-full">
              {/* Services Dropdown */}
              {!user && (
                <div 
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                >
                  <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors font-inter text-sm font-medium py-5">
                    SERVICES
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isServicesOpen && (
                    <div className="absolute top-full left-0 w-72 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <a className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 rounded-lg transition-all group" href="#">
                        <Map size={18} className="text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary">Google Maps API</span>
                      </a>
                      <a className="flex items-center gap-3 px-4 py-3 opacity-50 cursor-not-allowed rounded-lg" href="#" onClick={(e) => e.preventDefault()}>
                        <FileText size={18} className="text-primary opacity-60" />
                        <span className="text-sm font-medium text-on-surface-variant">Yellow Pages Scraper</span>
                      </a>
                      <a className="flex items-center gap-3 px-4 py-3 opacity-50 cursor-not-allowed rounded-lg" href="#" onClick={(e) => e.preventDefault()}>
                        <Search size={18} className="text-primary opacity-60" />
                        <span className="text-sm font-medium text-on-surface-variant">Google Search Scraper</span>
                      </a>
                      <div className="border-t border-outline-variant my-1"></div>
                      <a className="flex items-center gap-3 px-4 py-3 opacity-50 cursor-not-allowed rounded-lg" href="#" onClick={(e) => e.preventDefault()}>
                        <Database size={18} className="text-primary" />
                        <span className="text-sm font-semibold text-primary">Others Data Mining</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {user && (
                <a className="flex items-center text-on-surface-variant hover:text-primary transition-colors font-inter text-sm font-medium h-full" href="#">AFFILIATE</a>
              )}
              <a className="flex items-center text-on-surface-variant hover:text-primary transition-colors font-inter text-sm font-medium h-full" href="#">FAQ</a>

              {/* About Us Dropdown */}
              <div 
                className="relative h-full flex items-center"
                onMouseEnter={() => setIsAboutOpen(true)}
                onMouseLeave={() => setIsAboutOpen(false)}
              >
                <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors font-inter text-sm font-medium py-5">
                  ABOUT US
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isAboutOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAboutOpen && (
                  <div className="absolute top-full left-0 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 rounded-lg transition-all text-sm font-medium text-on-surface-variant hover:text-primary group">
                      <User size={16} className="text-on-surface-variant group-hover:text-primary" />
                      Profile
                    </Link>
                    <Link to="/contact" className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 rounded-lg transition-all text-sm font-medium text-on-surface-variant hover:text-primary group">
                      <Mail size={16} className="text-on-surface-variant group-hover:text-primary" />
                      Contact Us
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden md:block px-4 py-2 text-primary font-inter text-sm font-semibold hover:bg-primary/5 rounded-lg transition-all active:scale-95">
              LOGIN
            </Link>
            <Link to="/register" className="px-5 py-2 bg-primary text-on-primary rounded-lg font-inter text-sm font-medium shadow-sm hover:brightness-110 transition-all active:scale-95">
              SIGN UP
            </Link>
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-on-surface-variant active:scale-90 transition-transform" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-surface overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="p-gutter">
            <div className="flex justify-between items-center mb-8">
              <span className="text-2xl font-hanken font-bold text-primary">GeoExtract</span>
              <button className="p-2 active:scale-90 transition-transform" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              {/* Services Accordion */}
              {!user && (
                <div>
                  <button 
                    className="w-full flex items-center justify-between py-4 text-xl text-on-surface border-b border-outline-variant text-left outline-none"
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  >
                    SERVICES
                    <ChevronDown size={20} className={`transition-transform duration-300 ${mobileServicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileServicesOpen && (
                    <div className="flex flex-col gap-1 bg-surface-container-low px-4 py-2 rounded-lg mt-2 overflow-hidden">
                      <a className="py-3 text-base text-on-surface-variant border-b border-outline-variant/30" href="#" onClick={() => setIsMobileMenuOpen(false)}>Google Maps API</a>
                      <a className="py-3 text-base text-on-surface-variant border-b border-outline-variant/30 opacity-50 cursor-not-allowed" href="#" onClick={(e) => e.preventDefault()}>Yellow Pages Scraper</a>
                      <a className="py-3 text-base text-on-surface-variant border-b border-outline-variant/30 opacity-50 cursor-not-allowed" href="#" onClick={(e) => e.preventDefault()}>Google Search Scraper</a>
                      <a className="py-3 text-base text-primary font-semibold opacity-50 cursor-not-allowed" href="#" onClick={(e) => e.preventDefault()}>Others Data Mining</a>
                    </div>
                  )}
                </div>
              )}

              {user && (
                <a className="py-4 text-xl text-on-surface border-b border-outline-variant" href="#" onClick={() => setIsMobileMenuOpen(false)}>AFFILIATE</a>
              )}
              <a className="py-4 text-xl text-on-surface border-b border-outline-variant" href="#" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>

              {/* About Us Accordion */}
              <div>
                <button 
                  className="w-full flex items-center justify-between py-4 text-xl text-on-surface border-b border-outline-variant text-left outline-none"
                  onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                >
                  ABOUT US
                  <ChevronDown size={20} className={`transition-transform duration-300 ${mobileAboutOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileAboutOpen && (
                  <div className="flex flex-col gap-1 bg-surface-container-low px-4 py-2 rounded-lg mt-2 overflow-hidden">
                    <Link to="/profile" className="py-3 text-base text-on-surface-variant border-b border-outline-variant/30" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                    <Link to="/contact" className="py-3 text-base text-on-surface-variant" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-4">
                <Link 
                  to="/login" 
                  className="w-full py-4 text-center text-primary font-bold text-sm border-2 border-primary rounded-xl active:scale-[0.98] transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  LOGIN
                </Link>
                <Link 
                  to="/register" 
                  className="w-full py-4 text-center bg-primary text-on-primary font-bold text-sm rounded-xl shadow-lg active:scale-[0.98] transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  SIGN UP FREE
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
