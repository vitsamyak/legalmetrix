import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scale, 
  ScanLine,
  Lock,
  Mail,
  User,
  Building,
  BadgeCheck,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
 } from "lucide-react";
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const targetDestination =
    redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : '/dashboard';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    designation: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: '', color: 'bg-white/10' };

    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-cyan-400' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
      default:
        return { score: 0, label: '', color: 'bg-white/10' };
    }
  }, [formData.password]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(targetDestination, { replace: true });
    }
  }, [isAuthenticated, navigate, targetDestination]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError(null);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanName = formData.name.trim();
    if (!cleanName) {
      setError('Full name is required.');
      return;
    }
    const cleanEmail = formData.email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid official email address.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Confirm password does not match.');
      return;
    }
    if (!formData.agreeTerms) {
      setError('You must agree to the Terms and Privacy Policy to register.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signup({
        name: cleanName,
        email: cleanEmail,
        password: formData.password,
        organization: formData.organization || 'Legal Metrology Department',
        designation: formData.designation || 'Enforcement Inspector',
        region: 'Delhi NCR',
      });

      if (res.success) {
        if (res.needsEmailVerification) {
          setNeedsVerification(true);
          showToast('Account created. Please check your email to verify your account.', 'info');
        } else {
          setIsSuccess(true);
          showToast('Account registered successfully! Redirecting...', 'success');

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
        }
      } else {
        setError(res.error || 'Failed to create account. Please try again.');
        showToast(res.error || 'Registration failed.', 'error');
      }
    } catch {
      setError('Unable to create account. Please verify details and try again.');
      showToast('Registration failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex">
      {/* Left side - Branding banner */}
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
            Register for Statutory <br /> Inspection Access
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Create an inspector or audit administrator profile to access proprietary OCR tools, automated Legal Metrology
            rule cross-checks, and exportable inspection dossiers.
          </p>

          <div className="pt-6 space-y-4 text-xs">
            <div className="flex items-center text-slate-200 bg-white/5 p-4 rounded-xl border border-white/5">
              <BadgeCheck className="w-5 h-5 mr-3.5 text-secondary flex-shrink-0" />
              <span className="font-medium">Direct LMPC 2011 rule-base cross-referencing</span>
            </div>
            <div className="flex items-center text-slate-200 bg-white/5 p-4 rounded-xl border border-white/5">
              <Lock className="w-5 h-5 mr-3.5 text-primary flex-shrink-0" />
              <span className="font-medium">Secure evidence storage & inspector sign-off tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#0B1020] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full space-y-6 py-6"
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
            <h2 className="text-3xl font-heading font-bold text-white">Create Official Account</h2>
            <p className="mt-1 text-sm text-slate-400">Join the LegalMetrix enforcement network</p>
          </div>

          {needsVerification ? (
            <div className="p-6 rounded-2xl bg-[#121A2E] border border-white/10 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-heading font-bold text-white">Verification Email Sent</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Account created. Please check your email to verify your account before accessing protected inspection tools.
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="primary" className="w-full justify-center">
                    Proceed to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSignUp}>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Inspector Vikram Singh"
                      className="block w-full pl-10 pr-4 py-2 bg-[#121A2E] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Official Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="officer@lmd.gov.in"
                      className="block w-full pl-10 pr-4 py-2 bg-[#121A2E] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Organization (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        name="organization"
                        type="text"
                        value={formData.organization}
                        onChange={handleChange}
                        placeholder="Dept of Legal Metrology"
                        className="block w-full pl-10 pr-3 py-2 bg-[#121A2E] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Designation (Optional)
                    </label>
                    <input
                      name="designation"
                      type="text"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="Assistant Controller"
                      className="block w-full px-3.5 py-2 bg-[#121A2E] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="block w-full pl-10 pr-10 py-2 bg-[#121A2E] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="block w-full pl-10 pr-10 py-2 bg-[#121A2E] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Password Strength:</span>
                      <span className={`font-semibold ${
                        passwordStrength.score >= 3 ? 'text-emerald-400' : passwordStrength.score === 2 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`rounded-full transition-all duration-300 ${
                            level <= passwordStrength.score ? passwordStrength.color : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Terms and Privacy Policy Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start text-xs text-slate-300 cursor-pointer">
                    <input
                      name="agreeTerms"
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="mt-0.5 rounded border-white/20 bg-white/5 text-primary focus:ring-primary h-4 w-4 flex-shrink-0"
                    />
                    <span className="ml-2.5 leading-relaxed">
                      I agree to the <span className="text-primary hover:underline">Terms of Service</span> and{' '}
                      <span className="text-primary hover:underline">Privacy Policy</span> regarding statutory compliance
                      data.
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center shadow-lg shadow-primary/25 group mt-4"
                  isLoading={isLoading}
                  disabled={isLoading || isSuccess}
                >
                  {isSuccess ? (
                    <span className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                      Account Created
                    </span>
                  ) : isLoading ? (
                    'Creating Account...'
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <div className="pt-3 text-center text-xs text-slate-400">
                  Already have an account?{' '}
                  <Link
                    to={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'}
                    className="text-primary hover:underline font-semibold ml-1"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
