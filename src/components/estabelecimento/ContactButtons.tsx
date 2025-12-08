// ContactButtons.tsx - Botões de Contato Premium

import { MessageCircle, Instagram, Phone } from 'lucide-react';

interface ContactButtonsProps {
  whatsapp?: string;
  instagram?: string;
  phone?: string;
  onWhatsApp: () => void;
  onInstagram: () => void;
  onPhone: () => void;
}

const ContactButtons = ({ 
  whatsapp,
  instagram,
  phone,
  onWhatsApp, 
  onInstagram, 
  onPhone 
}: ContactButtonsProps) => {
  
  const buttons = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      onClick: onWhatsApp,
      available: !!whatsapp,
      gradient: 'from-green-500/20 to-green-600/10',
      hoverGradient: 'hover:from-green-500/30 hover:to-green-600/20',
      borderColor: 'border-green-500/30',
      iconBg: 'bg-green-500/20 group-hover:bg-green-500/30',
      iconColor: 'text-green-400',
      textColor: 'text-green-300',
      shadowColor: 'hover:shadow-green-500/20',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      onClick: onInstagram,
      available: !!instagram,
      gradient: 'from-pink-500/20 via-purple-500/10 to-orange-500/10',
      hoverGradient: 'hover:from-pink-500/30 hover:via-purple-500/20 hover:to-orange-500/20',
      borderColor: 'border-pink-500/30',
      iconBg: 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 group-hover:from-pink-500/30 group-hover:to-purple-500/30',
      iconColor: 'text-pink-400',
      textColor: 'text-pink-300',
      shadowColor: 'hover:shadow-pink-500/20',
    },
    {
      name: 'Ligar',
      icon: Phone,
      onClick: onPhone,
      available: !!phone,
      gradient: 'from-blue-500/20 to-blue-600/10',
      hoverGradient: 'hover:from-blue-500/30 hover:to-blue-600/20',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20 group-hover:bg-blue-500/30',
      iconColor: 'text-blue-400',
      textColor: 'text-blue-300',
      shadowColor: 'hover:shadow-blue-500/20',
    },
  ];

  return (
    <div 
      className="
        mx-4 mt-6
        animate-fade-in-up stagger-4
      "
    >
      <div className="grid grid-cols-3 gap-3">
        {buttons.map((button) => {
          const Icon = button.icon;
          
          return (
            <button
              key={button.name}
              onClick={button.onClick}
              disabled={!button.available}
              className={`
                group
                relative
                flex flex-col items-center justify-center
                bg-gradient-to-br ${button.gradient}
                ${button.hoverGradient}
                border ${button.borderColor}
                rounded-2xl
                p-4
                transition-all duration-300 ease-out
                hover:scale-105
                hover:shadow-lg ${button.shadowColor}
                active:scale-95
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                overflow-hidden
              `}
            >
              {/* Ripple container */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div 
                  className="
                    absolute inset-0 
                    bg-white/10 
                    scale-0 
                    group-active:scale-100 
                    transition-transform duration-300
                    rounded-full
                    origin-center
                  "
                />
              </div>
              
              {/* Ícone */}
              <div 
                className={`
                  relative
                  w-12 h-12 
                  ${button.iconBg}
                  rounded-xl 
                  flex items-center justify-center
                  mb-2
                  transition-all duration-300
                `}
              >
                <Icon className={`w-6 h-6 ${button.iconColor} transition-transform group-hover:scale-110`} />
              </div>
              
              {/* Nome */}
              <span className={`relative text-sm font-medium ${button.textColor}`}>
                {button.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContactButtons;
