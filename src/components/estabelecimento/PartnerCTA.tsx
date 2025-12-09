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
            p-5 sm:p-6
            text-center
          "
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Store className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Quer sua página assim?</h3>
          <p className="text-white/70 text-sm mb-4 sm:mb-5 max-w-xs mx-auto">
            Cadastre seu estabelecimento e atraia aniversariantes todos os meses!
          </p>

          <button
            onClick={() => navigate("/seja-parceiro")}
            className="
              inline-flex items-center gap-2 
              px-5 sm:px-6 py-3 
              bg-white 
              text-[#240046] 
              font-semibold 
              text-sm sm:text-base
              rounded-xl
              transition-all duration-200
              active:scale-[0.98]
            "
          >
            Cadastrar meu negócio
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerCTA;
