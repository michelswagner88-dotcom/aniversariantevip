import { test, expect } from '@playwright/test';

test.describe('Controle de Acesso - Rotas Protegidas', () => {
  test('deve bloquear acesso não autenticado ao dashboard', async ({ page }) => {
    // Tentar acessar dashboard sem autenticação
    await page.goto('/dashboard');
    
    // Deve redirecionar para /auth
    await expect(page).toHaveURL(/\/auth/, { timeout: 5000 });
  });

  test('deve bloquear acesso não autenticado aos cupons', async ({ page }) => {
    await page.goto('/meus-cupons');
    
    // Deve redirecionar para /auth
    await expect(page).toHaveURL(/\/auth/);
  });

  test('deve bloquear acesso não autenticado aos favoritos', async ({ page }) => {
    await page.goto('/meus-favoritos');
    
    // Deve redirecionar para /auth
    await expect(page).toHaveURL(/\/auth/);
  });

  test('deve bloquear acesso não autenticado ao programa de afiliados', async ({ page }) => {
    await page.goto('/afiliado');
    
    // Deve redirecionar para /auth
    await expect(page).toHaveURL(/\/auth/);
  });
});

test.describe('Controle de Acesso - Roles', () => {
  test('estabelecimento não deve acessar área de aniversariante', async ({ page, context }) => {
    // Simular login como estabelecimento
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'fake-establishment-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    // Tentar acessar dashboard de aniversariante
    await page.goto('/dashboard');
    
    // Deve bloquear ou redirecionar
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test('aniversariante não deve acessar área de estabelecimento', async ({ page, context }) => {
    // Simular login como aniversariante
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'fake-aniversariante-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    // Tentar acessar área de estabelecimento
    await page.goto('/area-estabelecimento');
    
    // Deve bloquear ou redirecionar
    await expect(page).not.toHaveURL(/\/area-estabelecimento/);
  });

  test('não-admin não deve acessar admin dashboard', async ({ page, context }) => {
    // Simular login como usuário comum
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'fake-user-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    // Tentar acessar admin
    await page.goto('/admin/dashboard');
    
    // Deve bloquear
    await expect(page).not.toHaveURL(/\/admin/);
  });
});

test.describe('Proteção de Dados Sensíveis', () => {
  test('não deve expor dados sensíveis em respostas de API', async ({ page }) => {
    // Interceptar requisição de perfil
    const response = await page.waitForResponse(
      (response) => response.url().includes('/rest/v1/profiles') && response.status() === 200
    );
    
    const data = await response.json();
    
    // Verificar que campos sensíveis não estão expostos
    if (Array.isArray(data)) {
      data.forEach((profile: any) => {
        expect(profile).not.toHaveProperty('password');
        expect(profile).not.toHaveProperty('stripe_customer_id');
      });
    }
  });

  test('não deve permitir acesso a estabelecimentos de outros usuários', async ({ page, context }) => {
    // Simular login como estabelecimento 1
    await context.addCookies([
      {
        name: 'sb-establishment-id',
        value: 'establishment-1',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    // Tentar acessar dados de estabelecimento 2 via API manipulation
    await page.goto('/area-estabelecimento');
    
    // Interceptar e verificar que apenas dados do próprio estabelecimento são retornados
    const response = await page.waitForResponse(
      (response) => response.url().includes('/rest/v1/estabelecimentos')
    );
    
    const data = await response.json();
    
    // Verificar que retorna apenas 1 estabelecimento (o próprio)
    if (Array.isArray(data)) {
      expect(data.length).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('Rate Limiting', () => {
  test('deve bloquear tentativas excessivas de login', async ({ page }) => {
    await page.goto('/auth');
    
    // Fazer 6 tentativas de login falhas
    for (let i = 0; i < 6; i++) {
      await page.fill('input[name="email"]', 'teste@example.com');
      await page.fill('input[type="password"]', 'senhaerrada');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }
    
    // Verificar mensagem de rate limit
    await expect(page.locator('text=/muitas tentativas/i')).toBeVisible({ timeout: 5000 });
  });
});
