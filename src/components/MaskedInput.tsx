import React, { ChangeEvent, forwardRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  mask: (value: string) => string;
  error?: string;
  isValid?: boolean;
  label?: string;
  required?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ value, onChange, mask, error, isValid, label, required, loading, icon, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const maskedValue = mask(e.target.value);
      onChange(maskedValue);
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-1">
            {label}
            {required && <span className="text-pink-400">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
              {icon}
            </span>
          )}
          <Input
            ref={ref}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "h-[52px] text-base bg-white/5 border-white/10 text-white placeholder:text-slate-500",
              "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
              "transition-all duration-200",
              icon && "pl-10",
              error && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
              isValid && !error && "border-green-500/50 pr-12",
              loading && "pr-12",
              isFocused && !error && !isValid && "border-violet-500/50 ring-2 ring-violet-500/20",
              className
            )}
            {...props}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-5 w-5 text-violet-400 animate-spin" />
            </div>
          )}
          {isValid && !loading && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check className="h-5 w-5 text-green-400" />
            </div>
          )}
          {error && !loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';

export default MaskedInput;
