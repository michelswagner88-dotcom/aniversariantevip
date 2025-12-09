// BenefitCard.tsx - Card de Benefício Clean e Profissional

import { Gift, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const cleanedDescription = cleanDescription(benefit.description);
  const formattedValidity = formatValidity(benefit.validity);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mx-4 mt-6"
    >
      {/* Container com glow sutil */}
      <div className="relative">
        {/* Glow effect por trás - sutil, não animado */}
        <div 
          className="
            absolute -inset-2 
            bg-[#240046]/30
            rounded-[32px] 
            blur-2xl 
            opacity-60
          "
        />
        
        {/* Card principal */}
        <div 
          className="
            relative
            bg-gradient-to-br from-[#1a1025] via-[#150d1f] to-[#0f0a1a]
            rounded-[24px]
            p-6
            border border-[#240046]/40
            shadow-2xl
            overflow-hidden
          "
        >
          {/* Elementos decorativos de fundo - tons roxos */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#240046]/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#3C096C]/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          {/* Pattern sutil */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
          
          {/* Conteúdo */}
          <div className="relative z-10">
            {/* Ícone do presente */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                {/* Glow atrás do ícone */}
                <div className="absolute inset-0 bg-[#240046]/40 rounded-2xl blur-xl" />
                
                <div 
                  className="
                    relative
                    w-16 h-16 
                    bg-[#240046]/30
                    rounded-2xl 
                    flex items-center justify-center
                    border border-[#240046]/50
                    shadow-inner
                  "
                >
                  <Gift className="w-8 h-8 text-[#A78BFA]" />
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
                <Calendar className="w-4 h-4 text-[#A78BFA]" />
                <span className="text-sm text-gray-300">
                  Válido: 
                  <span className="text-[#A78BFA] font-semibold ml-1">
                    {formattedValidity}
                  </span>
                </span>
              </div>
            </div>
            
            {/* Botão CTA Clean - SEM efeitos excessivos */}
            <button 
              onClick={onShowRules}
              className="
                w-full
                bg-gradient-to-r from-[#240046] to-[#3C096C]
                hover:from-[#3C096C] hover:to-[#5B21B6]
                text-white
                font-semibold
                py-4
                px-6
                rounded-2xl
                transition-all duration-300
                hover:scale-[1.02]
                active:scale-[0.98]
                shadow-lg shadow-[#240046]/40
                flex items-center justify-center gap-2
              "
            >
              <Sparkles className="w-5 h-5" />
              Ver regras e como usar
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BenefitCard;
