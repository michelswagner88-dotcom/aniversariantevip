// src/components/estabelecimento/ContactButtons.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Instagram, Phone, Globe, FileText, MoreHorizontal, X } from "lucide-react";

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
  const [showMore, setShowMore] = useState(false);

  const buttons = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      available: !!whatsapp,
      onClick: onWhatsApp,
      color: "bg-[#25D366]",
    },
    {
      id: "instagram",
      label: "Instagram",
      icon: Instagram,
      available: !!instagram,
      onClick: onInstagram,
      color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
    },
    { id: "phone", label: "Ligar", icon: Phone, available: !!phone, onClick: onPhone, color: "bg-blue-500" },
    { id: "site", label: "Site", icon: Globe, available: !!site, onClick: onSite, color: "bg-gray-700" },
    {
      id: "cardapio",
      label: "Cardapio",
      icon: FileText,
      available: !!cardapio,
      onClick: onCardapio,
      color: "bg-amber-600",
    },
  ].filter((b) => b.available);

  if (buttons.length === 0) return null;

  return (
    <section className="px-4 mt-6">
      <div className="max-w-3xl mx-auto">
        <div
          className={`grid gap-3 ${
            buttons.length === 1
              ? "grid-cols-1"
              : buttons.length === 2
                ? "grid-cols-2"
                : buttons.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-4"
          }`}
        >
          {buttons.map((btn) => (
            <button
              key={btn.id}
              onClick={btn.onClick}
              className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl ${btn.color} text-white font-medium text-sm active:scale-[0.98] transition-transform`}
            >
              <btn.icon className="w-5 h-5" />
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactButtons;
