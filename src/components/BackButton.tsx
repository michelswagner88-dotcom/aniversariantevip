import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  variant?: "dark" | "light";
}

export const BackButton = ({ to, label = "Voltar", className = "", variant = "dark" }: BackButtonProps) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleBack = () => {
    setIsNavigating(true);

    setTimeout(() => {
      if (to) {
        navigate(to);
      } else if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate("/");
      }
    }, 150);
  };

  // Classes baseadas no variant
  const variantClasses =
    variant === "dark"
      ? "text-slate-300 hover:text-white hover:bg-white/10"
      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100";

  return (
    <Button
      onClick={handleBack}
      disabled={isNavigating}
      variant="ghost"
      size="default"
      className={`group flex items-center gap-2 min-h-[44px] min-w-[44px] transition-all duration-200 active:scale-95 [-webkit-tap-highlight-color:transparent] ${variantClasses} ${className}`}
    >
      <ArrowLeft
        size={20}
        className={`transition-all duration-200 ${
          isNavigating ? "opacity-0 -translate-x-2" : "group-hover:-translate-x-1"
        }`}
      />
      <span className={`transition-opacity duration-150 ${isNavigating ? "opacity-0" : "opacity-100"}`}>{label}</span>
    </Button>
  );
};
