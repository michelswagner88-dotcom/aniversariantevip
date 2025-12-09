// ContactButtons.tsx - Botões de Contato Clean

import { MessageCircle, Instagram, Phone, Globe } from "lucide-react";
import { formatWhatsApp, formatInstagram, formatPhoneLink, formatWebsite } from "@/lib/contactUtils";

interface ContactButtonsProps {
  whatsapp?: string | null;
  instagram?: string | null;
  phone?: string | null;
  site?: string | null;
  onWhatsApp?: () => void;
  onInstagram?: () => void;
  onPhone?: () => void;
  onSite?: () => void;
}

const ContactButtons = ({
  whatsapp,
  instagram,
  phone,
  site,
  onWhatsApp,
  onInstagram,
  onPhone,
  onSite,
}: ContactButtonsProps) => {
  const hasWhatsApp = !!formatWhatsApp(whatsapp);
  const hasInstagram = !!formatInstagram(instagram);
  const hasPhone = !!formatPhoneLink(phone);
  const hasSite = !!formatWebsite(site);

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
      bgColor: "bg-[#240046]",
      hoverColor: "hover:bg-[#3C096C]",
    },
  ].filter((btn) => btn.available);

  if (buttons.length === 0) return null;

  return (
    <div className="mx-4 sm:mx-6 mt-4 sm:mt-6">
      <div className="max-w-3xl mx-auto">
        {/* Grid 2 colunas no mobile pequeno, adapta conforme quantidade */}
        <div
          className={`grid gap-2 sm:gap-3 ${
            buttons.length === 1
              ? "grid-cols-1"
              : buttons.length === 2
                ? "grid-cols-2"
                : buttons.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-4"
          }`}
        >
          {buttons.map((button) => {
            const Icon = button.icon;

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
                  py-3 sm:py-3.5 px-3 sm:px-4
                  rounded-xl
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  active:scale-[0.98]
                  shadow-sm
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{button.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContactButtons;
