// ContactButtons.tsx - Botões de Contato Premium

import { MessageCircle, Instagram, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

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
      hoverGradient: 'group-hover:from-green-500/30 group-hover:to-green-600/20',
      borderColor: 'border-green-500/30',
      hoverBorder: 'group-hover:border-green-400/50',
      iconBg: 'bg-green-500/20 group-hover:bg-green-500/30',
      iconColor: 'text-green-400',
      textColor: 'text-green-300',
      glowColor: 'group-hover:shadow-green-500/40',
      rippleColor: 'bg-green-400/20',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      onClick: onInstagram,
      available: !!instagram,
      gradient: 'from-pink-500/20 via-purple-500/10 to-orange-500/10',
      hoverGradient: 'group-hover:from-pink-500/30 group-hover:via-purple-500/20 group-hover:to-orange-500/20',
      borderColor: 'border-pink-500/30',
      hoverBorder: 'group-hover:border-pink-400/50',
      iconBg: 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 group-hover:from-pink-500/30 group-hover:to-purple-500/30',
      iconColor: 'text-pink-400',
      textColor: 'text-pink-300',
      glowColor: 'group-hover:shadow-pink-500/40',
      rippleColor: 'bg-pink-400/20',
    },
    {
      name: 'Ligar',
      icon: Phone,
      onClick: onPhone,
      available: !!phone,
      gradient: 'from-blue-500/20 to-blue-600/10',
      hoverGradient: 'group-hover:from-blue-500/30 group-hover:to-blue-600/20',
      borderColor: 'border-blue-500/30',
      hoverBorder: 'group-hover:border-blue-400/50',
      iconBg: 'bg-blue-500/20 group-hover:bg-blue-500/30',
      iconColor: 'text-blue-400',
      textColor: 'text-blue-300',
      glowColor: 'group-hover:shadow-blue-500/40',
      rippleColor: 'bg-blue-400/20',
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="mx-4 mt-6"
    >
      <div className="grid grid-cols-3 gap-3">
        {buttons.map((button, index) => {
          const Icon = button.icon;
          
          return (
            <motion.button
              key={button.name}
              onClick={button.onClick}
              disabled={!button.available}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={`
                group
                relative
                flex flex-col items-center justify-center
                bg-gradient-to-br ${button.gradient}
                ${button.hoverGradient}
                border ${button.borderColor}
                ${button.hoverBorder}
                rounded-2xl
                p-4
                transition-all duration-300 ease-out
                shadow-lg ${button.glowColor}
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                overflow-hidden
              `}
            >
              {/* Ripple effect on click */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div 
                  className={`
                    absolute inset-0 
                    ${button.rippleColor}
                    scale-0 
                    group-active:scale-150 
                    transition-transform duration-500
                    rounded-full
                    origin-center
                  `}
                />
              </div>
              
              {/* Glow effect */}
              <div 
                className="
                  absolute inset-0 
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                  pointer-events-none
                  rounded-2xl
                "
                style={{
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)'
                }}
              />
              
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
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ContactButtons;