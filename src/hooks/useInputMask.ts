import { ChangeEvent } from 'react';

export const useInputMask = () => {
  // Máscara para telefone: (XX) XXXXX-XXXX
  const phoneMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  // Máscara para CPF: XXX.XXX.XXX-XX
  const cpfMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  // Máscara para CEP: XXXXX-XXX
  const cepMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  // Máscara para data: DD/MM/AAAA
  const dateMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  // Validação de CPF (dígitos verificadores)
  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    
    if (numbers.length !== 11) return false;
    
    // CPFs inválidos conhecidos
    const invalidCPFs = [
      '00000000000', '11111111111', '22222222222', '33333333333',
      '44444444444', '55555555555', '66666666666', '77777777777',
      '88888888888', '99999999999'
    ];
    
    if (invalidCPFs.includes(numbers)) return false;

    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(numbers.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(numbers.charAt(10))) return false;

    return true;
  };

  // Validação de telefone (DDD válido e começa com 9)
  const validatePhone = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    
    const ddd = parseInt(numbers.slice(0, 2));
    if (ddd < 11 || ddd > 99) return false;
    
    const firstDigit = numbers.charAt(2);
    if (firstDigit !== '9') return false;
    
    return true;
  };

  // Validação de data de nascimento
  const validateBirthDate = (date: string): { valid: boolean; message?: string } => {
    const numbers = date.replace(/\D/g, '');
    if (numbers.length !== 8) return { valid: false, message: 'Data incompleta' };

    const day = parseInt(numbers.slice(0, 2));
    const month = parseInt(numbers.slice(2, 4));
    const year = parseInt(numbers.slice(4, 8));

    // Validar se é data real
    const dateObj = new Date(year, month - 1, day);
    if (
      dateObj.getDate() !== day ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getFullYear() !== year
    ) {
      return { valid: false, message: 'Data inválida' };
    }

    // Validar idade mínima (16 anos)
    const today = new Date();
    const age = today.getFullYear() - year;
    if (age < 16 || (age === 16 && today < new Date(today.getFullYear(), month - 1, day))) {
      return { valid: false, message: 'Idade mínima: 16 anos' };
    }

    // Validar idade máxima (120 anos)
    if (age > 120) {
      return { valid: false, message: 'Data de nascimento inválida' };
    }

    return { valid: true };
  };

  // Validação de nome completo (mínimo 2 palavras)
  const validateFullName = (name: string): boolean => {
    const trimmed = name.trim();
    const words = trimmed.split(/\s+/);
    return words.length >= 2 && words.every(word => word.length > 0);
  };

  return {
    phoneMask,
    cpfMask,
    cepMask,
    dateMask,
    validateCPF,
    validatePhone,
    validateBirthDate,
    validateFullName,
  };
};
