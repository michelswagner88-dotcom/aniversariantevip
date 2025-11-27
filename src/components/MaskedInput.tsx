import React, { ChangeEvent, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  mask: (value: string) => string;
  error?: string;
  isValid?: boolean;
  label?: string;
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ value, onChange, mask, error, isValid, label, className, ...props }, ref) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const maskedValue = mask(e.target.value);
      onChange(maskedValue);
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-slate-200">
            {label}
          </label>
        )}
        <div className="relative">
          <Input
            ref={ref}
            value={value}
            onChange={handleChange}
            className={cn(
              "bg-white/5 border-white/10 text-white placeholder:text-slate-400",
              "focus:border-violet-500/50 focus:ring-violet-500/20",
              error && "border-red-500/50 focus:border-red-500/50",
              isValid && "border-green-500/50 pr-10",
              className
            )}
            {...props}
          />
          {isValid && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';

export default MaskedInput;
