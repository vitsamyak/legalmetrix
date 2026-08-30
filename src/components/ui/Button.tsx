import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#030712] disabled:opacity-50 disabled:pointer-events-none rounded-xl relative overflow-hidden';
    
    const variants = {
      primary: 'bg-gradient-to-b from-[#6366F1] to-[#4F46E5] text-white shadow-[0_2px_10px_-3px_rgba(99,102,241,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] border border-[#4F46E5] hover:shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-110',
      secondary: 'bg-[#1E293B]/60 backdrop-blur-sm text-white border border-white/10 hover:bg-[#1E293B] hover:border-white/20 shadow-lg shadow-black/20',
      ghost: 'bg-transparent text-content-muted hover:text-white hover:bg-white/5 focus:ring-primary',
      danger: 'bg-gradient-to-b from-red-500/10 to-red-600/10 text-red-500 hover:from-red-500 hover:to-red-600 hover:text-white focus:ring-red-500 border border-red-500/20 hover:border-red-500 hover:shadow-[0_4px_15px_-3px_rgba(239,68,68,0.4)]',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-5 py-2 text-sm',
      lg: 'h-12 px-8 text-base font-semibold',
      icon: 'h-10 w-10',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98, y: 0 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin relative z-10" />}
        {!isLoading && leftIcon && <span className="mr-2 relative z-10 flex items-center"><>{leftIcon}</></span>}
        <span className="relative z-10 flex items-center justify-center whitespace-nowrap">{children as React.ReactNode}</span>
        {!isLoading && rightIcon && <span className="ml-2 relative z-10 flex items-center"><>{rightIcon}</></span>}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
