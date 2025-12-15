// ContactButtons.tsx - Premium Contact Actions 2025
// Tendências: Cores vibrantes por marca, Hover effects, Ícones oficiais

import { motion } from "framer-motion";
import { MessageCircle, Instagram, Phone, Globe, FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactButtonsProps {
  whatsapp?: string | null;
  instagram?: string | null;
  phone?: string | null;
  site?: string | null;
  cardapio?: string | null;
  onWhatsApp: () => void;
  onInstagram: () => void;
  onPhone: () => void;
  onSite: () => void;
  onCardapio: () => void;
}

const ContactButtons = ({
  whatsapp,
  instagram,
  phone,
  site,
  cardapio,
  onWhatsApp,
  onInstagram,
  onPhone,
  onSite,
  onCardapio,
}: ContactButtonsProps) => {
  const buttons = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      available: !!whatsapp,
      onClick: onWhatsApp,
      gradient: "from-[#25D366] to-[#128C7E]",
      shadowColor: "shadow-green-500/30",
      hoverShadow: "hover:shadow-green-500/50",
    },
    {
      id: "instagram",
      label: "Instagram",
      icon: Instagram,
      available: !!instagram,
      onClick: onInstagram,
      gradient: "from-[#833AB4] via-[#E1306C] to-[#F77737]",
      shadowColor: "shadow-pink-500/30",
      hoverShadow: "hover:shadow-pink-500/50",
    },
    {
      id: "phone",
      label: "Ligar",
      icon: Phone,
      available: !!phone,
      onClick: onPhone,
      gradient: "from-[#3B82F6] to-[#1D4ED8]",
      shadowColor: "shadow-blue-500/30",
      hoverShadow: "hover:shadow-blue-500/50",
    },
    {
      id: "site",
      label: "Site",
      icon: Globe,
      available: !!site,
      onClick: onSite,
      gradient: "from-[#374151] to-[#111827]",
      shadowColor: "shadow-gray-500/30",
      hoverShadow: "hover:shadow-gray-500/50",
    },
  ];

  // Filtrar apenas botões disponíveis
  const availableButtons = buttons.filter((btn) => btn.available);

  if (availableButtons.length === 0 && !cardapio) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mx-4 sm:mx-6 mt-6 sm:mt-8"
      aria-label="Opções de contato"
    >
      <div className="max-w-3xl mx-auto">
        {/* Grid de botões principais */}
        <div
          className={cn(
            "grid gap-3",
            availableButtons.length === 1
              ? "grid-cols-1"
              : availableButtons.length === 2
                ? "grid-cols-2"
                : availableButtons.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-4",
          )}
        >
          {availableButtons.map((button, index) => (
            <motion.button
              key={button.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={button.onClick}
              aria-label={`Contato via ${button.label}`}
              className={cn(
                "relative overflow-hidden",
                "flex items-center justify-center gap-2.5",
                "py-4 px-5 rounded-2xl",
                "bg-gradient-to-br",
                button.gradient,
                "text-white font-semibold",
                "shadow-lg",
                button.shadowColor,
                button.hoverShadow,
                "transition-all duration-300",
                "group",
              )}
            >
              {/* Efeito de brilho no hover */}
              <div
                className="
                absolute inset-0 
                bg-gradient-to-r from-transparent via-white/20 to-transparent
                -translate-x-full group-hover:translate-x-full
                transition-transform duration-700
              "
              />

              <button.icon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{button.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Botão Cardápio (secundário) */}
        {cardapio && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCardapio}
            aria-label="Ver cardápio"
            className="
              w-full mt-3
              flex items-center justify-center gap-2.5
              py-4 px-5 rounded-2xl
              bg-white
              border-2 border-[#240046]/10
              text-[#240046] font-semibold
              hover:border-[#240046]/30
              hover:bg-[#240046]/5
              shadow-sm hover:shadow-md
              transition-all duration-300
              group
            "
          >
            <FileText className="w-5 h-5" />
            <span>Ver Cardápio</span>
            <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        )}
      </div>
    </motion.section>
  );
};

export default ContactButtons;
