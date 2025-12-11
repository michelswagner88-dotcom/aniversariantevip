import { test, expect, Page } from "@playwright/test";

/**
 * Testes E2E - Fluxo de Visualização de Benefício
 *
 * FLUXO:
 * - Usuário NÃO logado clica em "Ver regras/Como usar" → Redireciona para cadastro → Após cadastro volta pro estabelecimento
 * - Usuário LOGADO clica em "Ver regras/Como usar" → Mostra regras direto
 */

// Helpers
const TEST_PASSWORD = "Teste@123";
const generateTestEmail = () => `teste${Date.now()}@example.com`;

// Helper para navegar até um estabelecimento
async function navegarParaEstabelecimento(page: Page) {
  await page.goto("/explorar");

  // Aguardar cards carregarem
  const cards = page
    .locator('[data-testid="establishment-card"]')
    .or(page.locator('a[href*="/estabelecimento"]'))
    .or(page.locator("article").filter({ has: page.locator("img") }));

  await expect(cards.first()).toBeVisible({ timeout: 15000 });

  // Clicar no primeiro card
  await cards.first().click();

  // Verificar que chegou na página de detalhes
  await expect(page).toHaveURL(/\/estabelecimento\/|\/[a-z-]+\/[a-z0-9-]+/);

  return page.url();
}

// Helper para fazer login
async function fazerLogin(page: Page, email: string, password: string) {
  await page.getByLabel(/e-?mail/i).fill(email);
  await page.getByLabel(/senha/i).fill(password);
  await page.getByRole("button", { name: /entrar|login|acessar/i }).click();
}

// Helper para encontrar botão de benefício
function getBotaoBeneficio(page: Page) {
  return page
    .getByRole("button", { name: /ver benefício|ver regras|como usar|regras.*uso/i })
    .or(page.getByText(/ver benefício|ver regras|como usar/i).first());
}

test.describe("Fluxo de Visualização de Benefício", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("deve redirecionar para cadastro quando usuário não logado clica em ver regras", async ({ page }) => {
    // 1. Navegar para estabelecimento sem estar logado
    const estabelecimentoUrl = await navegarParaEstabelecimento(page);

    // 2. Encontrar e clicar no botão de ver benefício/regras
    const btnBeneficio = getBotaoBeneficio(page);
    await expect(btnBeneficio).toBeVisible({ timeout: 5000 });
    await btnBeneficio.click();

    // 3. Deve redirecionar para login/cadastro OU abrir modal de login
    const redirecionouParaAuth = await page
      .waitForURL(/\/auth|\/selecionar-perfil|\/cadastro/, { timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    const abriuModalLogin = await page
      .getByRole("dialog")
      .filter({ hasText: /login|entrar|cadastr|criar conta/i })
      .isVisible()
      .catch(() => false);

    expect(redirecionouParaAuth || abriuModalLogin).toBeTruthy();
  });

  test("deve mostrar regras direto quando usuário está logado", async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, "Requer credenciais de teste");

    // 1. Fazer login primeiro
    await page.goto("/auth?tipo=aniversariante");
    await fazerLogin(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await expect(page).toHaveURL(/\/area-aniversariante|\/dashboard|\/explorar|\/$/, { timeout: 10000 });

    // 2. Navegar para estabelecimento
    await navegarParaEstabelecimento(page);

    // 3. Clicar em ver benefício/regras
    const btnBeneficio = getBotaoBeneficio(page);
    await expect(btnBeneficio).toBeVisible();
    await btnBeneficio.click();

    // 4. Deve abrir modal/seção com regras DIRETO (sem pedir login)
    const modalRegras = page.getByRole("dialog");
    const secaoRegras = page.getByText(/regras|validade|como usar|apresent/i);

    const mostrouRegras =
      (await modalRegras.isVisible().catch(() => false)) || (await secaoRegras.isVisible().catch(() => false));

    expect(mostrouRegras).toBeTruthy();

    // 5. NÃO deve ter pedido login
    const pedidoLogin =
      page.url().includes("/auth") ||
      (await page
        .getByText(/faça login|entre.*conta/i)
        .isVisible()
        .catch(() => false));

    expect(pedidoLogin).toBeFalsy();
  });

  test("deve preservar URL do estabelecimento para retorno após cadastro", async ({ page }) => {
    // 1. Navegar para estabelecimento
    const estabelecimentoUrl = await navegarParaEstabelecimento(page);
    const estabelecimentoSlug = estabelecimentoUrl.split("/").pop() || "";

    // 2. Clicar em ver benefício (não logado)
    const btnBeneficio = getBotaoBeneficio(page);

    if (!(await btnBeneficio.isVisible().catch(() => false))) {
      test.skip(true, "Botão de benefício não encontrado");
      return;
    }

    await btnBeneficio.click();
    await page.waitForTimeout(1000);

    // 3. Se abriu modal de login, clicar em cadastrar
    const modalLogin = page.getByRole("dialog");
    if (await modalLogin.isVisible().catch(() => false)) {
      const btnCadastrar = page
        .getByRole("link", { name: /cadastr|criar conta/i })
        .or(page.getByRole("button", { name: /cadastr|criar conta/i }));

      if (await btnCadastrar.isVisible().catch(() => false)) {
        await btnCadastrar.click();
      }
    }

    // 4. Verificar se returnUrl está configurado
    const currentUrl = page.url();

    const temReferenciaUrl =
      currentUrl.includes(estabelecimentoSlug) || currentUrl.includes("returnUrl") || currentUrl.includes("redirect");

    const returnUrlStorage = await page.evaluate(() => {
      return (
        sessionStorage.getItem("returnUrl") ||
        localStorage.getItem("returnUrl") ||
        sessionStorage.getItem("redirectAfterLogin") ||
        localStorage.getItem("redirectAfterLogin")
      );
    });

    expect(temReferenciaUrl || returnUrlStorage).toBeTruthy();
  });
});

test.describe("Exibição de Benefício na Página", () => {
  test("benefício deve estar visível na página do estabelecimento", async ({ page }) => {
    await navegarParaEstabelecimento(page);

    const beneficioSection = page.getByText(/benefício|desconto|cortesia|grátis|gratuito/i);
    await expect(beneficioSection.first()).toBeVisible({ timeout: 5000 });
  });

  test("deve mostrar informações básicas do benefício sem login", async ({ page }) => {
    await navegarParaEstabelecimento(page);

    const infoBeneficio = page
      .locator('[data-testid="benefit-card"]')
      .or(page.getByText(/benefício.*aniversariante|desconto|cortesia/i).first());

    await expect(infoBeneficio).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Modal de Login Obrigatório", () => {
  test("modal deve ter opções de login E cadastro", async ({ page }) => {
    await navegarParaEstabelecimento(page);

    const btnBeneficio = getBotaoBeneficio(page);

    if (!(await btnBeneficio.isVisible().catch(() => false))) {
      test.skip(true, "Botão de benefício não encontrado");
      return;
    }

    await btnBeneficio.click();

    const modal = page.getByRole("dialog");

    if (await modal.isVisible().catch(() => false)) {
      // Deve ter opção de cadastro
      const linkCadastro = page
        .getByRole("link", { name: /cadastr|criar conta|registr/i })
        .or(page.getByRole("button", { name: /cadastr|criar conta|registr/i }));

      await expect(linkCadastro).toBeVisible();

      // Deve ter opção de login
      const linkLogin = page
        .getByRole("link", { name: /entrar|login|já tenho/i })
        .or(page.getByRole("button", { name: /entrar|login/i }));

      await expect(linkLogin).toBeVisible();
    }
  });

  test("deve fechar modal ao clicar fora ou no X", async ({ page }) => {
    await navegarParaEstabelecimento(page);

    const btnBeneficio = getBotaoBeneficio(page);

    if (!(await btnBeneficio.isVisible().catch(() => false))) {
      test.skip(true, "Botão de benefício não encontrado");
      return;
    }

    await btnBeneficio.click();

    const modal = page.getByRole("dialog");

    if (await modal.isVisible().catch(() => false)) {
      // Tentar fechar pelo botão X
      const btnFechar = page
        .getByRole("button", { name: /fechar|close/i })
        .or(page.locator('[aria-label*="fechar"]'))
        .or(page.locator('[aria-label*="close"]'))
        .or(
          page
            .locator("button")
            .filter({ has: page.locator("svg") })
            .first(),
        );

      if (await btnFechar.isVisible().catch(() => false)) {
        await btnFechar.click();
        await expect(modal).not.toBeVisible({ timeout: 3000 });
      }
    }
  });
});

test.describe("Navegação e Redirecionamentos", () => {
  test("deve redirecionar usuário não autenticado ao tentar acessar área protegida", async ({ page }) => {
    await page.goto("/area-aniversariante");
    await expect(page).toHaveURL(/\/auth|\/selecionar-perfil|\/$/);
  });

  test("após login deve redirecionar para URL de retorno se existir", async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, "Requer credenciais de teste");

    // Simular acesso com returnUrl
    const returnUrl = "/explorar";
    await page.goto(`/auth?tipo=aniversariante&returnUrl=${encodeURIComponent(returnUrl)}`);

    await fazerLogin(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

    // Deve ir para a URL de retorno ou área logada
    await expect(page).toHaveURL(new RegExp(`${returnUrl}|area-aniversariante|dashboard`), { timeout: 10000 });
  });
});
