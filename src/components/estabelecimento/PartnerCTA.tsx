// PartnerCTA.tsx - CTA para Parceiros Clean

import { useNavigate } from "react-router-dom";
import { Store, ArrowRight } from "lucide-react";

const PartnerCTA = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 mb-6 sm:mb-8">
      <div className="max-w-3xl mx-auto">
        <div
          className="
            bg-gradient-to-r from-[#240046] to-[#3C096C]
            rounded-2xl
            p-4 sm:p-6
            text-center
          "
        >
          {/* Ícone menor no mobile */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
            <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">Quer sua página assim?</h3>
          <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4 max-w-[250px] mx-auto leading-relaxed">
            Cadastre seu estabelecimento e atraia aniversariantes todos os meses!
          </p>

          {/* Botão mais compacto */}
          <button
            onClick={() => navigate("/seja-parceiro")}
            className="
              inline-flex items-center gap-1.5 
              px-4 sm:px-5 py-2.5 sm:py-3 
              bg-white 
              text-[#240046] 
              font-semibold 
              text-xs sm:text-sm
              rounded-lg sm:rounded-xl
              transition-all duration-200
              active:scale-[0.98]
            "
          >
            Cadastrar meu negócio
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerCTA;
