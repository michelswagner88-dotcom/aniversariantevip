import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizeText = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export const normalizarCidade = (cidade: string): string => {
  if (!cidade) return '';
  
  const cidadesNormalizadas: Record<string, string> = {
    'florianopolis': 'Florianópolis',
    'sao paulo': 'São Paulo',
    'rio de janeiro': 'Rio de Janeiro',
    'belo horizonte': 'Belo Horizonte',
    'porto alegre': 'Porto Alegre',
    'curitiba': 'Curitiba',
    'brasilia': 'Brasília',
    'salvador': 'Salvador',
    'fortaleza': 'Fortaleza',
    'recife': 'Recife',
    'manaus': 'Manaus',
    'goiania': 'Goiânia',
    'belem': 'Belém',
    'vitoria': 'Vitória',
    'natal': 'Natal',
    'joao pessoa': 'João Pessoa',
    'maceio': 'Maceió',
    'teresina': 'Teresina',
    'campo grande': 'Campo Grande',
    'cuiaba': 'Cuiabá',
  };
  
  const cidadeLower = cidade.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return cidadesNormalizadas[cidadeLower] || 
    cidade.trim().split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
};
