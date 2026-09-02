import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, disabled, ...props }, ref) => {
    const defaultId = React.useId();
    const checkboxId = id || defaultId;

    return (
      <label htmlFor={checkboxId} className={cn("inline-flex items-center cursor-pointer group", disabled && "cursor-not-allowed opacity-50")}>
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            className="peer sr-only"
            id={checkboxId}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          <div
            className={cn(
              "w-[18px] h-[18px] rounded-[4px] border-2 border-white/20 bg-obsidian/40 flex items-center justify-center transition-all duration-200",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#0B1020]",
              !disabled && "group-hover:border-primary/60",
              "peer-checked:bg-primary peer-checked:border-primary peer-checked:shadow-[0_0_12px_rgba(99,102,241,0.5)]",
              "peer-checked:[&>svg]:scale-100 [&>svg]:scale-0",
              className
            )}
          >
            <Check 
              className="w-3 h-3 text-white transition-transform duration-200"
              strokeWidth={4}
            />
          </div>
        </div>
        {label && (
          <span className="ml-3 text-sm text-content-muted select-none transition-colors group-hover:text-content">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
