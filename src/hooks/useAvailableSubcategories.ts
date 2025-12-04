import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAvailableSubcategoriesProps {
  cidade?: string | null;
  estado?: string | null;
  categoria?: string | null;
}

export const useAvailableSubcategories = ({ 
  cidade, 
  estado, 
  categoria 
}: UseAvailableSubcategoriesProps) => {
  const [subcategorias, setSubcategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcategorias = async () => {
      // Se não tem categoria, não busca subcategorias
      if (!categoria) {
        setSubcategorias([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        // Buscar estabelecimentos com especialidades
        let query = supabase
          .from('public_estabelecimentos')
          .select('especialidades')
          .eq('ativo', true)
          .not('especialidades', 'is', null);

        // Filtrar por cidade se especificada
        if (cidade) {
          query = query.ilike('cidade', cidade);
        }
        
        // Filtrar por estado se especificado
        if (estado) {
          query = query.ilike('estado', estado);
        }

        // Filtrar por categoria - categoria é um array, usar contains
        if (categoria) {
          query = query.contains('categoria', [categoria]);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar subcategorias:', error);
          setSubcategorias([]);
          return;
        }

        // Extrair especialidades únicas de todos os arrays
        const allEspecialidades: string[] = [];
        data?.forEach(item => {
          if (item.especialidades && Array.isArray(item.especialidades)) {
            allEspecialidades.push(...item.especialidades);
          }
        });

        // Remover duplicatas, filtrar vazios e ordenar
        const uniqueSubcategorias = [...new Set(allEspecialidades)]
          .filter(esp => esp && esp.trim() !== '')
          .sort((a, b) => a.localeCompare(b, 'pt-BR'));

        setSubcategorias(uniqueSubcategorias);
      } catch (error) {
        console.error('Erro ao buscar subcategorias:', error);
        setSubcategorias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategorias();
  }, [cidade, estado, categoria]);

  return { subcategorias, loading };
};

export default useAvailableSubcategories;
