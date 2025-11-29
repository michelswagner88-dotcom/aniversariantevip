import { useEffect, useCallback } from 'react';
import { z } from 'zod';

/**
 * Hook para extrair e validar logradouro automaticamente do endereço completo
 * 
 * Segue padrões de endereços brasileiros:
 * - "Rua Exemplo, 123" → logradouro: "Rua Exemplo"
 * - "Avenida Paulista, 1000" → logradouro: "Avenida Paulista"
 * - "Travessa das Flores" → logradouro: "Travessa das Flores"
 */

// Schema de validação para logradouro
const logradouroSchema = z.string()
  .trim()
  .min(3, { message: "Logradouro deve ter pelo menos 3 caracteres" })
  .max(200, { message: "Logradouro deve ter no máximo 200 caracteres" })
  .regex(/^[A-Za-zÀ-ÿ0-9\s\-\.]+$/, { 
    message: "Logradouro contém caracteres inválidos" 
  });

interface UseLogradouroExtractorReturn {
  extractLogradouro: (enderecoCompleto: string) => string | null;
  validateLogradouro: (logradouro: string) => { valid: boolean; error?: string };
}

export const useLogradouroExtractor = (): UseLogradouroExtractorReturn => {
  /**
   * Extrai o logradouro de um endereço completo
   * Formato esperado: "Logradouro, Número" ou "Logradouro"
   */
  const extractLogradouro = useCallback((enderecoCompleto: string): string | null => {
    if (!enderecoCompleto || typeof enderecoCompleto !== 'string') {
      return null;
    }

    // Remove espaços extras
    const endereco = enderecoCompleto.trim();

    if (!endereco) {
      return null;
    }

    // Se contém vírgula, pega tudo antes da primeira vírgula
    if (endereco.includes(',')) {
      const logradouro = endereco.split(',')[0].trim();
      return logradouro || null;
    }

    // Se não contém vírgula mas tem números no final, tenta separar
    // Ex: "Rua Exemplo 123" → "Rua Exemplo"
    const match = endereco.match(/^(.+?)\s+(\d+)$/);
    if (match && match[1]) {
      return match[1].trim();
    }

    // Se não conseguiu extrair, retorna o endereço completo como logradouro
    return endereco;
  }, []);

  /**
   * Valida o logradouro extraído usando zod schema
   */
  const validateLogradouro = useCallback((logradouro: string): { valid: boolean; error?: string } => {
    try {
      logradouroSchema.parse(logradouro);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          valid: false, 
          error: error.errors[0]?.message || 'Logradouro inválido' 
        };
      }
      return { valid: false, error: 'Erro ao validar logradouro' };
    }
  }, []);

  return {
    extractLogradouro,
    validateLogradouro,
  };
};

/**
 * Hook de efeito para auto-popular logradouro quando endereço completo muda
 */
export const useAutoPopulateLogradouro = (
  enderecoCompleto: string | undefined,
  currentLogradouro: string | undefined,
  onLogradouroChange: (logradouro: string) => void
) => {
  const { extractLogradouro, validateLogradouro } = useLogradouroExtractor();

  useEffect(() => {
    // Só extrai se o endereço completo está preenchido
    if (!enderecoCompleto || enderecoCompleto.trim().length === 0) {
      return;
    }

    // Só extrai se o logradouro atual está vazio
    if (currentLogradouro && currentLogradouro.trim().length > 0) {
      return;
    }

    const extracted = extractLogradouro(enderecoCompleto);
    
    if (extracted) {
      const validation = validateLogradouro(extracted);
      
      if (validation.valid) {
        onLogradouroChange(extracted);
        console.log('✅ Logradouro extraído automaticamente:', extracted);
      } else {
        console.warn('⚠️ Logradouro extraído inválido:', validation.error);
      }
    }
  }, [enderecoCompleto, currentLogradouro, extractLogradouro, validateLogradouro, onLogradouroChange]);
};
