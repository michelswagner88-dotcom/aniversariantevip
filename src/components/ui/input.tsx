import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-input bg-background/50 backdrop-blur-sm px-4 py-3 text-base leading-none ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-slate-400 placeholder:opacity-50 focus-visible:outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/25 focus-visible:ring-offset-0 hover:border-white/15 transition-all duration-180 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-input",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
