// BenefitCard.tsx - Card de Benefício World-Class com Efeito Holográfico

import { Gift, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TiltCard } from '@/components/ui/tilt-card';

interface BenefitCardProps {
  benefit: {
    description: string;
    validity?: string;
    rules?: string;
  };
  onShowRules: () => void;
}

// Formatar a validade de forma bonita
const formatValidity = (validity?: string): string => {
  if (!validity) return 'No dia do aniversário';
  
  const validityMap: Record<string, string> = {
    'dia_aniversario': 'No dia do aniversário',
    'dia_do_aniversario': 'No dia do aniversário',
    'semana_aniversario': 'Na semana do aniversário',
    'semana_do_aniversario': 'Na semana do aniversário',
    'mes_aniversario': 'No mês do aniversário',
    'mes_do_aniversario': 'No mês do aniversário',
    'mes_inteiro': 'O mês inteiro',
    '7_dias': '7 dias antes e depois',
    '15_dias': '15 dias antes e depois',
    '30_dias': '30 dias',
  };
  
  const key = validity.toLowerCase().trim();
  return validityMap[key] || validity;
};

// Limpar descrição removendo regras que não deveriam estar lá
const cleanDescription = (description: string): string => {
  if (!description) return '';
  
  return description
    .replace(/A partir de \d+ pessoas\.?/gi, '')
    .replace(/Mínimo de? \d+ pessoas\.?/gi, '')
    .replace(/Válido no DIA do aniversário\.?/gi, '')
    .replace(/Válido no dia do aniversário\.?/gi, '')
    .replace(/Válido na semana do aniversário\.?/gi, '')
    .replace(/Válido no mês do aniversário\.?/gi, '')
    .replace(/Necessário reserva.*?\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const BenefitCard = ({ benefit, onShowRules }: BenefitCardProps) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const cleanedDescription = cleanDescription(benefit.description);
  const formattedValidity = formatValidity(benefit.validity);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mx-4 mt-6"
    >
      <TiltCard
        tiltAmount={8}
        shadowAmount={30}
        enableHolographic={true}
        className="group"
      >
        {/* Container com glow animado */}
        <div className="relative">
          {/* Glow effect por trás - animado */}
          <div 
            className="
              absolute -inset-2 
              bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 
              rounded-[32px] 
              blur-2xl 
              opacity-50
              animate-glow-pulse
              group-hover:opacity-70
              transition-opacity duration-500
            "
          />
          
          {/* Card principal */}
          <div 
            className="
              relative
              bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0f0a1a]
              rounded-[24px]
              p-6
              border border-violet-500/30
              shadow-2xl
              overflow-hidden
            "
          >
            {/* Borda holográfica animada */}
            <div 
              className="
                absolute inset-0 rounded-[24px]
                opacity-50 group-hover:opacity-80
                transition-opacity duration-500
                pointer-events-none
              "
              style={{
                background: 'linear-gradient(135deg, transparent 40%, rgba(139, 92, 246, 0.3) 50%, transparent 60%)',
                backgroundSize: '200% 200%',
                animation: 'shimmer-slide 3s ease-in-out infinite'
              }}
            />
            
            {/* Elementos decorativos de fundo */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            {/* Pattern sutil */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}
            />
            
            {/* Rainbow shimmer overlay */}
            <div 
              className="
                absolute inset-0 
                opacity-0 group-hover:opacity-30
                transition-opacity duration-700
                pointer-events-none
              "
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(217, 70, 239, 0.2) 25%, rgba(236, 72, 153, 0.2) 50%, rgba(139, 92, 246, 0.2) 75%, rgba(217, 70, 239, 0.2) 100%)',
                backgroundSize: '400% 400%',
                animation: 'gradientFlow 6s ease infinite'
              }}
            />
            
            {/* Conteúdo */}
            <div className="relative z-10">
              {/* Ícone do presente flutuante */}
              <div className="flex justify-center mb-5">
                <motion.div 
                  className="relative"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Glow atrás do ícone */}
                  <div className="absolute inset-0 bg-violet-500/40 rounded-2xl blur-xl animate-glow-pulse" />
                  
                  {/* Ring pulsante */}
                  <div 
                    className="
                      absolute -inset-2
                      rounded-2xl
                      border-2 border-violet-400/30
                      animate-ring-pulse
                    "
                  />
                  
                  <div 
                    className="
                      relative
                      w-16 h-16 
                      bg-gradient-to-br from-violet-500/30 via-fuchsia-500/30 to-pink-500/30
                      rounded-2xl 
                      flex items-center justify-center
                      border border-violet-400/40
                      shadow-inner
                    "
                  >
                    <Gift className="w-8 h-8 text-violet-300" />
                  </div>
                </motion.div>
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
                {cleanedDescription || benefit.description}
              </h2>
              
              {/* Validade formatada */}
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
                  <Calendar className="w-4 h-4 text-fuchsia-400" />
                  <span className="text-sm text-gray-300">
                    Válido: 
                    <span className="text-fuchsia-300 font-semibold ml-1">
                      {formattedValidity}
                    </span>
                  </span>
                </div>
              </div>
              
              {/* Botão CTA Premium com shimmer infinito */}
              <motion.button 
                onClick={onShowRules}
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                onMouseLeave={() => setIsPressed(false)}
                onTouchStart={() => setIsPressed(true)}
                onTouchEnd={() => setIsPressed(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full
                  relative
                  bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500
                  bg-[length:200%_auto]
                  text-white
                  font-semibold
                  py-4
                  px-6
                  rounded-2xl
                  overflow-hidden
                  transition-all duration-300
                  group/btn
                `}
                style={{
                  animation: 'gradientFlow 4s ease infinite',
                  boxShadow: '0 10px 40px -10px rgba(139, 92, 246, 0.6)'
                }}
              >
                {/* Shimmer infinito no botão */}
                <div 
                  className="
                    absolute inset-0 
                    bg-gradient-to-r from-transparent via-white/30 to-transparent
                  "
                  style={{
                    animation: 'shimmer-slide 2s ease-in-out infinite'
                  }}
                />
                
                <span className="relative flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Ver regras e como usar
                  <ChevronRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
};

export default BenefitCard;