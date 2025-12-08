// AboutSection.tsx - Seção Sobre Premium

import { Building2 } from 'lucide-react';

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
    <div 
      className="
        mx-4 mt-6
        animate-fade-in-up stagger-3
      "
    >
      <div 
        className="
          relative
          bg-gradient-to-br from-white/[0.03] to-white/[0.01]
          backdrop-blur-sm
          rounded-2xl 
          p-5
          border border-white/[0.06]
          overflow-hidden
          hover-lift
        "
      >
        {/* Decoração sutil */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl" />
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="
              w-10 h-10 
              bg-gradient-to-br from-blue-500/20 to-purple-500/20 
              rounded-xl 
              flex items-center justify-center
              border border-white/10
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
          "
        >
          {bio}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {displayTags.map((tag, index) => (
            <span 
              key={index}
              className="
                px-3 py-1.5 
                bg-white/[0.03]
                hover:bg-white/[0.06]
                rounded-full 
                text-xs 
                text-muted-foreground
                border border-white/[0.06]
                transition-colors duration-200
              "
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
