import { z } from "zod";

// Helper function to validate CPF
const isValidCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  
  // Check if has 11 digits
  if (cleaned.length !== 11) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;
  
  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
};

// Helper function to validate CNPJ
const isValidCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, '');
  
  // Check if has 14 digits
  if (cleaned.length !== 14) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{13}$/.test(cleaned)) return false;
  
  // Validate first digit
  let size = cleaned.length - 2;
  let numbers = cleaned.substring(0, size);
  const digits = cleaned.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Validate second digit
  size = size + 1;
  numbers = cleaned.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

// CPF validation schema - accepts either formatted (###.###.###-##) or raw (11 digits)
export const cpfSchema = z.string()
  .refine(
    (value) => {
      const cleaned = value.replace(/\D/g, '');
      return cleaned.length === 11;
    },
    { message: "CPF deve ter 11 dígitos" }
  )
  .refine(
    (value) => isValidCPF(value),
    { message: "CPF inválido" }
  )
  .transform((value) => value.replace(/\D/g, '')); // Store only digits

// CNPJ validation schema - accepts either formatted or raw (14 digits)
export const cnpjSchema = z.string()
  .refine(
    (value) => {
      if (!value) return true; // Allow empty CNPJ
      const cleaned = value.replace(/\D/g, '');
      return cleaned.length === 14;
    },
    { message: "CNPJ deve ter 14 dígitos" }
  )
  .refine(
    (value) => {
      if (!value) return true; // Allow empty CNPJ
      return isValidCNPJ(value);
    },
    { message: "CNPJ inválido" }
  )
  .transform((value) => value ? value.replace(/\D/g, '') : '');

// Phone validation schema - accepts various formats
export const phoneSchema = z.string()
  .refine(
    (value) => {
      const cleaned = value.replace(/\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 11;
    },
    { message: "Telefone inválido. Use (DD) XXXXX-XXXX" }
  )
  .transform((value) => value.replace(/\D/g, '')); // Store only digits

// Aniversariante registration schema
export const aniversarianteSchema = z.object({
  nomeCompleto: z.string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  cpf: cpfSchema,
  email: z.string()
    .email("Email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres"),
  telefone: phoneSchema,
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  senha: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não conferem",
  path: ["confirmarSenha"],
});

// Estabelecimento registration schema
export const estabelecimentoSchema = z.object({
  nomeFantasia: z.string()
    .min(3, "Nome fantasia deve ter pelo menos 3 caracteres")
    .max(100, "Nome fantasia deve ter no máximo 100 caracteres"),
  cnpj: cnpjSchema,
  email: z.string()
    .email("Email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres"),
  telefone: phoneSchema,
  endereco: z.string()
    .min(10, "Endereço deve ter pelo menos 10 caracteres")
    .max(255, "Endereço deve ter no máximo 255 caracteres"),
  senha: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não conferem",
  path: ["confirmarSenha"],
});
