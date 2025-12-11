import { Page, expect } from "@playwright/test";

/**
 * Helpers para testes E2E
 *
 * Boas práticas:
 * - Usar getByRole, getByLabel, getByText ao invés de seletores CSS
 * - Evitar waitForTimeout - usar expects ou waitForLoadState
 * - Seletores flexíveis com regex para diferentes textos
 */

// ===== AUTENTICAÇÃO =====

/**
 * Helper: Login como aniversariante
 */
export async function loginAsAniversariante(page: Page, email: string, password: string) {
  await page.goto("/auth?modo=login");

  // Aguardar formulário carregar
  await expect(page.getByLabel(/e-?mail/i)).toBeVisible({ timeout: 10000 });

  // Preencher credenciais
  await page.getByLabel(/e-?mail/i).fill(email);
  await page.getByLabel(/senha/i).fill(password);

  // Clicar em entrar
  await page.getByRole("button", { name: /entrar|login|acessar/i }).click();

  // Aguardar redirecionamento para área logada
  await expect(page).toHaveURL(/\/area-aniversariante|\/explorar|\/dashboard|\/$/, { timeout: 15000 });
}

/**
 * Helper: Login como estabelecimento
 */
export async function loginAsEstabelecimento(page: Page, email: string, password: string) {
  await page.goto("/login/estabelecimento");

  // Aguardar formulário carregar
  await expect(page.getByLabel(/e-?mail/i)).toBeVisible({ timeout: 10000 });

  // Preencher credenciais
  await page.getByLabel(/e-?mail/i).fill(email);
  await page.getByLabel(/senha/i).fill(password);

  // Clicar em entrar
  await page.getByRole("button", { name: /entrar|login|acessar/i }).click();

  // Aguardar redirecionamento
  await expect(page).toHaveURL(/\/area-estabelecimento|\/estabelecimento\/dashboard/, { timeout: 15000 });
}

/**
 * Helper: Verificar se usuário está autenticado
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.goto("/area-aniversariante");
    // Se não redirecionar para auth em 3s, está logado
    await page.waitForURL(/\/area-aniversariante/, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper: Limpar cookies, storage e estado de autenticação
 */
export async function clearAuth(page: Page) {
  await page.context().clearCookies();
  await page.context().clearPermissions();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

// ===== CADASTRO =====

/**
 * Helper: Cadastro completo de aniversariante
 */
export async function completeAniversarianteRegistration(
  page: Page,
  userData: {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    cpf: string;
    dataNascimento: string;
    cep: string;
    numero: string;
  },
) {
  await page.goto("/auth?modo=cadastro");

  // Step 1 - Dados básicos
  await expect(page.getByLabel(/e-?mail/i)).toBeVisible({ timeout: 10000 });

  await page.getByLabel(/e-?mail/i).fill(userData.email);
  await page.getByLabel(/senha/i).fill(userData.senha);

  // Avançar para Step 2
  await page.getByRole("button", { name: /continuar|próximo|criar|avançar/i }).click();

  // Step 2 - Dados completos
  await expect(page.getByLabel(/cpf/i)).toBeVisible({ timeout: 10000 });

  await page.getByLabel(/nome/i).fill(userData.nome);
  await page.getByLabel(/telefone|celular/i).fill(userData.telefone);
  await page.getByLabel(/cpf/i).fill(userData.cpf);
  await page.getByLabel(/data.*nascimento|nascimento/i).fill(userData.dataNascimento);

  // Preencher CEP e aguardar autocomplete
  await page.getByLabel(/cep/i).fill(userData.cep);

  // Aguardar cidade ser preenchida (indica que CEP foi processado)
  await expect(page.getByLabel(/cidade/i)).not.toHaveValue("", { timeout: 8000 });

  // Preencher número
  await page.getByLabel(/número/i).fill(userData.numero);

  // Finalizar cadastro
  await page.getByRole("button", { name: /finalizar|completar|cadastrar|concluir/i }).click();

  // Aguardar redirecionamento
  await expect(page).toHaveURL(/\/area-aniversariante|\/explorar|\/dashboard|\/$/, { timeout: 15000 });
}

// ===== FORMULÁRIOS =====

/**
 * Helper: Preencher formulário de endereço via CEP
 */
export async function fillAddressByCEP(page: Page, cep: string, numero: string) {
  await page.getByLabel(/cep/i).fill(cep);

  // Aguardar cidade ser preenchida (indica sucesso da API de CEP)
  await expect(page.getByLabel(/cidade/i)).not.toHaveValue("", { timeout: 8000 });

  // Preencher número
  await page.getByLabel(/número/i).fill(numero);
}

/**
 * Helper: Selecionar cidade no autocomplete
 */
export async function selectCity(page: Page, cityName: string) {
  // Encontrar campo de cidade/busca
  const cidadeInput = page.getByPlaceholder(/cidade|onde|busca/i).or(page.getByLabel(/cidade/i));

  await cidadeInput.fill(cityName);

  // Aguardar e clicar na opção do dropdown
  const opcao = page
    .getByRole("option", { name: new RegExp(cityName, "i") })
    .or(page.getByText(new RegExp(`${cityName}.*SC|${cityName}.*SP|${cityName}`, "i")));

  await expect(opcao.first()).toBeVisible({ timeout: 5000 });
  await opcao.first().click();
}

// ===== TOASTS E NOTIFICAÇÕES =====

/**
 * Helper: Verificar mensagem de toast/notificação
 */
export async function expectToast(page: Page, message: string | RegExp) {
  // Sonner usa role="status", outros podem usar alert ou region
  const toast = page.locator('[role="status"], [role="alert"], [data-sonner-toast]').filter({ hasText: message });

  await expect(toast.first()).toBeVisible({ timeout: 5000 });
}

/**
 * Helper: Aguardar toast desaparecer
 */
export async function waitForToastDismiss(page: Page) {
  const toast = page.locator('[role="status"], [role="alert"], [data-sonner-toast]');

  // Se visível, aguardar desaparecer
  if (await toast.isVisible().catch(() => false)) {
    await expect(toast).not.toBeVisible({ timeout: 10000 });
  }
}

// ===== NAVEGAÇÃO =====

/**
 * Helper: Navegar para estabelecimento
 */
export async function navigateToEstablishment(page: Page) {
  await page.goto("/explorar");

  // Aguardar cards carregarem
  const cards = page
    .locator('[data-testid="establishment-card"]')
    .or(page.locator('a[href*="/estabelecimento"]'))
    .or(page.locator("article").filter({ has: page.locator("img") }));

  await expect(cards.first()).toBeVisible({ timeout: 15000 });

  // Clicar no primeiro
  await cards.first().click();

  // Aguardar página de detalhes
  await expect(page).toHaveURL(/\/estabelecimento\/|\/[a-z-]+\/[a-z0-9-]+/);

  return page.url();
}

// ===== ELEMENTOS =====

/**
 * Helper: Esperar por elemento com retry (usando expects, não timeout)
 */
export async function waitForElementWithRetry(page: Page, selector: string, maxRetries: number = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const element = page.locator(selector);
      await expect(element).toBeVisible({ timeout: 5000 });
      return element;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Recarregar página e tentar novamente
      await page.reload();
      await page.waitForLoadState("networkidle");
    }
  }
}

/**
 * Helper: Verificar se elemento existe (sem falhar)
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  return page
    .locator(selector)
    .isVisible()
    .catch(() => false);
}

// ===== MODAIS =====

/**
 * Helper: Fechar modal (se aberto)
 */
export async function closeModal(page: Page) {
  const modal = page.getByRole("dialog");

  if (await modal.isVisible().catch(() => false)) {
    // Tentar botão de fechar
    const closeBtn = page
      .getByRole("button", { name: /fechar|close|cancelar/i })
      .or(page.locator('[aria-label*="fechar"], [aria-label*="close"]'))
      .or(modal.locator("button").first());

    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    } else {
      // Clicar fora do modal (backdrop)
      await page
        .locator(".fixed.inset-0")
        .first()
        .click({ position: { x: 10, y: 10 } });
    }

    await expect(modal).not.toBeVisible({ timeout: 3000 });
  }
}

/**
 * Helper: Verificar modal aberto
 */
export async function expectModalOpen(page: Page, title?: string | RegExp) {
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible({ timeout: 5000 });

  if (title) {
    await expect(modal.getByRole("heading").or(modal.locator("h2, h3"))).toContainText(title);
  }
}

// ===== UTILITÁRIOS =====

/**
 * Helper: Aguardar carregamento completo da página
 */
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForLoadState("domcontentloaded");
}

/**
 * Helper: Scroll até elemento
 */
export async function scrollToElement(page: Page, selector: string) {
  const element = page.locator(selector);
  await element.scrollIntoViewIfNeeded();
}

/**
 * Helper: Gerar dados únicos para teste
 */
export function generateTestData() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  return {
    email: `teste-${timestamp}-${random}@example.com`,
    nome: `Usuário Teste ${timestamp}`,
  };
}
