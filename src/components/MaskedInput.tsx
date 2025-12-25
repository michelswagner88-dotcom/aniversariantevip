import React, { ChangeEvent, forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, AlertCircle, Loader2 } from "lucide-react";

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  mask: (value: string) => string;
  error?: string;
  isValid?: boolean;
  label?: string;
  required?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  /** Tema visual: 'dark' (padrão) ou 'light' */
  theme?: "dark" | "light";
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    { value, onChange, mask, error, isValid, label, required, loading, icon, className, theme = "dark", ...props },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const maskedValue = mask(e.target.value);
      onChange(maskedValue);
    };

    // Estilos baseados no tema
    const isDark = theme === "dark";

    const labelStyles = isDark
      ? "text-sm font-semibold text-slate-200 flex items-center gap-1"
      : "text-sm font-medium text-zinc-700 flex items-center gap-1.5";

    const requiredStyles = isDark ? "text-pink-400" : "text-violet-600";

    const iconStyles = isDark ? "text-slate-400" : "text-zinc-400";

    const inputBaseStyles = isDark
      ? "h-[52px] text-base bg-white/5 border-white/10 text-white placeholder:text-slate-500"
      : "h-12 text-base bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 hover:border-zinc-300";

    const focusStyles = isDark
      ? "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
      : "focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";

    const errorStyles = isDark
      ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
      : "border-red-400 focus:border-red-500 focus:ring-red-500/20";

    const validStyles = isDark ? "border-green-500/50" : "border-emerald-400";

    const focusedStyles = isDark
      ? "border-violet-500/50 ring-2 ring-violet-500/20"
      : "border-violet-500 ring-2 ring-violet-500/20";

    const errorTextStyles = isDark
      ? "text-sm text-red-400 flex items-center gap-1.5"
      : "text-sm text-red-600 flex items-center gap-1.5";

    const iconColorStyles = {
      loading: isDark ? "text-violet-400" : "text-violet-500",
      valid: isDark ? "text-green-400" : "text-emerald-500",
      error: isDark ? "text-red-400" : "text-red-500",
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className={labelStyles}>
            {label}
            {required && <span className={requiredStyles}>*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10", iconStyles)}>
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
              inputBaseStyles,
              focusStyles,
              "transition-all duration-200 rounded-xl",
              icon && "pl-11",
              error && errorStyles,
              isValid && !error && validStyles,
              isValid && !error && "pr-12",
              loading && "pr-12",
              isFocused && !error && !isValid && focusedStyles,
              className,
            )}
            {...props}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className={cn("h-5 w-5 animate-spin", iconColorStyles.loading)} />
            </div>
          )}
          {isValid && !loading && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check className={cn("h-5 w-5", iconColorStyles.valid)} />
            </div>
          )}
          {error && !loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className={cn("h-5 w-5", iconColorStyles.error)} />
            </div>
          )}
        </div>
        {error && (
          <p className={errorTextStyles}>
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  },
);

MaskedInput.displayName = "MaskedInput";

export default MaskedInput;
