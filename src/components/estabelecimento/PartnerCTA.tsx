// PartnerCTA.tsx - Call to Action Premium

import { Store, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PartnerCTA = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="
        mx-4 mt-8 mb-8
        animate-fade-in-up stagger-7
      "
    >
      <div 
        className="
          relative
          overflow-hidden
          rounded-3xl
          p-6
          sm:p-8
        "
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #f97316 100%)'
        }}
      >
        {/* Elementos decorativos animados */}
        <div 
          className="
            absolute top-0 right-0 w-40 h-40 
            bg-white/20 
            rounded-full 
            -translate-y-1/2 translate-x-1/2 
            blur-3xl
            animate-glow-pulse
          " 
        />
        <div 
          className="
            absolute bottom-0 left-0 w-32 h-32 
            bg-white/20 
            rounded-full 
            translate-y-1/2 -translate-x-1/2 
            blur-3xl
            animate-glow-pulse
          "
          style={{ animationDelay: '1s' }}
        />
        
        {/* Partículas decorativas */}
        <div className="absolute top-4 left-8 w-2 h-2 bg-white/30 rounded-full animate-float" />
        <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-white/40 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-8 left-16 w-1 h-1 bg-white/50 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        
        {/* Conteúdo */}
        <div className="relative z-10 text-center">
          {/* Ícone */}
          <div 
            className="
              w-16 h-16 
              bg-white/20 
              backdrop-blur-sm
              rounded-2xl 
              flex items-center justify-center
              mx-auto
              mb-5
              border border-white/30
              shadow-lg
              animate-float
            "
          >
            <Store className="w-8 h-8 text-white" />
          </div>
          
          {/* Título */}
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Quer sua página assim?
          </h3>
          
          {/* Subtítulo */}
          <p className="text-white/90 text-base sm:text-lg mb-6 max-w-sm mx-auto">
            Cadastre seu estabelecimento e atraia aniversariantes todos os meses!
          </p>
          
          {/* Benefícios rápidos */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {['Gratuito', 'Sem mensalidade', '+1000 aniversariantes'].map((item) => (
              <span 
                key={item}
                className="
                  px-3 py-1 
                  bg-white/20 
                  backdrop-blur-sm
                  rounded-full 
                  text-sm 
                  text-white/90
                  border border-white/20
                "
              >
                {item}
              </span>
            ))}
          </div>
          
          {/* Botão CTA */}
          <button 
            onClick={() => navigate('/cadastro/estabelecimento')}
            className="
              inline-flex items-center justify-center gap-2
              bg-white
              text-purple-600
              font-bold
              py-4
              px-8
              rounded-xl
              shadow-lg
              shadow-black/20
              transition-all duration-300 ease-out
              hover:shadow-xl
              hover:scale-105
              active:scale-95
              group
            "
          >
            <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
            Cadastrar meu negócio
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerCTA;
