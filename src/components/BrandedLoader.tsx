import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ScanLine, ShieldCheck } from 'lucide-react';
import { ShinyText } from './ui/ShinyText';
import { BlurText } from './ui/BlurText';

interface BrandedLoaderProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export const BrandedLoader: React.FC<BrandedLoaderProps> = ({
  message = 'LegalMetrix',
  subMessage = 'Initializing compliance intelligence...',
  fullScreen = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const content = (
    <div 
      className="flex flex-col items-center justify-center text-center select-none px-6"
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      {/* Sleek Orbital Core */}
      <div className="relative w-32 h-32 flex items-center justify-center mb-10">
        {/* Deep ambient glow */}
        <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl animate-pulse" />
        <div className="absolute inset-4 rounded-full bg-secondary/20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Premium Smooth Rings */}
        {!shouldReduceMotion && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary/80 shadow-[0_0_20px_rgba(99,102,241,0.6)]"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
              className="absolute inset-2 rounded-full border-b-2 border-l-2 border-purple-400/80 shadow-[0_0_20px_rgba(192,132,252,0.6)]"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 7, ease: 'linear' }}
              className="absolute -inset-2 rounded-full border-t border-l border-secondary/40 opacity-50"
            />
          </>
        )}

        {/* Center Jewel */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 flex items-center justify-center shadow-inner overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
          <ScanLine className="w-7 h-7 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </div>
      </div>

      {/* Branded Text & Status */}
      <div className="space-y-4 max-w-md flex flex-col items-center">
        <div className="flex items-center justify-center space-x-2">
          <span className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-white drop-shadow-lg">
            {message}
          </span>
          <ShinyText text="AI" speed={3} className="font-heading font-black text-2xl sm:text-3xl text-primary" />
        </div>

        <div className="flex items-center justify-center h-6">
          <span className="inline-block w-2 h-2 rounded-full bg-primary mr-3 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
          <BlurText 
            text={subMessage} 
            delay={30} 
            animateBy="words" 
            direction="bottom" 
            className="text-sm font-medium text-slate-300 tracking-wide" 
          />
        </div>

        <div className="pt-4 flex items-center justify-center space-x-2 text-[10px] text-white/30 font-mono uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secure Platform Boot</span>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070B14] flex items-center justify-center">
        {/* Subtle background mesh gradient for full screen */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
        </div>
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-20 flex items-center justify-center relative">
      {content}
    </div>
  );
};
