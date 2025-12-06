import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export const BackButton = ({ to, label = "Voltar", className = "" }: BackButtonProps) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleBack = () => {
    // Adiciona classe de fade antes de navegar
    setIsNavigating(true);
    
    // Aguarda animação antes de navegar
    setTimeout(() => {
      if (to) {
        // Se tem destino específico, vai pra lá
        navigate(to);
      } else if (window.history.length > 1) {
        // Se tem histórico, volta
        navigate(-1);
      } else {
        // Fallback: vai pra home se não tem histórico
        navigate('/');
      }
    }, 150);
  };

  return (
    <Button
      onClick={handleBack}
      disabled={isNavigating}
      variant="ghost"
      size="default"
      className={`group flex items-center gap-2 min-h-[44px] min-w-[44px] text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 active:scale-95 [-webkit-tap-highlight-color:transparent] ${className}`}
    >
      <ArrowLeft 
        size={20} 
        className={`transition-all duration-200 ${
          isNavigating 
            ? 'opacity-0 -translate-x-2' 
            : 'group-hover:-translate-x-1'
        }`} 
      />
      <span className={`transition-opacity duration-150 ${isNavigating ? 'opacity-0' : 'opacity-100'}`}>
        {label}
      </span>
    </Button>
  );
};
