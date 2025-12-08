// AboutSection.tsx - Seção Sobre Premium

import { Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AboutSectionProps {
  bio: string;
  tags?: string[];
}

const AboutSection = ({ bio, tags = [] }: AboutSectionProps) => {
  // Tags padrão se não vier nenhuma
  const displayTags = tags.length > 0 ? tags : [
    '✨ Atendimento VIP',
    '🎂 Especialista em aniversários'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
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
        {/* Borda gradiente animada sutil */}
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
        
        {/* Decoração sutil */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 relative">
          <div 
            className="
              w-10 h-10 
              bg-gradient-to-br from-blue-500/20 to-violet-500/20 
              rounded-xl 
              flex items-center justify-center
              border border-white/10
              transition-all duration-300
              group-hover:border-violet-500/30
              group-hover:shadow-lg group-hover:shadow-violet-500/10
            "
          >
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Sobre</h3>
        </div>
        
        {/* Bio */}
        <p 
          className="
            text-muted-foreground 
            leading-relaxed 
            text-[15px]
            relative
          "
        >
          {bio}
        </p>
        
        {/* Tags com glow no hover */}
        <div className="flex flex-wrap gap-2 mt-4 relative">
          {displayTags.map((tag, index) => (
            <motion.span 
              key={index}
              whileHover={{ scale: 1.05 }}
              className="
                px-3 py-1.5 
                bg-white/[0.04]
                hover:bg-violet-500/10
                rounded-full 
                text-xs 
                text-muted-foreground
                hover:text-violet-300
                border border-white/[0.06]
                hover:border-violet-500/30
                transition-all duration-300
                cursor-default
                hover:shadow-lg hover:shadow-violet-500/10
              "
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AboutSection;