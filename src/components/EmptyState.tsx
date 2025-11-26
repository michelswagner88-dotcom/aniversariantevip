import { Store, MapPin, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      {/* Ícone Grande */}
      <div className="relative mb-8">
        {/* Glow Effect */}
        <div className="absolute inset-0 blur-3xl opacity-20">
          <div className="w-32 h-32 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full" />
        </div>
        
        {/* Container do Ícone */}
        <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
          <Store className="w-16 h-16 text-violet-400" strokeWidth={1.5} />
        </div>
      </div>

      {/* Título */}
      <h2 className="text-3xl font-bold text-white mb-3 font-plus-jakarta">
        Estamos chegando na sua região! 🚀
      </h2>

      {/* Subtítulo */}
      <p className="text-slate-400 text-lg mb-2 max-w-md leading-relaxed">
        O guia oficial de benefícios está sendo atualizado com os melhores lugares.
      </p>
      <p className="text-slate-500 text-base mb-8 max-w-md">
        Volte em breve!
      </p>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full max-w-xs mb-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <MapPin className="w-4 h-4 text-violet-400" />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* CTA Button */}
      <Button
        onClick={() => navigate("/seja-parceiro")}
        className="group bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-500/20 px-8 py-6 text-base font-semibold"
      >
        <span>Quero indicar um lugar</span>
        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
      </Button>

      {/* Informação Extra */}
      <p className="text-xs text-slate-600 mt-6 max-w-sm">
        Seja um dos primeiros parceiros na sua cidade e ganhe destaque especial no lançamento
      </p>
    </div>
  );
};
