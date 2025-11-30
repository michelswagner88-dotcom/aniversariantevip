import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Especialidade {
  id: string;
  nome: string;
  icone: string;
  categoria: string;
}

export const useEspecialidades = (categoria?: string) => {
  return useQuery({
    queryKey: ['especialidades', categoria],
    queryFn: async () => {
      let query = supabase
        .from('especialidades')
        .select('id, nome, icone, categoria')
        .eq('ativo', true)
        .order('ordem');

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Especialidade[];
    },
    enabled: true,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};
