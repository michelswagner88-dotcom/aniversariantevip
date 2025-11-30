import { test, expect } from '@playwright/test';

test.describe('Fluxo de Cadastro de Aniversariante', () => {
  test('deve completar cadastro com sucesso', async ({ page }) => {
    // 1. Acessar página inicial
    await page.goto('/');
    
    // 2. Clicar em "Entrar" para ir para autenticação
    await page.click('text=Entrar');
    await expect(page).toHaveURL(/\/auth/);
    
    // 3. Preencher Step 1 - Dados básicos
    const testEmail = `teste${Date.now()}@example.com`;
    const testPassword = 'Teste@123';
    
    await page.fill('input[name="nome"]', 'Teste E2E Usuario');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="telefone"]', '(48) 99999-9999');
    await page.fill('input[type="password"]', testPassword);
    
    // 4. Verificar validações em tempo real (senha)
    await expect(page.locator('text=Mínimo 8 caracteres')).toBeVisible();
    await expect(page.locator('text=Letra maiúscula')).toBeVisible();
    await expect(page.locator('text=Caractere especial')).toBeVisible();
    
    // 5. Submeter Step 1
    await page.click('button[type="submit"]');
    
    // 6. Aguardar redirecionamento para Step 2
    await page.waitForURL(/\/auth/, { timeout: 10000 });
    
    // 7. Preencher Step 2 - CPF e Endereço
    await page.fill('input[name="cpf"]', '123.456.789-09');
    await page.fill('input[name="data_nascimento"]', '01/01/1990');
    await page.fill('input[name="cep"]', '88000-000');
    
    // 8. Aguardar auto-preenchimento via CEP
    await page.waitForTimeout(2000);
    
    // 9. Preencher número do endereço
    await page.fill('input[name="numero"]', '123');
    
    // 10. Submeter Step 2
    await page.click('button:has-text("Finalizar Cadastro")');
    
    // 11. Verificar redirecionamento para dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    
    // 12. Verificar que bottom nav aparece
    await expect(page.locator('nav[aria-label="Bottom Navigation"]')).toBeVisible();
  });

  test('deve bloquear acesso com cadastro incompleto', async ({ page, context }) => {
    // Simular usuário com sessão mas sem cadastro completo
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'fake-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    // Tentar acessar área protegida
    await page.goto('/dashboard');
    
    // Deve redirecionar para /auth
    await expect(page).toHaveURL(/\/auth/, { timeout: 5000 });
  });

  test('deve validar CPF duplicado', async ({ page }) => {
    await page.goto('/auth');
    
    // Preencher formulário Step 1
    await page.fill('input[name="nome"]', 'Teste Duplicado');
    await page.fill('input[name="email"]', `teste${Date.now()}@example.com`);
    await page.fill('input[name="telefone"]', '(48) 98888-8888');
    await page.fill('input[type="password"]', 'Teste@123');
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/auth/);
    
    // Tentar usar CPF que já existe (se houver no banco)
    await page.fill('input[name="cpf"]', '111.111.111-11');
    await page.fill('input[name="data_nascimento"]', '01/01/1990');
    
    // Verificar se mensagem de erro aparece
    await page.click('button:has-text("Finalizar Cadastro")');
    
    // Aguardar mensagem de erro
    await expect(page.locator('text=/Este CPF já está cadastrado/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Validações de Formulário', () => {
  test('deve mostrar erros de validação de senha', async ({ page }) => {
    await page.goto('/auth');
    
    // Senha muito curta
    await page.fill('input[type="password"]', '123');
    await page.blur('input[type="password"]');
    
    // Verificar indicadores
    const weakIndicators = page.locator('[data-testid="password-requirement"]:not(.text-green-600)');
    await expect(weakIndicators).toHaveCount(3);
  });

  test('deve validar formato de CPF', async ({ page }) => {
    await page.goto('/auth');
    
    // Avançar para Step 2 (assumindo que já está autenticado)
    // Preencher CPF inválido
    await page.fill('input[name="cpf"]', '000.000.000-00');
    await page.blur('input[name="cpf"]');
    
    // Verificar mensagem de erro
    await expect(page.locator('text=/CPF inválido/i')).toBeVisible();
  });
});
