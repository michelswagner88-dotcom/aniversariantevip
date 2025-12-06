import { 
  BadgeCheck, 
  Award, 
  Star, 
  Sparkles, 
  Gift,
  Crown,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type BadgeType = 
  | 'verificado'      // Estabelecimento confirmado pela equipe
  | 'parceiro'        // Parceiro oficial
  | 'destaque'        // Destaque do mês/semana
  | 'novo'            // Recém-cadastrado (últimos 30 dias)
  | 'superBeneficio'  // Benefício acima da média
  | 'exclusivo';      // Benefício exclusivo da plataforma

interface BadgeConfig {
  icon: LucideIcon;
  label: string;
  className: string;
}

const BADGE_CONFIG: Record<BadgeType, BadgeConfig> = {
  verificado: {
    icon: BadgeCheck,
    label: 'Verificado',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  parceiro: {
    icon: Award,
    label: 'Parceiro',
    className: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  },
  destaque: {
    icon: Star,
    label: 'Destaque',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  novo: {
    icon: Sparkles,
    label: 'Novo',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  superBeneficio: {
    icon: Gift,
    label: 'Super Benefício',
    className: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  },
  exclusivo: {
    icon: Crown,
    label: 'Exclusivo',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
};

interface EstablishmentBadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md';
  className?: string;
}

export const EstablishmentBadge = ({ 
  type, 
  size = 'sm',
  className 
}: EstablishmentBadgeProps) => {
  const config = BADGE_CONFIG[type];
  const Icon = config.icon;
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-[11px] gap-1' 
    : 'px-3 py-1.5 text-xs gap-1.5';
  
  const iconSize = size === 'sm' ? 12 : 14;
  
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium backdrop-blur-sm',
      sizeClasses,
      config.className,
      type === 'destaque' && 'animate-badge-glow',
      className
    )}>
      <Icon size={iconSize} />
      {config.label}
    </span>
  );
};

// Determinar badges do estabelecimento
export const getEstablishmentBadges = (establishment: {
  is_verificado?: boolean;
  is_parceiro?: boolean;
  is_destaque?: boolean;
  created_at?: string;
  descricao_beneficio?: string;
}): BadgeType[] => {
  const badges: BadgeType[] = [];
  
  // Verificado: marcado manualmente pela equipe
  if (establishment.is_verificado) {
    badges.push('verificado');
  }
  
  // Parceiro: tem contrato/acordo formal
  if (establishment.is_parceiro) {
    badges.push('parceiro');
  }
  
  // Destaque: selecionado pela equipe como destaque
  if (establishment.is_destaque) {
    badges.push('destaque');
  }
  
  // Novo: cadastrado nos últimos 30 dias
  if (establishment.created_at) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (new Date(establishment.created_at) > thirtyDaysAgo) {
      badges.push('novo');
    }
  }
  
  return badges;
};

// Obter badge principal (mais importante) para exibir no card
export const getPrimaryBadge = (badges: BadgeType[]): BadgeType | null => {
  const priority: BadgeType[] = [
    'destaque',       // 1º - Destaque é o mais importante
    'superBeneficio', // 2º - Super benefício
    'exclusivo',      // 3º - Exclusivo
    'parceiro',       // 4º - Parceiro oficial
    'verificado',     // 5º - Verificado
    'novo',           // 6º - Novo
  ];
  
  for (const badge of priority) {
    if (badges.includes(badge)) {
      return badge;
    }
  }
  
  return null;
};
