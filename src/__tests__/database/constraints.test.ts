import { describe, it, expect } from "vitest";

/**
 * Testes de Validação de Dados
 *
 * NOTA: Testes de constraints do banco (UNIQUE, RLS) devem ser feitos
 * em testes de integração com banco real, não com mocks.
 *
 * Estes testes validam as funções de validação no cliente.
 */

// ===== FUNÇÕES DE VALIDAÇÃO (copiar do useInputMask ou importar) =====

/**
 * Valida CPF usando algoritmo oficial
 */
function validateCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, "");

  if (numbers.length !== 11) return false;

  // Rejeitar CPFs com todos os dígitos iguais
  if (/^(\d)\1+$/.test(numbers)) return false;

  // Validar primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(numbers[9]) !== digit1) return false;

  // Validar segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(numbers[10]) !== digit2) return false;

  return true;
}

/**
 * Valida CNPJ usando algoritmo oficial
 */
function validateCNPJ(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, "");

  if (numbers.length !== 14) return false;

  // Rejeitar CNPJs com todos os dígitos iguais
  if (/^(\d)\1+$/.test(numbers)) return false;

  // Validar primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(numbers[12]) !== digit1) return false;

  // Validar segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(numbers[13]) !== digit2) return false;

  return true;
}

/**
 * Valida telefone celular brasileiro
 */
function validatePhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, "");

  // Deve ter 11 dígitos (DDD + 9 + 8 dígitos)
  if (numbers.length !== 11) return false;

  // Deve começar com 9 após o DDD
  if (numbers[2] !== "9") return false;

  // DDD válido (11-99)
  const ddd = parseInt(numbers.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;

  return true;
}

/**
 * Valida CEP brasileiro
 */
function validateCEP(cep: string): boolean {
  const numbers = cep.replace(/\D/g, "");
  return numbers.length === 8;
}

/**
 * Valida data de nascimento
 */
function validateBirthDate(date: string): { valid: boolean; message?: string } {
  const numbers = date.replace(/\D/g, "");

  if (numbers.length !== 8) {
    return { valid: false, message: "Data incompleta" };
  }

  const day = parseInt(numbers.substring(0, 2));
  const month = parseInt(numbers.substring(2, 4));
  const year = parseInt(numbers.substring(4, 8));

  // Validar ranges básicos
  if (month < 1 || month > 12) {
    return { valid: false, message: "Mês inválido" };
  }

  if (day < 1 || day > 31) {
    return { valid: false, message: "Dia inválido" };
  }

  // Validar idade (18-120 anos)
  const today = new Date();
  const birthDate = new Date(year, month - 1, day);
  const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  if (age < 18) {
    return { valid: false, message: "Você precisa ter pelo menos 18 anos" };
  }

  if (age > 120) {
    return { valid: false, message: "Data de nascimento inválida" };
  }

  return { valid: true };
}

// ===== TESTES =====

describe("Validação de CPF", () => {
  describe("CPFs válidos", () => {
    it("deve aceitar CPF válido formatado", () => {
      expect(validateCPF("529.982.247-25")).toBe(true);
    });

    it("deve aceitar CPF válido sem formatação", () => {
      expect(validateCPF("52998224725")).toBe(true);
    });

    it("deve aceitar outros CPFs válidos", () => {
      expect(validateCPF("453.178.287-91")).toBe(true);
      expect(validateCPF("714.593.642-14")).toBe(true);
      expect(validateCPF("087.316.849-07")).toBe(true);
    });
  });

  describe("CPFs inválidos", () => {
    it("deve rejeitar CPF com dígitos verificadores errados", () => {
      expect(validateCPF("123.456.789-09")).toBe(false);
      expect(validateCPF("529.982.247-00")).toBe(false);
    });

    it("deve rejeitar CPF com todos os dígitos iguais", () => {
      expect(validateCPF("111.111.111-11")).toBe(false);
      expect(validateCPF("000.000.000-00")).toBe(false);
      expect(validateCPF("999.999.999-99")).toBe(false);
    });

    it("deve rejeitar CPF com tamanho incorreto", () => {
      expect(validateCPF("123.456.789")).toBe(false);
      expect(validateCPF("123.456.789-001")).toBe(false);
      expect(validateCPF("12345")).toBe(false);
    });

    it("deve rejeitar CPF vazio", () => {
      expect(validateCPF("")).toBe(false);
    });
  });
});

describe("Validação de CNPJ", () => {
  describe("CNPJs válidos", () => {
    it("deve aceitar CNPJ válido formatado", () => {
      expect(validateCNPJ("11.222.333/0001-81")).toBe(true);
    });

    it("deve aceitar CNPJ válido sem formatação", () => {
      expect(validateCNPJ("11222333000181")).toBe(true);
    });

    it("deve aceitar outros CNPJs válidos", () => {
      expect(validateCNPJ("12.345.678/0001-95")).toBe(true);
    });
  });

  describe("CNPJs inválidos", () => {
    it("deve rejeitar CNPJ com dígitos verificadores errados", () => {
      expect(validateCNPJ("12.345.678/0001-90")).toBe(false);
      expect(validateCNPJ("11.222.333/0001-00")).toBe(false);
    });

    it("deve rejeitar CNPJ com todos os dígitos iguais", () => {
      expect(validateCNPJ("11.111.111/1111-11")).toBe(false);
      expect(validateCNPJ("00.000.000/0000-00")).toBe(false);
    });

    it("deve rejeitar CNPJ com tamanho incorreto", () => {
      expect(validateCNPJ("12.345.678/0001")).toBe(false);
      expect(validateCNPJ("12345")).toBe(false);
    });

    it("deve rejeitar CNPJ vazio", () => {
      expect(validateCNPJ("")).toBe(false);
    });
  });
});

describe("Validação de Telefone", () => {
  describe("Telefones válidos", () => {
    it("deve aceitar celular com DDD válido", () => {
      expect(validatePhone("(48) 99999-9999")).toBe(true);
      expect(validatePhone("(11) 91234-5678")).toBe(true);
    });

    it("deve aceitar celular sem formatação", () => {
      expect(validatePhone("48999999999")).toBe(true);
    });
  });

  describe("Telefones inválidos", () => {
    it("deve rejeitar telefone fixo (8 dígitos)", () => {
      expect(validatePhone("(48) 3333-3333")).toBe(false);
    });

    it("deve rejeitar celular sem o 9 inicial", () => {
      expect(validatePhone("(48) 81234-5678")).toBe(false);
    });

    it("deve rejeitar telefone com tamanho incorreto", () => {
      expect(validatePhone("48999")).toBe(false);
      expect(validatePhone("489999999999")).toBe(false);
    });
  });
});

describe("Validação de CEP", () => {
  it("deve aceitar CEP válido formatado", () => {
    expect(validateCEP("88015-600")).toBe(true);
  });

  it("deve aceitar CEP válido sem formatação", () => {
    expect(validateCEP("88015600")).toBe(true);
  });

  it("deve rejeitar CEP com tamanho incorreto", () => {
    expect(validateCEP("8801")).toBe(false);
    expect(validateCEP("880156001")).toBe(false);
  });
});

describe("Validação de Data de Nascimento", () => {
  describe("Datas válidas", () => {
    it("deve aceitar data de adulto (18+)", () => {
      const result = validateBirthDate("15/03/1990");
      expect(result.valid).toBe(true);
    });

    it("deve aceitar data de pessoa de 18 anos", () => {
      const today = new Date();
      const year = today.getFullYear() - 18;
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      const result = validateBirthDate(`${day}/${month}/${year}`);
      expect(result.valid).toBe(true);
    });
  });

  describe("Datas inválidas", () => {
    it("deve rejeitar menor de 18 anos", () => {
      const today = new Date();
      const year = today.getFullYear() - 10;

      const result = validateBirthDate(`15/03/${year}`);
      expect(result.valid).toBe(false);
      expect(result.message).toContain("18 anos");
    });

    it("deve rejeitar data futura", () => {
      const result = validateBirthDate("15/03/2090");
      expect(result.valid).toBe(false);
    });

    it("deve rejeitar mês inválido", () => {
      const result = validateBirthDate("15/13/1990");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("Mês");
    });

    it("deve rejeitar dia inválido", () => {
      const result = validateBirthDate("32/03/1990");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("Dia");
    });

    it("deve rejeitar data incompleta", () => {
      const result = validateBirthDate("15/03");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("incompleta");
    });
  });
});

describe("Formatação de Documentos", () => {
  describe("Máscara de CPF", () => {
    it("deve formatar corretamente", () => {
      const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, "").slice(0, 11);
        return numbers
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      };

      expect(formatCPF("52998224725")).toBe("529.982.247-25");
    });
  });

  describe("Máscara de CNPJ", () => {
    it("deve formatar corretamente", () => {
      const formatCNPJ = (value: string) => {
        const numbers = value.replace(/\D/g, "").slice(0, 14);
        return numbers
          .replace(/(\d{2})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1/$2")
          .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
      };

      expect(formatCNPJ("11222333000181")).toBe("11.222.333/0001-81");
    });
  });

  describe("Máscara de Telefone", () => {
    it("deve formatar celular corretamente", () => {
      const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "").slice(0, 11);
        return numbers.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
      };

      expect(formatPhone("48999999999")).toBe("(48) 99999-9999");
    });
  });

  describe("Máscara de CEP", () => {
    it("deve formatar corretamente", () => {
      const formatCEP = (value: string) => {
        const numbers = value.replace(/\D/g, "").slice(0, 8);
        return numbers.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
      };

      expect(formatCEP("88015600")).toBe("88015-600");
    });
  });
});

describe("Casos de Borda", () => {
  it("deve lidar com input null/undefined", () => {
    expect(validateCPF(null as any)).toBe(false);
    expect(validateCPF(undefined as any)).toBe(false);
  });

  it("deve lidar com caracteres especiais", () => {
    expect(validateCPF("529@982#247$25")).toBe(true); // Remove não-dígitos
  });

  it("deve lidar com espaços", () => {
    expect(validateCPF(" 529 982 247 25 ")).toBe(true);
  });
});
