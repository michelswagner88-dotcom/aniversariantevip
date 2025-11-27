import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCheckCpfExists = (cpf: string, isValid: boolean) => {
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Só verifica se CPF é válido e tem 11 dígitos
    if (!isValid || cpf.replace(/\D/g, '').length !== 11) {
      setExists(false);
      setLoading(false);
      return;
    }

    // Debounce de 500ms
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const cpfNumeros = cpf.replace(/\D/g, '');
        
        const { data, error } = await supabase
          .from('aniversariantes')
          .select('id')
          .eq('cpf', cpfNumeros)
          .maybeSingle();

        if (error) {
          console.error('Erro ao verificar CPF:', error);
          setExists(false);
        } else {
          setExists(!!data);
        }
      } catch (err) {
        console.error('Erro ao verificar CPF:', err);
        setExists(false);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cpf, isValid]);

  return { exists, loading };
};
