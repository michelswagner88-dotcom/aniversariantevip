import { test, expect } from '@playwright/test';

test.describe('Fluxo de Emissão de Cupons', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de autenticação (ajustar conforme necessário)
    await page.goto('/auth');
    // Realizar login aqui
  });

  test('deve emitir cupom com sucesso', async ({ page }) => {
    // 1. Navegar para explorar
    await page.goto('/explorar');
    
    // 2. Selecionar cidade
    await page.fill('input[placeholder*="cidade"]', 'Florianópolis');
    await page.click('text=Florianópolis, SC');
    
    // 3. Aguardar carregamento de estabelecimentos
    await page.waitForSelector('[data-testid="establishment-card"]', { timeout: 10000 });
    
    // 4. Clicar no primeiro estabelecimento
    await page.click('[data-testid="establishment-card"]:first-child');
    
    // 5. Verificar página de detalhes
    await expect(page).toHaveURL(/\/estabelecimento\//);
    await expect(page.locator('h1')).toBeVisible();
    
    // 6. Clicar em "Ver Benefício de Aniversário"
    await page.click('button:has-text("Ver Benefício")');
    
    // 7. Verificar modal de benefício
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 8. Clicar em "Emitir Cupom"
    await page.click('button:has-text("Emitir Cupom")');
    
    // 9. Aguardar geração do cupom
    await page.waitForTimeout(2000);
    
    // 10. Verificar cupom gerado com código
    await expect(page.locator('text=/VIP-[A-Z0-9]{8}/')).toBeVisible();
    
    // 11. Navegar para meus cupons
    await page.goto('/meus-cupons');
    
    // 12. Verificar cupom aparece na listagem
    await expect(page.locator('text=/VIP-[A-Z0-9]{8}/')).toBeVisible();
  });

  test('deve respeitar rate limit de cupons', async ({ page }) => {
    await page.goto('/explorar');
    
    // Selecionar estabelecimento
    await page.fill('input[placeholder*="cidade"]', 'Florianópolis');
    await page.click('text=Florianópolis, SC');
    await page.waitForSelector('[data-testid="establishment-card"]');
    await page.click('[data-testid="establishment-card"]:first-child');
    
    // Emitir primeiro cupom
    await page.click('button:has-text("Ver Benefício")');
    await page.click('button:has-text("Emitir Cupom")');
    await page.waitForTimeout(2000);
    
    // Fechar modal
    await page.click('[data-testid="close-modal"]');
    
    // Tentar emitir novamente na mesma semana
    await page.click('button:has-text("Ver Benefício")');
    await page.click('button:has-text("Emitir Cupom")');
    
    // Verificar mensagem de rate limit
    await expect(page.locator('text=/já emitiu um cupom/i')).toBeVisible({ timeout: 5000 });
  });

  test('deve exibir QR code do cupom', async ({ page }) => {
    await page.goto('/meus-cupons');
    
    // Clicar no primeiro cupom
    await page.click('[data-testid="coupon-card"]:first-child');
    
    // Verificar modal com QR code
    await expect(page.locator('canvas')).toBeVisible(); // QR code canvas
    await expect(page.locator('text=/VIP-[A-Z0-9]{8}/')).toBeVisible();
    
    // Verificar informações do estabelecimento
    await expect(page.locator('[data-testid="establishment-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="benefit-description"]')).toBeVisible();
  });
});

test.describe('Listagem de Cupons', () => {
  test('deve filtrar cupons por status', async ({ page }) => {
    await page.goto('/meus-cupons');
    
    // Aguardar carregamento
    await page.waitForSelector('[data-testid="coupon-card"]', { timeout: 10000 });
    
    // Contar todos os cupons
    const allCoupons = await page.locator('[data-testid="coupon-card"]').count();
    
    // Filtrar por "Ativos"
    await page.click('button:has-text("Ativos")');
    await page.waitForTimeout(500);
    
    const activeCoupons = await page.locator('[data-testid="coupon-card"]').count();
    
    // Filtrar por "Usados"
    await page.click('button:has-text("Usados")');
    await page.waitForTimeout(500);
    
    const usedCoupons = await page.locator('[data-testid="coupon-card"]').count();
    
    // Validar que filtros funcionam
    expect(allCoupons).toBeGreaterThanOrEqual(activeCoupons + usedCoupons);
  });
});
