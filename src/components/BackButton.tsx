import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export const BackButton = ({ to, label = "Voltar", className = "" }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
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
  };

  return (
    <Button
      onClick={handleBack}
      variant="ghost"
      size="sm"
      className={`group flex items-center gap-2 text-slate-300 hover:text-white hover:bg-white/10 transition-all ${className}`}
    >
      <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
      {label}
    </Button>
  );
};
