import { Page, expect } from '@playwright/test';

/**
 * Helper: Login como aniversariante
 */
export async function loginAsAniversariante(page: Page, email: string, password: string) {
  await page.goto('/auth');
  await page.fill('input[name="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|explorar)/, { timeout: 10000 });
}

/**
 * Helper: Login como estabelecimento
 */
export async function loginAsEstabelecimento(page: Page, email: string, password: string) {
  await page.goto('/cadastro/estabelecimento');
  await page.fill('input[name="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/area-estabelecimento/, { timeout: 10000 });
}

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
  }
) {
  // Step 1
  await page.goto('/auth');
  await page.fill('input[name="nome"]', userData.nome);
  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="telefone"]', userData.telefone);
  await page.fill('input[type="password"]', userData.senha);
  await page.click('button[type="submit"]');
  
  // Step 2
  await page.waitForTimeout(2000);
  await page.fill('input[name="cpf"]', userData.cpf);
  await page.fill('input[name="data_nascimento"]', userData.dataNascimento);
  await page.fill('input[name="cep"]', userData.cep);
  await page.waitForTimeout(2000); // Aguardar auto-preenchimento
  await page.fill('input[name="numero"]', userData.numero);
  await page.click('button:has-text("Finalizar Cadastro")');
  
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

/**
 * Helper: Verificar se usuário está autenticado
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper: Limpar cookies e storage
 */
export async function clearAuth(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Helper: Esperar por elemento com retry
 */
export async function waitForElementWithRetry(
  page: Page,
  selector: string,
  maxRetries: number = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Helper: Verificar mensagem de toast
 */
export async function expectToast(page: Page, message: string | RegExp) {
  await expect(page.locator('[role="status"]').filter({ hasText: message })).toBeVisible({
    timeout: 5000,
  });
}

/**
 * Helper: Preencher formulário de endereço via CEP
 */
export async function fillAddressByCEP(page: Page, cep: string, numero: string) {
  await page.fill('input[name="cep"]', cep);
  await page.waitForTimeout(2000); // Aguardar API de CEP
  await page.fill('input[name="numero"]', numero);
}

/**
 * Helper: Selecionar cidade no autocomplete
 */
export async function selectCity(page: Page, cityName: string) {
  await page.fill('input[placeholder*="cidade"]', cityName);
  await page.waitForTimeout(500);
  await page.click(`text=${cityName}`);
  await page.waitForTimeout(1000);
}
