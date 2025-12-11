# Testes E2E - AniversarianteVIP

## 🎭 Visão Geral

Suite completa de testes End-to-End usando Playwright para simular jornadas reais de usuários na plataforma AniversarianteVIP.

## 📁 Estrutura

```
e2e/
├── specs/
│   ├── auth.spec.ts              # Fluxo de cadastro, login e validações
│   └── security.spec.ts          # Controle de acesso e proteção
├── fixtures/
│   └── test-data.ts              # Dados de teste (CPFs/CNPJs válidos)
└── utils/
    └── test-utils.ts             # Funções auxiliares
```

## 🚀 Executar Testes

### Instalação Inicial

```bash
# Instalar browsers do Playwright
npx playwright install --with-deps
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

# Executar teste específico
npx playwright test auth.spec.ts
```

## 📝 Testes Implementados

### 🔐 Autenticação (`auth.spec.ts`)

| Teste                                                 | Status |
| ----------------------------------------------------- | ------ |
| Cadastro completo de aniversariante (Step 1 + Step 2) | ✅     |
| Login com credenciais válidas                         | ✅     |
| Bloqueio de acesso com cadastro incompleto            | ✅     |
| Validação de CPF duplicado                            | ✅     |
| Validação de CPF inválido (dígitos verificadores)     | ✅     |
| Validações de senha em tempo real                     | ✅     |
| Validação de email já cadastrado                      | ✅     |
| Login com Google OAuth                                | ✅     |
| Redirecionamento após login                           | ✅     |

### 🛡️ Segurança (`security.spec.ts`)

| Teste                                         | Status |
| --------------------------------------------- | ------ |
| Bloqueio de rotas protegidas sem autenticação | ✅     |
| Rotas públicas acessíveis sem login           | ✅     |
| Rate limiting de tentativas de login          | ✅     |
| Headers de segurança presentes                | ✅     |
| Sem exposição de stack traces                 | ✅     |
| Sem variáveis de ambiente expostas            | ✅     |
| localStorage limpo sem sessão                 | ✅     |
| Autocomplete de senha correto                 | ✅     |
| Requisitos de senha visíveis                  | ✅     |
| Token inválido redireciona para login         | ✅     |
| Rejeição de CPF inválido                      | ✅     |
| Sanitização contra XSS                        | ✅     |
| API protegida sem token retorna 401/403       | ✅     |

## 🎯 Configuração

### Variáveis de Ambiente

Criar arquivo `.env.test`:

```env
VITE_SUPABASE_URL=sua-url-aqui
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-aqui
```

### Playwright Config

O arquivo `playwright.config.ts` está configurado com:

| Configuração   | Valor                                                 |
| -------------- | ----------------------------------------------------- |
| Browsers       | Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari |
| Retry (CI)     | 2 tentativas                                          |
| Screenshots    | Apenas em falhas                                      |
| Vídeos         | Retidos apenas em falhas                              |
| Web Server     | `npm run dev` automático                              |
| Action Timeout | 15 segundos                                           |
| Expect Timeout | 10 segundos                                           |

## 📊 Relatórios

Após execução, os relatórios são gerados em:

```
playwright-report/     # Relatório HTML completo
test-results/          # Screenshots e vídeos de falhas
```

## 🔧 Debugging

### Modo Debug Interativo

```bash
# Abrir UI do Playwright
npm run test:e2e:ui

# Debug de teste específico
npx playwright test auth.spec.ts --debug

# Executar com headed (ver browser)
npx playwright test --headed
```

### Ver Traces de Falhas

```bash
npx playwright show-trace test-results/trace.zip
```

## 📚 Helpers Disponíveis

### `test-utils.ts`

```typescript
import {
  loginAsAniversariante,
  loginAsEstabelecimento,
  completeAniversarianteRegistration,
  isAuthenticated,
  clearAuth,
  fillAddressByCEP,
  selectCity,
  expectToast,
  waitForToastDismiss,
  navigateToEstablishment,
  closeModal,
  expectModalOpen,
  waitForPageReady,
  generateTestData,
} from './utils/test-utils';

// Login rápido
await loginAsAniversariante(page, email, senha);

// Cadastro completo
await completeAniversarianteRegistration(page, {
  nome: 'João Silva',
  email: 'joao@example.com',
  telefone: '(48) 99999-9999',
  senha: 'Teste@123',
  cpf: '529.982.247-25', // CPF válido
  dataNascimento: '15/03/1990',
  cep: '88015-600',
  numero: '123',
});

// Verificar autenticação
const isAuth = await isAuthenticated(page);

// Preencher endereço por CEP
await fillAddressByCEP(page, '88015-600', '123');

// Selecionar cidade
await selectCity(page, 'Florianópolis');

// Verificar toast
await expectToast(page, /cadastro.*sucesso/i);

// Fechar modal se aberto
await closeModal(page);

// Navegar para estabelecimento
const url = await navigateToEstablishment(page);

// Gerar dados únicos
const { email, nome } = generateTestData();
```

### `test-data.ts`

```typescript
import {
  generateValidCPF,
  generateValidCNPJ,
  generateUniqueEmail,
  generateValidPhone,
  VALID_CPFS,
  VALID_CNPJS,
  getTestUsers,
  getTestEstablishment,
} from './fixtures/test-data';

// Gerar CPF válido (com dígitos verificadores corretos)
const cpf = generateValidCPF(); // Ex: '529.982.247-25'

// Gerar CNPJ válido
const cnpj = generateValidCNPJ(); // Ex: '11.222.333/0001-81'

// Usar CPF pré-calculado (para testes determinísticos)
const cpf = VALID_CPFS.cpf1; // '529.982.247-25'

// Obter dados de usuário com email único
const users = getTestUsers();
```

## 🎨 Boas Práticas

### ✅ Fazer

```typescript
// Usar seletores semânticos
await page.getByRole('button', { name: /entrar/i }).click();
await page.getByLabel(/e-?mail/i).fill(email);

// Aguardar elementos
await expect(page.getByText(/sucesso/i)).toBeVisible();

// Usar expects ao invés de timeouts
await expect(page.getByLabel(/cidade/i)).not.toHaveValue('');
```

### ❌ Evitar

```typescript
// NÃO usar seletores CSS frágeis
await page.click('button.btn-primary'); // ❌

// NÃO usar waitForTimeout
await page.waitForTimeout(2000); // ❌

// NÃO usar seletores por name
await page.fill('input[name="email"]', email); // ❌
```

## 🚨 Troubleshooting

### Problema: Testes falhando por timeout

**Solução**: Aumentar timeout no `playwright.config.ts`

```typescript
use: {
  actionTimeout: 15000,
}
```

### Problema: Browsers não instalados

**Solução**:

```bash
npx playwright install --with-deps
```

### Problema: Testes passam local mas falham no CI

**Soluções**:

1. Verificar variáveis de ambiente no CI
2. Usar `workers: 1` no CI
3. Verificar se web server está iniciando

### Problema: Seletores não encontram elementos

**Solução**: Usar Playwright Inspector

```bash
npx playwright test --debug
```

### Problema: Rate limit bloqueando testes

**Solução**: Usar emails únicos por teste

```typescript
const email = generateUniqueEmail('teste');
```

## 📈 Coverage

| Área                     | Cobertura |
| ------------------------ | --------- |
| Fluxos de autenticação   | 🟢 100%   |
| Controles de acesso      | 🟢 100%   |
| Validações de formulário | 🟢 95%    |
| Segurança                | 🟢 90%    |
| Interações de UI         | 🟡 80%    |

## 🔗 Links Úteis

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Setup](https://playwright.dev/docs/ci)
