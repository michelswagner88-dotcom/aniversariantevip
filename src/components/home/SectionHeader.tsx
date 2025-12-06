import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  count?: number;
  linkHref?: string;
  linkText?: string;
}

const SectionHeader = ({ 
  title, 
  count,
  linkHref, 
  linkText = 'Ver todos' 
}: SectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6 sm:mb-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground leading-tight">
          {title}
        </h2>
        {count !== undefined && count > 0 && (
          <span className="text-sm text-muted-foreground">
            {count} {count === 1 ? 'lugar' : 'lugares'}
          </span>
        )}
      </div>
      {linkHref && (
        <Link 
          to={linkHref} 
          className="group flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          {linkText}
          <ChevronRight 
            size={16} 
            className="transition-transform group-hover:translate-x-1" 
          />
        </Link>
      )}
    </div>
  );
};

// Storytelling titles by category
export const getSectionTitle = (categoria: string, cidade?: string | null): string => {
  const titulos: Record<string, string> = {
    'Restaurante': 'Restaurantes para comemorar',
    'Bar': 'Bares populares',
    'Pizzaria': 'Pizzarias bem avaliadas',
    'Cafeteria': 'Cafeterias aconchegantes',
    'Academia': 'Academias com benefícios',
    'Salão de Beleza': 'Salões de beleza',
    'Barbearia': 'Barbearias estilosas',
    'Hospedagem': 'Hotéis para celebrar',
    'Confeitaria': 'Confeitarias irresistíveis',
    'Sorveteria': 'Sorveterias refrescantes',
    'Entretenimento': 'Entretenimento garantido',
    'Casa Noturna': 'Noites inesquecíveis',
    'Loja': 'Lojas com presentes especiais',
    'Saúde e Suplementos': 'Saúde e bem-estar',
    'Serviços': 'Serviços exclusivos',
    'Outros Comércios': 'Outros lugares incríveis',
  };

  return titulos[categoria] || categoria;
};

export const getDestaquesTitle = (cidade?: string | null): string => {
  if (cidade) {
    return `Destaques em ${cidade}`;
  }
  return 'Destaques para você';
};

export default SectionHeader;
