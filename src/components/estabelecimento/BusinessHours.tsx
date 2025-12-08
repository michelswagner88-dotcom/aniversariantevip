// BusinessHours.tsx - Horário de Funcionamento Premium

import { Clock } from 'lucide-react';

interface BusinessHoursProps {
  hours: string;
}

const BusinessHours = ({ hours }: BusinessHoursProps) => {
  return (
    <div 
      className="
        mx-4 mt-6
        animate-fade-in-up stagger-5
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
        <div className="flex items-center gap-3">
          <div 
            className="
              w-10 h-10 
              bg-gradient-to-br from-purple-500/20 to-blue-500/20 
              rounded-xl 
              flex items-center justify-center
              border border-white/10
            "
          >
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Horário de Funcionamento</h3>
            <p className="text-muted-foreground text-sm">{hours}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessHours;
