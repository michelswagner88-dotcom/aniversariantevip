import { useState } from 'react';
import { toast } from 'sonner';

interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string; // estado
  erro?: boolean;
}

export const useCepLookup = () => {
  const [loading, setLoading] = useState(false);

  const formatCep = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    // Aplica máscara XXXXX-XXX
    return numbers.replace(/(\d{5})(\d{1,3})/, '$1-$2').slice(0, 9);
  };

  const validateCep = (cep: string): boolean => {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.length === 8;
  };

  const fetchCep = async (cep: string): Promise<CepData | null> => {
    setLoading(true);

    try {
      // Remove caracteres não numéricos
      const cleanCep = cep.replace(/\D/g, '');

      if (!validateCep(cep)) {
        toast.error('CEP inválido', {
          description: 'Digite um CEP válido com 8 dígitos',
        });
        return null;
      }

      // Busca na API ViaCEP (API brasileira gratuita e moderna)
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }

      const data: CepData = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado', {
          description: 'Verifique o CEP digitado e tente novamente',
        });
        return null;
      }

      toast.success('CEP encontrado!', {
        description: `${data.localidade}, ${data.uf}`,
      });

      return data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP', {
        description: 'Tente novamente mais tarde',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchCep,
    formatCep,
    validateCep,
    loading,
  };
};
