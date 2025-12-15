// src/components/estabelecimento/ContactButtons.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Instagram, Phone, Globe, MoreHorizontal, X } from "lucide-react";

interface ContactButtonsProps {
  whatsapp?: string | null;
  instagram?: string | null;
  phone?: string | null;
  site?: string | null;
  onWhatsApp: () => void;
  onInstagram: () => void;
  onPhone: () => void;
  onSite: () => void;
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
  ].filter((b) => b.available);

  if (buttons.length === 0) return null;

  const primary = buttons[0];
  const secondary = buttons.slice(1, 3);
  const more = buttons.slice(3);

  return (
    <>
      {/* DESKTOP */}
      <section className="hidden md:block px-4 mt-6">
        <div className="max-w-3xl mx-auto grid grid-cols-4 gap-3">
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
      </section>

      {/* MOBILE - Action Bar Fixa */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t px-4 py-3"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={primary.onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl ${primary.color} text-white font-semibold active:scale-[0.98] transition-transform`}
          >
            <primary.icon className="w-5 h-5" />
            {primary.label}
          </button>

          {secondary.map((btn) => (
            <button
              key={btn.id}
              onClick={btn.onClick}
              className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center active:scale-[0.98] transition-all shrink-0"
            >
              <btn.icon className="w-5 h-5 text-gray-700" />
            </button>
          ))}

          {more.length > 0 && (
            <button
              onClick={() => setShowMore(true)}
              className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center active:scale-[0.98] transition-all shrink-0"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:hidden"
          >
            <motion.div className="absolute inset-0 bg-black/50" onClick={() => setShowMore(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full bg-white rounded-t-2xl"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>
              <div className="px-5 pb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Mais opções</h3>
                <button
                  onClick={() => setShowMore(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="px-5 pb-5 space-y-2">
                {more.map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => {
                      btn.onClick();
                      setShowMore(false);
                    }}
                    className="w-full flex items-center gap-3 py-4 px-4 rounded-xl bg-gray-50 active:bg-gray-100"
                  >
                    <div className={`w-10 h-10 rounded-lg ${btn.color} flex items-center justify-center`}>
                      <btn.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">{btn.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ContactButtons;
