import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scale,  ScanLine, Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, CheckCircle2  } from "lucide-react";
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const stateFrom = (location.state as { from?: { pathname?: string; search?: string } })?.from;
  const rawTarget = redirectParam || (stateFrom ? stateFrom.pathname + (stateFrom.search || '') : null);

  // Validate internal redirect path
  const targetDestination =
    rawTarget && rawTarget.startsWith('/') && !rawTarget.startsWith('//')
      ? rawTarget
      : '/dashboard';

  const [email, setEmail] = useState('inspector.delhi@gov.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(targetDestination, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, targetDestination]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Official email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid official email address format.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(cleanEmail, password);
      if (res.success) {
        setIsSuccess(true);
        showToast('Successfully signed in. Welcome back!', 'success');

        // Check if there was an intended destination stored
        let destination = targetDestination;
        try {
          const stored = sessionStorage.getItem('legalmetrix_intended_destination');
          if (stored && stored.startsWith('/') && !stored.startsWith('//')) {
            destination = stored;
            sessionStorage.removeItem('legalmetrix_intended_destination');
          }
        } catch {
          // ignore
        }

        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 400);
      } else {
        setError(res.error || 'Email or password is incorrect.');
        showToast(res.error || 'Authentication failed.', 'error');
      }
    } catch {
      setError('Unable to connect. Please check your internet connection and try again.');
      showToast('Network error.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex">
      {/* Left side - Branding visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#121A2E] overflow-hidden items-center justify-center border-r border-white/10">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/20 to-transparent" />
          <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg p-12 space-y-8">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center font-heading font-bold text-3xl tracking-tight text-white mb-8 hover:opacity-90 transition-opacity cursor-pointer"
            title="LegalMetrix AI - Return to Hero"
          >
            <Scale className="w-10 h-10 text-primary mr-3" />
            LegalMetrix <span className="text-primary ml-1">AI</span>
          </Link>

          <h1 className="text-4xl font-heading font-bold text-white leading-tight">
            Advanced Compliance <br /> Enforcement Platform
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Authorized enforcement personnel and audit officers only. Access AI-assisted label analysis, historical
            inspection records, and statutory reports.
          </p>

          <div className="pt-6 space-y-4 text-xs">
            <div className="flex items-center text-slate-200 bg-white/5 p-4 rounded-xl border border-white/5">
              <Lock className="w-5 h-5 mr-3.5 text-secondary flex-shrink-0" />
              <span className="font-medium">End-to-end encrypted evidence storage & tamper-resistant audits</span>
            </div>
            <div className="flex items-center text-slate-200 bg-white/5 p-4 rounded-xl border border-white/5">
              <ShieldCheck className="w-5 h-5 mr-3.5 text-primary flex-shrink-0" />
              <span className="font-medium">Direct alignment with Legal Metrology (Packaged Commodities) Rules</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#0B1020]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="text-left">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="lg:hidden flex items-center font-heading font-bold text-2xl tracking-tight text-white mb-6 hover:opacity-90 transition-opacity cursor-pointer"
              title="LegalMetrix AI - Return to Hero"
            >
              <Scale className="w-7 h-7 text-primary mr-2" />
              LegalMetrix <span className="text-primary ml-0.5">AI</span>
            </Link>
            <h2 className="text-3xl font-heading font-bold text-white">Welcome back, Inspector</h2>
            <p className="mt-2 text-sm text-slate-400">Sign in to your official metrology account</p>
          </div>

          {/* Alert if redirected from a protected action */}
          {redirectParam && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/25 text-xs text-slate-300 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0" />
              <span>Please sign in to access your requested inspection workflow.</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className="block w-full pl-10 pr-4 py-2.5 bg-[#121A2E] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="inspector.delhi@gov.in"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="block w-full pl-10 pr-11 py-2.5 bg-[#121A2E] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-400 hover:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary h-4 w-4"
                />
                <span className="ml-2">Remember session</span>
              </label>

              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center shadow-lg shadow-primary/25 group"
              isLoading={isLoading}
              disabled={isLoading || isSuccess}
            >
              {isSuccess ? (
                <span className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                  Authenticated
                </span>
              ) : isLoading ? (
                'Signing In...'
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <div className="pt-2 text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <Link
                to={redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : '/signup'}
                className="text-primary hover:underline font-semibold ml-1"
              >
                Create an account
              </Link>
            </div>

            <p className="text-center text-[11px] text-slate-500 pt-4 border-t border-white/5">
              By signing in, you access an authorized statutory assessment environment subject to statutory audit logging.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
