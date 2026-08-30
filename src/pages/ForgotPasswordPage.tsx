import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ScanLine, Mail, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid official email address.');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(cleanEmail);
      setIsSubmitted(true);
      showToast('If an account exists for this email, a password reset link has been sent.', 'success');
    } catch {
      // Always show generic message to avoid email enumeration
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-[#121A2E] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center font-heading font-bold text-2xl tracking-tight text-white mb-2 hover:opacity-90 transition-opacity cursor-pointer"
            title="LegalMetrix AI - Return to Hero"
          >
            <ScanLine className="w-8 h-8 text-primary mr-2" />
            LegalMetrix <span className="text-primary ml-0.5">AI</span>
          </Link>
          <h2 className="text-2xl font-heading font-bold text-white">Reset Password</h2>
          <p className="text-xs text-slate-400">
            Enter your official email address and we will send password reset instructions.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {isSubmitted ? (
          <div className="space-y-5 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Instructions Dispatched</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                If an account exists for this email, a password reset link has been sent.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="primary" className="w-full justify-center">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="inspector@lmd.gov.in"
                  className="block w-full pl-10 pr-4 py-2.5 bg-[#090D1A] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center shadow-lg shadow-primary/25 group"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>

            <div className="pt-2 text-center">
              <Link to="/login" className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
