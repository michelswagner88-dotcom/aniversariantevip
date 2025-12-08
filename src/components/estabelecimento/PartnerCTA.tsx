// PartnerCTA.tsx - Call to Action Premium

import { Store, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PartnerCTA = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-4 mt-6 mb-6">
      <div 
        className="relative overflow-hidden rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #f97316 100%)'
        }}
      >
        {/* Elementos decorativos menores */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        
        {/* Conteúdo compacto */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Ícone menor */}
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
            <Store className="w-6 h-6 text-white" />
          </div>
          
          {/* Texto */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Quer sua página assim?
            </h3>
            <p className="text-white/80 text-sm truncate">
              Cadastre e atraia aniversariantes!
            </p>
          </div>
          
          {/* Botão compacto */}
          <button 
            onClick={() => navigate('/cadastro/estabelecimento')}
            className="
              flex items-center gap-1.5
              bg-white
              text-purple-600
              font-semibold
              py-2.5
              px-4
              rounded-lg
              shadow-md
              transition-all duration-300
              hover:shadow-lg
              hover:scale-105
              active:scale-95
              flex-shrink-0
              text-sm
            "
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Cadastrar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerCTA;
