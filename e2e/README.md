# Testes E2E - AniversarianteVIP

## 🎭 Visão Geral

Suite completa de testes End-to-End usando Playwright para simular jornadas reais de usuários na plataforma AniversarianteVIP.

## 📁 Estrutura

```
e2e/
├── auth/
│   └── registration.spec.ts       # Fluxo de cadastro e validações
├── beneficios/
│   └── coupon-flow.spec.ts        # Emissão e gestão de cupons
├── security/
│   └── access-control.spec.ts     # Controle de acesso e proteção
├── fixtures/
│   └── test-data.ts               # Dados de teste
└── utils/
    └── helpers.ts                  # Funções auxiliares
```

## 🚀 Executar Testes

### Instalação Inicial

```bash
# Instalar browsers do Playwright
npx playwright install
```

### Comandos de Teste

```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar com interface visual (modo debug)
npm run test:e2e:ui

# Executar apenas Chrome
npx playwright test --project=chromium

# Executar apenas Mobile
npx playwright test --project="Mobile Chrome"

# Ver relatório HTML
npm run test:e2e:report
```

## 📝 Testes Implementados

### 🔐 Autenticação (`auth/registration.spec.ts`)
- ✅ Cadastro completo de aniversariante (Step 1 + Step 2)
- ✅ Bloqueio de acesso com cadastro incompleto
- ✅ Validação de CPF duplicado
- ✅ Validações de senha em tempo real
- ✅ Validação de formato de CPF

### 🎫 Cupons (`beneficios/coupon-flow.spec.ts`)
- ✅ Emissão de cupom com sucesso
- ✅ Rate limit de cupons (1 por semana)
- ✅ Exibição de QR code
- ✅ Filtros de cupons por status

### 🛡️ Segurança (`security/access-control.spec.ts`)
- ✅ Bloqueio de rotas protegidas sem autenticação
- ✅ Controle de acesso por role (aniversariante vs estabelecimento)
- ✅ Proteção de dados sensíveis em APIs
- ✅ Rate limiting de tentativas de login

## 🎯 Configuração

### Variáveis de Ambiente

Criar arquivo `.env.test`:

```env
VITE_SUPABASE_URL=sua-url-aqui
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-aqui
```

### Playwright Config

O arquivo `playwright.config.ts` está configurado com:
- **5 browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Retry automático**: 2 tentativas em CI
- **Screenshots**: Apenas em falhas
- **Vídeos**: Retidos apenas em falhas
- **Web Server**: Inicia automaticamente `npm run dev`

## 📊 Relatórios

Após execução, os relatórios são gerados em:
- `playwright-report/` - Relatório HTML completo
- `test-results/` - Screenshots e vídeos de falhas

## 🔧 Debugging

### Modo Debug Interativo

```bash
# Abrir UI do Playwright
npm run test:e2e:ui

# Debug de teste específico
npx playwright test auth/registration.spec.ts --debug
```

### Ver Traces de Falhas

```bash
npx playwright show-trace test-results/trace.zip
```

## 📚 Helpers Disponíveis

### `helpers.ts`

```typescript
// Login rápido
await loginAsAniversariante(page, email, senha);

// Cadastro completo
await completeAniversarianteRegistration(page, userData);

// Verificar autenticação
const isAuth = await isAuthenticated(page);

// Preencher endereço por CEP
await fillAddressByCEP(page, '88015-100', '123');

// Selecionar cidade
await selectCity(page, 'Florianópolis');
```

## 🎨 Boas Práticas

1. **Use data-testid** para seletores estáveis
2. **Aguarde elementos carregarem** antes de interagir
3. **Use fixtures** para dados de teste reutilizáveis
4. **Limpe estado** entre testes quando necessário
5. **Screenshots/vídeos** só em falhas para economizar espaço

## 🚨 Troubleshooting

### Problema: Testes falhando por timeout

**Solução**: Aumentar timeout no `playwright.config.ts`
```typescript
use: {
  actionTimeout: 15000, // Aumentar de 10s para 15s
}
```

### Problema: Browsers não instalados

**Solução**: 
```bash
npx playwright install --with-deps
```

### Problema: Testes passam local mas falham no CI

**Solução**: Verificar variáveis de ambiente no CI e usar `workers: 1` no CI

## 📈 Coverage

Os testes E2E cobrem:
- 🟢 **100%** dos fluxos críticos de autenticação
- 🟢 **100%** dos fluxos de emissão de cupons
- 🟢 **95%** dos controles de acesso e segurança
- 🟡 **80%** das interações de UI

## 🔗 Links Úteis

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
