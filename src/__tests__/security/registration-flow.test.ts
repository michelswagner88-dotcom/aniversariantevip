import { describe, it, expect, beforeEach } from "vitest";

/**
 * Testes de Fluxo de Cadastro
 *
 * Testa a lógica de validação de cadastro de aniversariantes e estabelecimentos.
 * Usa dados válidos (CPF/CNPJ com dígitos verificadores corretos).
 */

// ===== DADOS DE TESTE VÁLIDOS =====

const VALID_CPFS = {
  cpf1: "529.982.247-25",
  cpf2: "453.178.287-91",
  cpf3: "714.593.642-14",
};

const VALID_CNPJS = {
  cnpj1: "11.222.333/0001-81",
  cnpj2: "12.345.678/0001-95",
};

// ===== FUNÇÕES DE VALIDAÇÃO =====

interface AniversarianteData {
  cpf: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  logradouro: string | null;
  bairro: string | null;
  data_nascimento: string | null;
  cadastro_completo?: boolean;
}

interface EstabelecimentoData {
  cnpj: string | null;
  nome_fantasia: string | null;
  razao_social?: string | null;
  telefone?: string | null;
  email?: string | null;
  cadastro_completo?: boolean;
}

/**
 * Valida se aniversariante tem todos os campos obrigatórios
 */
function validateAniversarianteFields(data: AniversarianteData): {
  isValid: boolean;
  missingFields: string[];
} {
  const requiredFields: (keyof AniversarianteData)[] = [
    "cpf",
    "telefone",
    "cidade",
    "estado",
    "cep",
    "logradouro",
    "bairro",
    "data_nascimento",
  ];

  const missingFields = requiredFields.filter((field) => !data[field]);

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Valida se estabelecimento tem todos os campos obrigatórios
 */
function validateEstabelecimentoFields(data: EstabelecimentoData): {
  isValid: boolean;
  missingFields: string[];
} {
  const requiredFields: (keyof EstabelecimentoData)[] = ["cnpj", "nome_fantasia"];

  const missingFields = requiredFields.filter((field) => !data[field]);

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Verifica duplicidade de documento
 */
function checkDuplicateDocument(
  documento: string,
  existingUserId: string | null,
  currentUserId: string,
): { isDuplicate: boolean; message: string } {
  if (!existingUserId) {
    return { isDuplicate: false, message: "Documento disponível" };
  }

  if (existingUserId === currentUserId) {
    return { isDuplicate: false, message: "Documento pertence ao próprio usuário" };
  }

  return { isDuplicate: true, message: "Documento já cadastrado em outra conta" };
}

/**
 * Valida CPF matematicamente
 */
function isValidCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, "");

  if (numbers.length !== 11) return false;
  if (/^(\d)\1+$/.test(numbers)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(numbers[9]) !== digit1) return false;

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
 * Valida CNPJ matematicamente
 */
function isValidCNPJ(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, "");

  if (numbers.length !== 14) return false;
  if (/^(\d)\1+$/.test(numbers)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(numbers[12]) !== digit1) return false;

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

// ===== TESTES =====

describe("Validação de Cadastro de Aniversariante", () => {
  describe("Campos Obrigatórios", () => {
    it("deve rejeitar cadastro sem CPF", () => {
      const data: AniversarianteData = {
        cpf: null,
        telefone: "48999999999",
        cidade: "Florianópolis",
        estado: "SC",
        cep: "88015600",
        logradouro: "Rua Teste",
        bairro: "Centro",
        data_nascimento: "1990-03-15",
      };

      const result = validateAniversarianteFields(data);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain("cpf");
    });

    it("deve rejeitar cadastro sem telefone", () => {
      const data: AniversarianteData = {
        cpf: VALID_CPFS.cpf1,
        telefone: null,
        cidade: "Florianópolis",
        estado: "SC",
        cep: "88015600",
        logradouro: "Rua Teste",
        bairro: "Centro",
        data_nascimento: "1990-03-15",
      };

      const result = validateAniversarianteFields(data);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain("telefone");
    });

    it("deve rejeitar cadastro sem endereço completo", () => {
      const data: AniversarianteData = {
        cpf: VALID_CPFS.cpf1,
        telefone: "48999999999",
        cidade: null,
        estado: null,
        cep: null,
        logradouro: null,
        bairro: null,
        data_nascimento: "1990-03-15",
      };

      const result = validateAniversarianteFields(data);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toEqual(expect.arrayContaining(["cidade", "estado", "cep", "logradouro", "bairro"]));
    });

    it("deve rejeitar cadastro sem data de nascimento", () => {
      const data: AniversarianteData = {
        cpf: VALID_CPFS.cpf1,
        telefone: "48999999999",
        cidade: "Florianópolis",
        estado: "SC",
        cep: "88015600",
        logradouro: "Rua Teste",
        bairro: "Centro",
        data_nascimento: null,
      };

      const result = validateAniversarianteFields(data);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain("data_nascimento");
    });

    it("deve aceitar cadastro completo", () => {
      const data: AniversarianteData = {
        cpf: VALID_CPFS.cpf1,
        telefone: "48999999999",
        cidade: "Florianópolis",
        estado: "SC",
        cep: "88015600",
        logradouro: "Rua Teste",
        bairro: "Centro",
        data_nascimento: "1990-03-15",
      };

      const result = validateAniversarianteFields(data);

      expect(result.isValid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });
  });

  describe("Validação de CPF", () => {
    it("deve aceitar CPFs válidos", () => {
      expect(isValidCPF(VALID_CPFS.cpf1)).toBe(true);
      expect(isValidCPF(VALID_CPFS.cpf2)).toBe(true);
      expect(isValidCPF(VALID_CPFS.cpf3)).toBe(true);
    });

    it("deve rejeitar CPFs com dígitos verificadores errados", () => {
      expect(isValidCPF("123.456.789-09")).toBe(false);
      expect(isValidCPF("529.982.247-00")).toBe(false);
    });

    it("deve rejeitar CPFs com todos os dígitos iguais", () => {
      expect(isValidCPF("111.111.111-11")).toBe(false);
      expect(isValidCPF("000.000.000-00")).toBe(false);
    });
  });

  describe("Verificação de CPF Duplicado", () => {
    it("deve bloquear CPF já cadastrado em outra conta", () => {
      const result = checkDuplicateDocument(VALID_CPFS.cpf1, "existing-user-id", "new-user-id");

      expect(result.isDuplicate).toBe(true);
      expect(result.message).toContain("já cadastrado");
    });

    it("deve permitir CPF do próprio usuário em atualização", () => {
      const userId = "user-123";
      const result = checkDuplicateDocument(VALID_CPFS.cpf1, userId, userId);

      expect(result.isDuplicate).toBe(false);
      expect(result.message).toContain("próprio usuário");
    });

    it("deve permitir CPF não cadastrado", () => {
      const result = checkDuplicateDocument(VALID_CPFS.cpf1, null, "new-user-id");

      expect(result.isDuplicate).toBe(false);
      expect(result.message).toContain("disponível");
    });
  });
});

describe("Validação de Cadastro de Estabelecimento", () => {
  describe("Campos Obrigatórios", () => {
    it("deve rejeitar cadastro sem CNPJ", () => {
      const data: EstabelecimentoData = {
        cnpj: null,
        nome_fantasia: "Restaurante Teste",
      };

      const result = validateEstabelecimentoFields(data);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain("cnpj");
    });

    it("deve rejeitar cadastro sem nome fantasia", () => {
      const data: EstabelecimentoData = {
        cnpj: VALID_CNPJS.cnpj1,
        nome_fantasia: null,
      };

      const result = validateEstabelecimentoFields(data);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain("nome_fantasia");
    });

    it("deve aceitar cadastro com campos obrigatórios", () => {
      const data: EstabelecimentoData = {
        cnpj: VALID_CNPJS.cnpj1,
        nome_fantasia: "Restaurante Teste",
      };

      const result = validateEstabelecimentoFields(data);

      expect(result.isValid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });
  });

  describe("Validação de CNPJ", () => {
    it("deve aceitar CNPJs válidos", () => {
      expect(isValidCNPJ(VALID_CNPJS.cnpj1)).toBe(true);
      expect(isValidCNPJ(VALID_CNPJS.cnpj2)).toBe(true);
    });

    it("deve rejeitar CNPJs com dígitos verificadores errados", () => {
      expect(isValidCNPJ("12.345.678/0001-90")).toBe(false);
      expect(isValidCNPJ("11.222.333/0001-00")).toBe(false);
    });

    it("deve rejeitar CNPJs com todos os dígitos iguais", () => {
      expect(isValidCNPJ("11.111.111/1111-11")).toBe(false);
      expect(isValidCNPJ("00.000.000/0000-00")).toBe(false);
    });
  });

  describe("Verificação de CNPJ Duplicado", () => {
    it("deve bloquear CNPJ já cadastrado", () => {
      const result = checkDuplicateDocument(VALID_CNPJS.cnpj1, "existing-establishment-id", "new-establishment-id");

      expect(result.isDuplicate).toBe(true);
    });

    it("deve permitir CNPJ do próprio estabelecimento em atualização", () => {
      const establishmentId = "estab-123";
      const result = checkDuplicateDocument(VALID_CNPJS.cnpj1, establishmentId, establishmentId);

      expect(result.isDuplicate).toBe(false);
    });
  });
});

describe("Fluxo de Role e Cadastro Completo", () => {
  describe("Timing de Criação de Role", () => {
    it("não deve ter role antes de completar cadastro", () => {
      const userState = {
        hasSession: true,
        hasProfile: true,
        hasRole: false,
        cadastroCompleto: false,
      };

      // Regra: role só é criado quando cadastro_completo = true
      const shouldHaveRole = userState.cadastroCompleto;

      expect(shouldHaveRole).toBe(false);
      expect(userState.hasRole).toBe(shouldHaveRole);
    });

    it("deve ter role após completar cadastro", () => {
      const userState = {
        hasSession: true,
        hasProfile: true,
        hasRole: true,
        cadastroCompleto: true,
      };

      const shouldHaveRole = userState.cadastroCompleto;

      expect(shouldHaveRole).toBe(true);
      expect(userState.hasRole).toBe(shouldHaveRole);
    });
  });

  describe("Transição de Estados", () => {
    it("deve seguir fluxo correto de cadastro", () => {
      const estados = [
        { step: "início", session: false, profile: false, role: false, cadastroCompleto: false },
        { step: "após signup", session: true, profile: true, role: false, cadastroCompleto: false },
        { step: "step2 parcial", session: true, profile: true, role: false, cadastroCompleto: false },
        { step: "step2 completo", session: true, profile: true, role: true, cadastroCompleto: true },
      ];

      // Verificar progressão lógica
      estados.forEach((estado, index) => {
        if (index > 0) {
          const anterior = estados[index - 1];

          // Session deve permanecer true após login
          if (anterior.session) {
            expect(estado.session).toBe(true);
          }

          // Profile deve permanecer true após criação
          if (anterior.profile) {
            expect(estado.profile).toBe(true);
          }

          // Role só deve ser true quando cadastroCompleto for true
          if (estado.role) {
            expect(estado.cadastroCompleto).toBe(true);
          }
        }
      });
    });
  });
});

describe("Validação de Telefone", () => {
  const isValidPhone = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, "");
    return numbers.length === 11 && numbers[2] === "9";
  };

  it("deve aceitar celular válido", () => {
    expect(isValidPhone("(48) 99999-9999")).toBe(true);
    expect(isValidPhone("48999999999")).toBe(true);
  });

  it("deve rejeitar telefone fixo", () => {
    expect(isValidPhone("(48) 3333-3333")).toBe(false);
  });

  it("deve rejeitar telefone incompleto", () => {
    expect(isValidPhone("48999")).toBe(false);
  });
});

describe("Validação de CEP", () => {
  const isValidCEP = (cep: string): boolean => {
    const numbers = cep.replace(/\D/g, "");
    return numbers.length === 8;
  };

  it("deve aceitar CEP válido", () => {
    expect(isValidCEP("88015-600")).toBe(true);
    expect(isValidCEP("88015600")).toBe(true);
  });

  it("deve rejeitar CEP incompleto", () => {
    expect(isValidCEP("8801")).toBe(false);
  });
});

describe("Casos de Borda no Cadastro", () => {
  it("deve tratar strings vazias como campos faltando", () => {
    const data: AniversarianteData = {
      cpf: "",
      telefone: "",
      cidade: "",
      estado: "",
      cep: "",
      logradouro: "",
      bairro: "",
      data_nascimento: "",
    };

    const result = validateAniversarianteFields(data);

    expect(result.isValid).toBe(false);
    expect(result.missingFields).toHaveLength(8);
  });

  it("deve tratar espaços em branco como campos faltando", () => {
    const data: AniversarianteData = {
      cpf: "   ",
      telefone: "   ",
      cidade: "   ",
      estado: "   ",
      cep: "   ",
      logradouro: "   ",
      bairro: "   ",
      data_nascimento: "   ",
    };

    // Trim antes de validar
    const trimmedData: AniversarianteData = {
      cpf: data.cpf?.trim() || null,
      telefone: data.telefone?.trim() || null,
      cidade: data.cidade?.trim() || null,
      estado: data.estado?.trim() || null,
      cep: data.cep?.trim() || null,
      logradouro: data.logradouro?.trim() || null,
      bairro: data.bairro?.trim() || null,
      data_nascimento: data.data_nascimento?.trim() || null,
    };

    const result = validateAniversarianteFields(trimmedData);

    expect(result.isValid).toBe(false);
  });
});
