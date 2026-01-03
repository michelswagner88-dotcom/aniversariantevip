// =============================================================================
// TESTES: normalizePtBrText
// Verificação completa de correções PT-BR
// =============================================================================

import { describe, it, expect } from "vitest";
import {
  normalizePtBrText,
  normalizeWithDetails,
  hasChanges,
  getDiff,
} from "@/lib/normalizePtBrText";

describe("normalizePtBrText", () => {
  // ===========================================================================
  // CORREÇÕES DO DICIONÁRIO - Palavras individuais
  // ===========================================================================
  describe("Correções do dicionário", () => {
    const casosAcentuacao = [
      // Benefícios e promoções
      ["beneficio", "Benefício"],
      ["beneficios", "Benefícios"],
      ["aniversario", "Aniversário"],
      ["aniversarios", "Aniversários"],
      ["gratis", "Grátis"],
      ["promocao", "Promoção"],
      ["promocoes", "Promoções"],
      
      // Validade
      ["valido", "Válido"],
      ["valida", "Válida"],
      ["validos", "Válidos"],
      ["validas", "Válidas"],
      
      // Consumo
      ["consumacao", "Consumação"],
      ["refeicao", "Refeição"],
      ["refeicoes", "Refeições"],
      
      // Exceções e restrições
      ["excecao", "Exceção"],
      ["excecoes", "Exceções"],
      ["restricao", "Restrição"],
      ["restricoes", "Restrições"],
      
      // Limites
      ["minimo", "Mínimo"],
      ["minima", "Mínima"],
      ["maximo", "Máximo"],
      ["maxima", "Máxima"],
      ["unico", "Único"],
      ["unica", "Única"],
      
      // Tempo
      ["horario", "Horário"],
      ["horarios", "Horários"],
      ["sabado", "Sábado"],
      ["sabados", "Sábados"],
      ["proximo", "Próximo"],
      ["proxima", "Próxima"],
      ["proximos", "Próximos"],
      ["proximas", "Próximas"],
      ["mes", "Mês"],
      
      // Necessidade
      ["necessario", "Necessário"],
      ["necessaria", "Necessária"],
      ["obrigatorio", "Obrigatório"],
      ["obrigatoria", "Obrigatória"],
      ["disponivel", "Disponível"],
      ["disponiveis", "Disponíveis"],
      
      // Palavras curtas
      ["tambem", "Também"],
      ["so", "Só"],
      ["ate", "Até"],
      ["apos", "Após"],
      ["tres", "Três"],
      ["nao", "Não"],
      ["entao", "Então"],
      ["voce", "Você"],
      ["ja", "Já"],
      ["ha", "Há"],
      
      // Números
      ["numero", "Número"],
      ["numeros", "Números"],
      ["incluido", "Incluído"],
      ["incluida", "Incluída"],
      
      // Verbos
      ["sera", "Será"],
      ["serao", "Serão"],
      ["esta", "Está"],
      ["estao", "Estão"],
      
      // Cupons
      ["cupom", "Cupom"],
      ["cupons", "Cupons"],
      ["desconto", "Desconto"],
      ["descontos", "Descontos"],
      ["cortesia", "Cortesia"],
      ["cortesias", "Cortesias"],
    ];

    it.each(casosAcentuacao)(
      "deve corrigir '%s' para '%s'",
      (entrada, esperado) => {
        expect(normalizePtBrText(entrada)).toBe(esperado);
      }
    );
  });

  // ===========================================================================
  // EXPRESSÕES COMPOSTAS
  // ===========================================================================
  describe("Expressões compostas", () => {
    const expressoesCompostas = [
      ["semana do aniversario", "Semana do aniversário"],
      ["mes do aniversario", "Mês do aniversário"],
      ["dia do aniversario", "Dia do aniversário"],
      ["nao acumulativo", "Não acumulativo"],
      ["nao cumulativo", "Não cumulativo"],
      ["consumacao minima", "Consumação mínima"],
      ["reserva previa", "Reserva prévia"],
      ["rg ou cnh", "RG ou CNH"],
      ["segunda a sexta", "Segunda a sexta"],
      ["seg a sex", "Segunda a sexta"],
      ["sabado e domingo", "Sábado e domingo"],
      ["sab e dom", "Sábado e domingo"],
    ];

    it.each(expressoesCompostas)(
      "deve corrigir '%s' para '%s'",
      (entrada, esperado) => {
        expect(normalizePtBrText(entrada)).toBe(esperado);
      }
    );
  });

  // ===========================================================================
  // CAPITALIZAÇÃO
  // ===========================================================================
  describe("Capitalização", () => {
    it("deve capitalizar primeira letra do texto", () => {
      expect(normalizePtBrText("texto simples")).toBe("Texto simples");
    });

    it("deve capitalizar após ponto final", () => {
      expect(normalizePtBrText("primeira frase. segunda frase")).toBe(
        "Primeira frase. Segunda frase"
      );
    });

    it("deve capitalizar após exclamação", () => {
      expect(normalizePtBrText("incrível! venha conferir")).toBe(
        "Incrível! Venha conferir"
      );
    });

    it("deve capitalizar após interrogação", () => {
      expect(normalizePtBrText("está pronto? então vamos")).toBe(
        "Está pronto? Então vamos"
      );
    });

    it("deve preservar capitalização existente em MAIÚSCULAS", () => {
      expect(normalizePtBrText("BENEFICIO")).toBe("BENEFÍCIO");
    });

    it("deve preservar capitalização CamelCase", () => {
      expect(normalizePtBrText("Beneficio")).toBe("Benefício");
    });
  });

  // ===========================================================================
  // PONTUAÇÃO E ESPAÇAMENTO
  // ===========================================================================
  describe("Pontuação e espaçamento", () => {
    it("deve remover espaço antes de pontuação", () => {
      expect(normalizePtBrText("texto .")).toBe("Texto.");
    });

    it("deve adicionar espaço após pontuação", () => {
      expect(normalizePtBrText("texto.outro")).toBe("Texto. Outro");
    });

    it("deve remover espaços múltiplos", () => {
      expect(normalizePtBrText("texto    com    espaços")).toBe(
        "Texto com espaços"
      );
    });

    it("deve corrigir espaço antes de parêntese fechando", () => {
      expect(normalizePtBrText("(texto )")).toBe("(texto)");
    });

    it("deve corrigir espaço após parêntese abrindo", () => {
      expect(normalizePtBrText("( texto)")).toBe("(texto)");
    });

    it("deve remover espaço antes de porcentagem", () => {
      expect(normalizePtBrText("10 %")).toBe("10%");
    });

    it("deve formatar R$ corretamente", () => {
      expect(normalizePtBrText("R$50")).toBe("R$ 50");
      expect(normalizePtBrText("R$  100")).toBe("R$ 100");
    });

    it("deve normalizar múltiplas quebras de linha", () => {
      expect(normalizePtBrText("linha1\n\n\n\nlinha2")).toBe("Linha1\n\nlinha2");
    });

    it("deve remover espaços no início/fim de linhas", () => {
      expect(normalizePtBrText("  linha1  \n  linha2  ")).toBe("Linha1\nlinha2");
    });
  });

  // ===========================================================================
  // CASOS ESPECIAIS E EDGE CASES
  // ===========================================================================
  describe("Casos especiais", () => {
    it("deve retornar string vazia para input vazio", () => {
      expect(normalizePtBrText("")).toBe("");
    });

    it("deve retornar string vazia para null/undefined", () => {
      expect(normalizePtBrText(null as unknown as string)).toBe("");
      expect(normalizePtBrText(undefined as unknown as string)).toBe("");
    });

    it("deve fazer trim do texto", () => {
      expect(normalizePtBrText("  texto  ")).toBe("Texto");
    });

    it("deve preservar números", () => {
      expect(normalizePtBrText("desconto de 10%")).toBe("Desconto de 10%");
    });

    it("deve preservar URLs", () => {
      expect(normalizePtBrText("acesse www.site.com")).toBe(
        "Acesse www.site.com"
      );
    });

    it("deve preservar emojis", () => {
      expect(normalizePtBrText("beneficio gratis 🎂")).toBe(
        "Benefício grátis 🎂"
      );
    });

    it("deve lidar com texto misto", () => {
      expect(
        normalizePtBrText("beneficio gratis no dia do aniversario")
      ).toBe("Benefício grátis no dia do aniversário");
    });
  });

  // ===========================================================================
  // FRASES COMPLETAS REAIS
  // ===========================================================================
  describe("Frases completas reais", () => {
    it("deve corrigir descrição de benefício típica", () => {
      expect(
        normalizePtBrText(
          "sobremesa gratis no dia do aniversario. valido de segunda a sexta"
        )
      ).toBe(
        "Sobremesa grátis no dia do aniversário. Válido de segunda a sexta"
      );
    });

    it("deve corrigir regras de utilização típicas", () => {
      expect(
        normalizePtBrText(
          "nao acumulativo com outras promocoes. consumacao minima de R$50. necessario apresentar rg ou cnh"
        )
      ).toBe(
        "Não acumulativo com outras promoções. Consumação mínima de R$ 50. Necessário apresentar RG ou CNH"
      );
    });

    it("deve corrigir horário de funcionamento", () => {
      expect(
        normalizePtBrText("segunda a sexta: 9h as 18h. sabado e domingo: 10h as 14h")
      ).toBe(
        "Segunda a sexta: 9h as 18h. Sábado e domingo: 10h as 14h"
      );
    });

    it("deve corrigir bio de estabelecimento", () => {
      expect(
        normalizePtBrText(
          "somos o melhor restaurante da cidade! venha conhecer nossas promocoes especiais"
        )
      ).toBe(
        "Somos o melhor restaurante da cidade! Venha conhecer nossas promoções especiais"
      );
    });
  });
});

// =============================================================================
// TESTES: normalizeWithDetails
// =============================================================================
describe("normalizeWithDetails", () => {
  it("deve retornar lista de correções aplicadas", () => {
    const result = normalizeWithDetails("beneficio gratis");
    
    expect(result.text).toBe("Benefício grátis");
    expect(result.wasNormalized).toBe(true);
    expect(result.corrections.length).toBeGreaterThan(0);
    
    const beneficioCorrection = result.corrections.find(
      (c) => c.original.toLowerCase() === "beneficio"
    );
    expect(beneficioCorrection).toBeDefined();
    expect(beneficioCorrection?.corrected).toBe("benefício");
  });

  it("deve retornar wasNormalized=false quando não há mudanças", () => {
    const result = normalizeWithDetails("Texto já correto");
    
    expect(result.text).toBe("Texto já correto");
    expect(result.wasNormalized).toBe(false);
    expect(result.corrections).toHaveLength(0);
  });

  it("deve identificar tipo de correção como 'dictionary'", () => {
    const result = normalizeWithDetails("aniversario");
    
    expect(result.corrections[0]?.type).toBe("dictionary");
  });

  it("deve evitar correções duplicadas", () => {
    const result = normalizeWithDetails("beneficio beneficio beneficio");
    
    const beneficioCorrections = result.corrections.filter(
      (c) => c.original.toLowerCase() === "beneficio"
    );
    expect(beneficioCorrections.length).toBe(1);
  });
});

// =============================================================================
// TESTES: hasChanges e getDiff
// =============================================================================
describe("hasChanges", () => {
  it("deve retornar true quando textos são diferentes", () => {
    expect(hasChanges("beneficio", "benefício")).toBe(true);
  });

  it("deve retornar false quando textos são iguais", () => {
    expect(hasChanges("texto", "texto")).toBe(false);
  });
});

describe("getDiff", () => {
  it("deve retornar objeto com original, normalized e changed", () => {
    const result = getDiff("beneficio", "benefício");
    
    expect(result.original).toBe("beneficio");
    expect(result.normalized).toBe("benefício");
    expect(result.changed).toBe(true);
  });
});
