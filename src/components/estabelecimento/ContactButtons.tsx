// ContactButtons.tsx - Botões de Contato Clean

import { MessageCircle, Instagram, Phone, Globe, UtensilsCrossed } from "lucide-react";
import { formatWhatsApp, formatInstagram, formatPhoneLink, formatWebsite } from "@/lib/contactUtils";

interface ContactButtonsProps {
  whatsapp?: string | null;
  instagram?: string | null;
  phone?: string | null;
  site?: string | null;
  cardapio?: string | null;
  onWhatsApp?: () => void;
  onInstagram?: () => void;
  onPhone?: () => void;
  onSite?: () => void;
  onCardapio?: () => void;
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
  const hasWhatsApp = !!formatWhatsApp(whatsapp);
  const hasInstagram = !!formatInstagram(instagram);
  const hasPhone = !!formatPhoneLink(phone);
  const hasSite = !!formatWebsite(site);
  const hasCardapio = !!cardapio;

  const buttons = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      onClick: onWhatsApp,
      available: hasWhatsApp,
      bgColor: "bg-[#25D366]",
      hoverColor: "hover:bg-[#22c55e]",
    },
    {
      name: "Instagram",
      icon: Instagram,
      onClick: onInstagram,
      available: hasInstagram,
      bgColor: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
      hoverColor: "hover:opacity-90",
    },
    {
      name: "Ligar",
      icon: Phone,
      onClick: onPhone,
      available: hasPhone,
      bgColor: "bg-[#3b82f6]",
      hoverColor: "hover:bg-[#2563eb]",
    },
    {
      name: "Site",
      icon: Globe,
      onClick: onSite,
      available: hasSite,
      bgColor: "bg-[#6366f1]",
      hoverColor: "hover:bg-[#4f46e5]",
    },
    {
      name: "Cardápio",
      icon: UtensilsCrossed,
      onClick: onCardapio,
      available: hasCardapio,
      bgColor: "bg-[#f97316]",
      hoverColor: "hover:bg-[#ea580c]",
    },
  ].filter((btn) => btn.available);

  if (buttons.length === 0) return null;

  // Grid responsivo baseado na quantidade de botões
  const getGridClass = () => {
    const count = buttons.length;

    // Mobile: máximo 3 por linha, desktop: até 5
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-3";
    if (count === 4) return "grid-cols-2 sm:grid-cols-4";
    if (count === 5) return "grid-cols-3 sm:grid-cols-5";
    return "grid-cols-3 sm:grid-cols-6";
  };

  return (
    <div className="mx-4 sm:mx-6 mt-4 sm:mt-6">
      <div className="max-w-3xl mx-auto">
        <div className={`grid gap-2 sm:gap-3 ${getGridClass()}`}>
          {buttons.map((button) => {
            const Icon = button.icon;
            const count = buttons.length;

            // Texto menor quando tem muitos botões no mobile
            const showText = count <= 4;

            return (
              <button
                key={button.name}
                onClick={button.onClick}
                className={`
                  ${button.bgColor}
                  ${button.hoverColor}
                  text-white
                  font-medium
                  min-h-[48px]
                  py-3 sm:py-3.5 px-2 sm:px-4
                  rounded-xl
                  flex items-center justify-center gap-1.5 sm:gap-2
                  transition-all duration-200
                  active:scale-[0.98]
                  shadow-sm
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {showText ? (
                  <span className="text-xs sm:text-sm truncate">{button.name}</span>
                ) : (
                  <span className="text-xs sm:text-sm hidden sm:inline">{button.name}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContactButtons;
