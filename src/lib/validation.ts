import { z } from "zod";

// CPF validation schema - accepts either formatted (###.###.###-##) or raw (11 digits)
export const cpfSchema = z.string()
  .refine(
    (value) => {
      const cleaned = value.replace(/\D/g, '');
      return cleaned.length === 11;
    },
    { message: "CPF deve ter 11 dígitos" }
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
