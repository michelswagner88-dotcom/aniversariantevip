import { useState, useCallback } from 'react';
import { sanitizarInput } from '@/lib/sanitize';

/**
 * Hook para gerenciar input sanitizado
 * @param initialValue - Valor inicial
 * @param maxLength - Tamanho máximo permitido
 * @returns Objeto com value (original), sanitizedValue (sanitizado) e setValue
 */
export const useSanitizedInput = (initialValue: string = '', maxLength: number = 100) => {
  const [value, setValue] = useState(initialValue);
  const [sanitizedValue, setSanitizedValue] = useState(sanitizarInput(initialValue, maxLength));

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    setSanitizedValue(sanitizarInput(newValue, maxLength));
  }, [maxLength]);

  const reset = useCallback(() => {
    setValue('');
    setSanitizedValue('');
  }, []);

  return {
    value,           // Valor original (para exibir no input)
    sanitizedValue,  // Valor sanitizado (para usar na query)
    setValue: handleChange,
    reset,
  };
};
