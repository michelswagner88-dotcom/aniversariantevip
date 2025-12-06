import { Phone, MessageCircle, Instagram, Globe } from 'lucide-react';
import { getValidatedContacts, ValidatedContacts } from '@/lib/contactUtils';
import { cn } from '@/lib/utils';

interface ContactButtonsProps {
  estabelecimento: {
    id?: string;
    whatsapp?: string | null;
    telefone?: string | null;
    instagram?: string | null;
    site?: string | null;
    nome_fantasia?: string | null;
    categoria?: string[] | null;
  };
  onWhatsAppClick?: () => void;
  onPhoneClick?: () => void;
  onInstagramClick?: () => void;
  onWebsiteClick?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'icons-only';
}

const ContactButtons: React.FC<ContactButtonsProps> = ({ 
  estabelecimento,
  onWhatsAppClick,
  onPhoneClick,
  onInstagramClick,
  onWebsiteClick,
  className,
  variant = 'default'
}) => {
  const contacts = getValidatedContacts(estabelecimento);
  
  // Se não tem nenhum contato válido
  if (!contacts.hasAnyContact) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm bg-muted/30 rounded-xl">
        <p>Informações de contato não disponíveis</p>
      </div>
    );
  }
  
  const handleClick = (url: string, type: string, callback?: () => void) => {
    // Callback para analytics
    callback?.();
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // Abrir link
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePhoneClick = (url: string, callback?: () => void) => {
    callback?.();
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    window.location.href = url;
  };

  const isCompact = variant === 'compact';
  const isIconsOnly = variant === 'icons-only';
  
  const buttonBase = cn(
    "flex items-center justify-center gap-2",
    "min-h-[48px] min-w-[48px] px-5 rounded-xl",
    "font-medium text-sm",
    "transition-all duration-200",
    "active:scale-[0.98]",
    "touch-manipulation",
    "-webkit-tap-highlight-color: transparent",
    isCompact && "min-h-[44px] min-w-[44px] px-4",
    isIconsOnly && "min-h-[48px] w-[48px] px-0 rounded-full"
  );
  
  return (
    <div className={cn(
      "flex flex-wrap gap-2.5",
      "max-sm:flex-col",
      className
    )}>
      {/* WhatsApp */}
      {contacts.whatsapp && (
        <button
          className={cn(
            buttonBase,
            "bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366]",
            "hover:bg-[#25D366]/25 hover:border-[#25D366] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#25D366]/20"
          )}
          onClick={() => handleClick(contacts.whatsapp!, 'whatsapp', onWhatsAppClick)}
          aria-label="Conversar no WhatsApp"
        >
          <MessageCircle size={20} />
          {!isIconsOnly && <span>WhatsApp</span>}
        </button>
      )}
      
      {/* Ligar */}
      {contacts.phone && (
        <a
          href={contacts.phone}
          className={cn(
            buttonBase,
            "bg-blue-500/15 border border-blue-500/30 text-blue-500",
            "hover:bg-blue-500/25 hover:border-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20",
            "no-underline"
          )}
          onClick={() => onPhoneClick?.()}
          aria-label="Ligar"
        >
          <Phone size={20} />
          {!isIconsOnly && <span>Ligar</span>}
        </a>
      )}
      
      {/* Instagram */}
      {contacts.instagram && (
        <button
          className={cn(
            buttonBase,
            "bg-gradient-to-br from-purple-500/15 via-pink-500/15 to-orange-400/15",
            "border border-pink-500/30 text-pink-500",
            "hover:from-purple-500/25 hover:via-pink-500/25 hover:to-orange-400/25",
            "hover:border-pink-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/20"
          )}
          onClick={() => handleClick(contacts.instagram!, 'instagram', onInstagramClick)}
          aria-label="Ver Instagram"
        >
          <Instagram size={20} />
          {!isIconsOnly && <span>Instagram</span>}
        </button>
      )}
      
      {/* Site */}
      {contacts.website && (
        <button
          className={cn(
            buttonBase,
            "bg-violet-500/15 border border-violet-500/30 text-violet-500",
            "hover:bg-violet-500/25 hover:border-violet-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/20"
          )}
          onClick={() => handleClick(contacts.website!, 'website', onWebsiteClick)}
          aria-label="Visitar site"
        >
          <Globe size={20} />
          {!isIconsOnly && <span>Site</span>}
        </button>
      )}
    </div>
  );
};

export default ContactButtons;
