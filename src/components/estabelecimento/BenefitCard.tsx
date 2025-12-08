// BenefitCard.tsx - Card de Benefício World-Class

import { Gift, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface BenefitCardProps {
  benefit: {
    description: string;
    validity?: string;
    rules?: string;
  };
  onShowRules: () => void;
}

const BenefitCard = ({ benefit, onShowRules }: BenefitCardProps) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div 
      className="
        mx-4 mt-6
        animate-fade-in-up stagger-2
      "
    >
      {/* Container com glow animado */}
      <div className="relative">
        {/* Glow effect por trás - animado */}
        <div 
          className="
            absolute -inset-1 
            bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 
            rounded-[28px] 
            blur-xl 
            opacity-40
            animate-glow-pulse
          "
        />
        
        {/* Card principal */}
        <div 
          className="
            relative
            bg-gradient-to-br from-[#1a1025] via-[#1f1030] to-[#1a1025]
            rounded-[24px]
            p-6
            border border-purple-500/20
            shadow-2xl
            overflow-hidden
          "
        >
          {/* Elementos decorativos de fundo */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          {/* Pattern sutil */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
          
          {/* Shimmer effect que passa pelo card */}
          <div className="absolute inset-0 animate-shimmer opacity-30 pointer-events-none" />
          
          {/* Conteúdo */}
          <div className="relative z-10">
            {/* Ícone do presente */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                {/* Glow atrás do ícone */}
                <div className="absolute inset-0 bg-purple-500/30 rounded-2xl blur-xl animate-glow-pulse" />
                
                <div 
                  className="
                    relative
                    w-16 h-16 
                    bg-gradient-to-br from-purple-500/30 to-pink-500/30 
                    rounded-2xl 
                    flex items-center justify-center
                    border border-purple-400/30
                    shadow-inner
                    animate-float
                  "
                >
                  <Gift className="w-8 h-8 text-purple-300" />
                </div>
              </div>
            </div>
            
            {/* Título do benefício */}
            <h2 
              className="
                text-xl sm:text-2xl 
                font-bold 
                text-center 
                text-white 
                leading-tight
                mb-5
              "
            >
              {benefit.description}
            </h2>
            
            {/* Validade */}
            <div className="flex justify-center mb-6">
              <div 
                className="
                  inline-flex items-center gap-2
                  bg-white/5
                  backdrop-blur-sm
                  px-5 py-2.5
                  rounded-full
                  border border-white/10
                "
              >
                <Calendar className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-gray-300">
                  Válido: 
                  <span className="text-pink-300 font-semibold ml-1">
                    {benefit.validity || 'Dia do aniversário'}
                  </span>
                </span>
              </div>
            </div>
            
            {/* Botão CTA Premium */}
            <button 
              onClick={onShowRules}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              onMouseLeave={() => setIsPressed(false)}
              onTouchStart={() => setIsPressed(true)}
              onTouchEnd={() => setIsPressed(false)}
              className={`
                w-full
                relative
                bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500
                bg-[length:200%_auto]
                text-white
                font-semibold
                py-4
                px-6
                rounded-2xl
                overflow-hidden
                transition-all duration-300
                ${isPressed ? 'scale-[0.98]' : 'hover:scale-[1.02]'}
                group
              `}
              style={{
                animation: 'gradientFlow 4s ease infinite',
                boxShadow: '0 10px 40px -10px rgba(236, 72, 153, 0.5)'
              }}
            >
              {/* Shimmer no botão */}
              <div 
                className="
                  absolute inset-0 
                  bg-gradient-to-r from-transparent via-white/20 to-transparent
                  translate-x-[-100%]
                  group-hover:translate-x-[100%]
                  transition-transform duration-700
                "
              />
              
              <span className="relative flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Ver regras e como usar
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitCard;
