// src/components/estabelecimento/PartnerCTA.tsx
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const PartnerCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="px-4 mt-8 mb-24 md:mb-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="text-center sm:text-left">
            <p className="font-semibold text-gray-900">Quer sua página assim?</p>
            <p className="text-sm text-gray-500 mt-0.5">Cadastre seu estabelecimento</p>
          </div>
          <button
            onClick={() => navigate("/seja-parceiro")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-[#240046] bg-white border border-gray-200 hover:border-[#240046]/30 active:scale-[0.98] transition-all"
          >
            Cadastrar meu negócio
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PartnerCTA;
