import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ScanLine, Menu, X, ArrowRight, LayoutDashboard, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { useStartInspection } from '../hooks/useStartInspection';
import { cn } from '../utils/cn';

interface NavItem {
  label: string;
  targetId: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', targetId: 'hero' },
  { label: 'How It Works', targetId: 'how-it-works' },
  { label: 'Features', targetId: 'features' },
  { label: 'Compliance', targetId: 'compliance' },
  { label: 'Technology', targetId: 'technology' },
  { label: 'Team', targetId: 'team' },
  { label: 'Contact', targetId: 'contact' },
];

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { handleStartInspection } = useStartInspection();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll detection for sticky background & blur transition
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 35);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section tracking via IntersectionObserver when on homepage
  useEffect(() => {
    if (location.pathname !== '/') {
      return;
    }

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -50% 0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.targetId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  // Smooth scroll handler
  const scrollToSection = useCallback((targetId: string) => {
    setIsMobileMenuOpen(false);

    if (location.pathname !== '/') {
      navigate('/', { replace: false });
      setTimeout(() => {
        if (targetId === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 50);
      return;
    }

    if (targetId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.pathname, navigate]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 w-full h-20 z-50 transition-all duration-300 ease-out',
          isScrolled
            ? 'bg-[rgba(9,13,26,0.88)] backdrop-blur-[16px] border-b border-white/[0.08] shadow-lg shadow-black/25'
            : 'bg-transparent border-b border-transparent'
        )}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Brand Logo - Redirects to Hero page */}
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center font-heading font-bold text-2xl tracking-tight text-white hover:opacity-90 transition-opacity focus:outline-none cursor-pointer"
            title="LegalMetrix AI - Return to Hero"
            aria-label="LegalMetrix AI - Return to Hero page"
          >
            <ScanLine className="w-8 h-8 text-primary mr-2.5 flex-shrink-0" />
            <span>
              LegalMetrix <span className="text-primary ml-0.5">AI</span>
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-white/[0.03] border border-white/[0.06] p-1.5 rounded-full backdrop-blur-sm">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.targetId && location.pathname === '/';
              return (
                <button
                  key={item.targetId}
                  onClick={() => scrollToSection(item.targetId)}
                  className={cn(
                    'relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 focus:outline-none',
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-header-pill"
                      className="absolute inset-0 bg-primary/20 border border-primary/40 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* CTA Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to="/dashboard">
                  <Button variant="secondary" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10">
                    <LayoutDashboard className="w-4 h-4 mr-2 text-primary" />
                    Dashboard
                  </Button>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 pl-2 pr-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
                  title="Inspector Profile"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold font-heading overflow-hidden">
                    {user.avatar || user.avatar_url ? (
                      <img src={user.avatar || user.avatar_url || ''} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name
                        .split(' ')
                        .filter(Boolean)
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || 'LM'
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-300 max-w-[110px] truncate">{user.name}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 p-2"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/5">
                    Sign In
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStartInspection('/new-inspection')}
                  className="shadow-lg shadow-primary/20"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center space-x-2">
            {isAuthenticated && (
              <Link to="/dashboard" className="sm:hidden">
                <Button variant="secondary" size="sm" className="h-8 px-2.5 text-xs">
                  Dashboard
                </Button>
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-white/10 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-x-0 top-20 z-40 bg-[#090D1A]/95 backdrop-blur-2xl border-b border-white/10 p-6 lg:hidden shadow-2xl"
          >
            <div className="flex flex-col space-y-4">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.targetId}
                  onClick={() => scrollToSection(item.targetId)}
                  className="text-left py-2 text-sm font-medium text-slate-300 hover:text-white hover:pl-2 transition-all"
                >
                  {item.label}
                </button>
              ))}

              <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="primary" className="w-full justify-center">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full justify-center">
                        <User className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full justify-center text-rose-400 hover:bg-rose-500/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full justify-center">
                        Sign In
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleStartInspection('/new-inspection');
                      }}
                      className="w-full justify-center"
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
