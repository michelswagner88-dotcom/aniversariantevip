// BusinessHours.tsx - Horário de Funcionamento Premium

import { Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface BusinessHoursProps {
  hours: string;
}

const BusinessHours = ({ hours }: BusinessHoursProps) => {
  // Verificar se está aberto (simplificado - pode ser expandido)
  const isOpenNow = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    // Simplificado: considera aberto entre 8h e 22h
    return currentHour >= 8 && currentHour < 22;
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="mx-4 mt-6"
    >
      <div 
        className="
          relative
          bg-gradient-to-br from-white/[0.04] to-white/[0.01]
          backdrop-blur-sm
          rounded-2xl 
          p-5
          border border-white/[0.08]
          overflow-hidden
          transition-all duration-300
          hover:border-violet-500/20
          hover:shadow-lg hover:shadow-violet-500/5
          group
        "
      >
        {/* Shimmer sutil no hover */}
        <div 
          className="
            absolute inset-0 rounded-2xl
            opacity-0 group-hover:opacity-100
            transition-opacity duration-500
            pointer-events-none
          "
          style={{
            background: 'linear-gradient(135deg, transparent 40%, rgba(139, 92, 246, 0.1) 50%, transparent 60%)',
            backgroundSize: '200% 200%',
            animation: 'shimmer-slide 4s ease-in-out infinite'
          }}
        />
        
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div 
              className="
                w-10 h-10 
                bg-gradient-to-br from-violet-500/20 to-blue-500/20 
                rounded-xl 
                flex items-center justify-center
                border border-white/10
                transition-all duration-300
                group-hover:border-violet-500/30
                group-hover:shadow-lg group-hover:shadow-violet-500/10
              "
            >
              <Clock className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Horário de Funcionamento</h3>
              <p className="text-muted-foreground text-sm">{hours}</p>
            </div>
          </div>
          
          {/* Indicador "Aberto agora" */}
          {isOpenNow && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="
                flex items-center gap-1.5
                px-3 py-1.5
                bg-green-500/10
                border border-green-500/30
                rounded-full
              "
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
              <span className="text-xs font-medium text-green-400">Aberto</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BusinessHours;