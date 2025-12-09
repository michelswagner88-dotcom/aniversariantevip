import { useState, useEffect } from 'react';
import { Heart, MapPin, Gift, Star, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EstablishmentCardProps {
  establishment: {
    id: string;
    slug?: string;
    nome_fantasia?: string;
    name?: string;
    logo_url?: string;
    galeria_fotos?: string[];
    photo_url?: string;
    categoria?: string[];
    category?: string;
    especialidades?: string[];
    subcategory?: string;
    bairro?: string;
    cidade?: string;
    descricao_beneficio?: string;
    benefit_description?: string;
    benefit_summary?: string;
    created_at?: string;
    is_new?: boolean;
    is_popular?: boolean;
    is_verificado?: boolean;
  };
  index?: number;
  userLocation?: { lat: number; lng: number } | null;
}

// Mapeamento de cores por categoria
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'Restaurante': { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
  'Bar': { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
  'Cafeteria': { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
  'Salão de Beleza': { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/30' },
  'Academia': { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  'Barbearia': { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/30' },
  'Confeitaria': { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/30' },
  'Sorveteria': { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  'Entretenimento': { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/30' },
  'Casa Noturna': { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  'Hospedagem': { bg: 'bg-teal-500/20', text: 'text-teal-300', border: 'border-teal-500/30' },
  'Loja': { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  'Saúde e Suplementos': { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
  'Serviços': { bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/30' },
  'Outros Comércios': { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' },
  'default': { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' },
};

const getCategoryColor = (category: string) => {
  return categoryColors[category] || categoryColors['default'];
};

// Extrair resumo do benefício
const extractBenefitSummary = (description?: string): string | null => {
  if (!description) return null;
  
  const patterns = [
    /(\d+%\s*(de\s*)?(off|desconto|desc))/i,
    /(grátis|gratuito|free|cortesia)/i,
    /(\d+\s*reais?\s*(de\s*)?(desconto|off))/i,
    /(sobremesa|drink|entrada|prato)\s*(grátis|cortesia)/i,
  ];
  
  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return match[0].charAt(0).toUpperCase() + match[0].slice(1).toLowerCase();
    }
  }
  
  if (description.length < 40) {
    return description;
  }
  
  return "Benefício especial";
};

// Verificar se é novo (últimos 30 dias)
const checkIsNew = (createdAt?: string): boolean => {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return created > thirtyDaysAgo;
};

const EstablishmentCard = ({ establishment, index = 0 }: EstablishmentCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Verificar se está favoritado
  useEffect(() => {
    const checkFavorite = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from('favoritos')
          .select('id')
          .eq('usuario_id', user.id)
          .eq('estabelecimento_id', establishment.id)
          .maybeSingle();
        setIsFavorited(!!data);
      }
    };
    checkFavorite();
  }, [establishment.id]);

  const toggleFavorite = async () => {
    if (!userId) {
      toast.error('Faça login para favoritar');
      return;
    }

    if (isFavorited) {
      await supabase
        .from('favoritos')
        .delete()
        .eq('usuario_id', userId)
        .eq('estabelecimento_id', establishment.id);
      setIsFavorited(false);
    } else {
      await supabase
        .from('favoritos')
        .insert({ usuario_id: userId, estabelecimento_id: establishment.id });
      setIsFavorited(true);
    }
  };

  // Normalizar dados
  const name = establishment.nome_fantasia || establishment.name || 'Estabelecimento';
  const photo = establishment.galeria_fotos?.[0] || establishment.logo_url || establishment.photo_url || '/placeholder-estabelecimento.png';
  const category = establishment.categoria?.[0] || establishment.category || 'Outros';
  const subcategory = establishment.especialidades?.[0] || establishment.subcategory;
  const bairro = establishment.bairro || '';
  const cidade = establishment.cidade || '';
  const slug = establishment.slug || establishment.id;
  const benefitDescription = establishment.descricao_beneficio || establishment.benefit_description;
  
  const categoryColor = getCategoryColor(category);
  const benefitSummary = establishment.benefit_summary || extractBenefitSummary(benefitDescription);
  const isNew = establishment.is_new ?? checkIsNew(establishment.created_at);
  const isPopular = establishment.is_popular ?? false;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite();
  };

  // URL do estabelecimento
  const establishmentUrl = `/${cidade.toLowerCase().replace(/\s+/g, '-') || 'brasil'}/${slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link 
        to={establishmentUrl}
        className="block group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className={`
            relative
            rounded-2xl 
            overflow-hidden 
            bg-card/50
            border border-border/50
            transition-all duration-500 ease-out
            ${isHovered 
              ? 'transform -translate-y-2 shadow-2xl shadow-[#240046]/20 border-[#240046]/30' 
              : 'shadow-lg shadow-black/20'
            }
          `}
        >
          {/* Container da imagem */}
          <div className="relative aspect-[4/3] overflow-hidden">
            
            {/* Skeleton enquanto carrega */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
            )}
            
            {/* Imagem com zoom no hover */}
            <img 
              src={photo}
              alt={name}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-estabelecimento.png';
                setImageLoaded(true);
              }}
              className={`
                w-full h-full object-cover
                transition-all duration-700 ease-out
                ${isHovered ? 'scale-110' : 'scale-100'}
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              `}
            />
            
            {/* Gradiente na base para uniformizar */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            {/* Vinheta sutil */}
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]" />

            {/* BADGES NO TOPO ESQUERDO */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[65%]">
              {/* Badge de categoria */}
              <span 
                className={`
                  inline-flex items-center gap-1
                  ${categoryColor.bg}
                  ${categoryColor.text}
                  ${categoryColor.border}
                  border
                  px-2 py-1
                  rounded-lg
                  text-xs font-medium
                  backdrop-blur-md
                  shadow-sm
                `}
              >
                {subcategory || category}
              </span>

              {/* Badge de Benefício */}
              <span className="
                inline-flex items-center gap-1
                bg-gradient-to-r from-[#240046]/90 to-[#3C096C]/90
                text-white
                px-2 py-1
                rounded-lg
                text-xs font-medium
                backdrop-blur-md
                shadow-sm
                border border-white/20
              ">
                <Gift className="w-3 h-3" />
                Benefício
              </span>
            </div>

            {/* BADGES ESPECIAIS (NOVO / POPULAR) */}
            {(isNew || isPopular) && (
              <div className="absolute top-3 right-12 flex gap-1.5">
                {isNew && (
                  <span className="
                    inline-flex items-center gap-1
                    bg-gradient-to-r from-green-500 to-emerald-500
                    text-white
                    px-2 py-1
                    rounded-lg
                    text-xs font-bold
                    shadow-lg shadow-green-500/30
                    animate-pulse
                  ">
                    <Star className="w-3 h-3" />
                    Novo
                  </span>
                )}
                {isPopular && (
                  <span className="
                    inline-flex items-center gap-1
                    bg-gradient-to-r from-orange-500 to-red-500
                    text-white
                    px-2 py-1
                    rounded-lg
                    text-xs font-bold
                    shadow-lg shadow-orange-500/30
                  ">
                    <Flame className="w-3 h-3" />
                    Popular
                  </span>
                )}
              </div>
            )}

            {/* BOTÃO FAVORITAR */}
            <button
              onClick={handleFavorite}
              className={`
                absolute top-3 right-3
                w-9 h-9
                rounded-full
                flex items-center justify-center
                transition-all duration-300 ease-out
                backdrop-blur-md
                border
                z-10
                ${isFavorited 
                  ? 'bg-pink-500/90 border-pink-400/50 shadow-lg shadow-pink-500/30' 
                  : 'bg-black/40 border-white/10 hover:bg-black/60 hover:border-white/20'
                }
                ${isHovered ? 'scale-110' : 'scale-100'}
                active:scale-95
              `}
              aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart 
                className={`
                  w-4 h-4 
                  transition-all duration-300
                  ${isFavorited 
                    ? 'text-white fill-white' 
                    : 'text-white'
                  }
                `}
              />
            </button>

            {/* PREVIEW DO BENEFÍCIO (APARECE NO HOVER) */}
            {benefitSummary && (
              <div 
                className={`
                  absolute bottom-3 left-3 right-3
                  bg-black/80
                  backdrop-blur-xl
                  rounded-xl
                  px-4 py-3
                  border border-white/10
                  transition-all duration-300 ease-out
                  ${isHovered 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-2 pointer-events-none'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#240046]/30 to-[#3C096C]/30 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 text-[#A78BFA]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Seu benefício</p>
                    <p className="text-sm text-white font-semibold truncate">{benefitSummary}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INFORMAÇÕES DO ESTABELECIMENTO */}
          <div className="p-4">
            {/* Nome */}
            <h3 
              className={`
                text-base font-semibold 
                line-clamp-1
                transition-colors duration-300
                ${isHovered ? 'text-[#240046] dark:text-[#A78BFA]' : 'text-gray-900 dark:text-foreground'}
              `}
            >
              {name}
            </h3>
            
            {/* Localização */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground line-clamp-1">
                {bairro}{bairro && cidade ? ', ' : ''}{cidade}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EstablishmentCard;
