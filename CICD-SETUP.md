# 🔄 CI/CD Setup - AniversarianteVIP

## Visão Geral

Pipeline completo de CI/CD com GitHub Actions para garantir qualidade e segurança do código em cada commit e pull request.

---

## 📋 Workflows Implementados

### 1. **Tests & Security Checks** (`.github/workflows/test.yml`)

**Triggers:**
- Push em `main` ou `develop`
- Pull requests para `main`

**Jobs:**
1. **Linting**: ESLint para verificar qualidade do código
2. **Unit Tests**: Vitest executando todos os testes unitários
3. **Security Tests**: Suite específica de testes de segurança
4. **Coverage Report**: Geração de relatório de cobertura
5. **Codecov Upload**: Upload automático para Codecov (opcional)
6. **PR Comment**: Comentário automático no PR com resultados

**Duração Estimada**: ~3-5 minutos

---

### 2. **E2E Tests** (`.github/workflows/e2e.yml`)

**Triggers:**
- Push em `main`
- Pull requests para `main`

**Jobs:**
1. **Browser Installation**: Playwright browsers (Chrome, Firefox, Safari)
2. **E2E Test Execution**: Todos os testes end-to-end
3. **Artifact Upload**: Screenshots, vídeos e relatórios de falhas
4. **PR Comment**: Comentário no PR com link para artefatos

**Duração Estimada**: ~8-12 minutos

---

## 🔧 Configuração Necessária

### 1. Secrets do GitHub

Adicionar em: **Settings > Secrets and variables > Actions**

| Secret | Descrição | Obrigatório |
|--------|-----------|-------------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | ✅ Sim |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública do Supabase | ✅ Sim |
| `CODECOV_TOKEN` | Token do Codecov (opcional) | ❌ Não |

### 2. Branch Protection Rules

Configurar em: **Settings > Branches > Add rule**

**Regras recomendadas para `main`:**
- ✅ Require status checks to pass before merging
  - ✅ `test` (workflow de testes)
  - ✅ `e2e` (workflow E2E)
- ✅ Require pull request reviews before merging (1 aprovação)
- ✅ Require branches to be up to date before merging
- ✅ Include administrators

---

## 📊 Scripts Package.json

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:security": "vitest run src/__tests__/security/",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## 🎯 Fluxo de Desenvolvimento

### Desenvolvimento Local

```bash
# 1. Criar feature branch
git checkout -b feature/nova-funcionalidade

# 2. Desenvolver e testar localmente
npm run test:watch          # Testes unitários
npm run test:e2e:ui         # Testes E2E visual

# 3. Verificar coverage
npm run test:coverage

# 4. Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin feature/nova-funcionalidade
```

### Pull Request

1. **Criar PR** no GitHub
2. **CI executa automaticamente**:
   - Linting
   - Testes unitários
   - Testes de segurança
   - Testes E2E
3. **Revisar resultados**:
   - Comentário automático no PR
   - Badges de status
   - Link para artefatos (se houver falhas)
4. **Merge após aprovação**

---

## 🚀 Deploy Automático (Opcional)

Para adicionar deploy automático após merge em `main`:

**Criar `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: [test, e2e]  # Só deploy se testes passarem
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📈 Monitoramento

### Status Badges

Adicionar ao `README.md`:

```markdown
![Tests](https://github.com/seu-usuario/aniversariante-vip/actions/workflows/test.yml/badge.svg)
![E2E](https://github.com/seu-usuario/aniversariante-vip/actions/workflows/e2e.yml/badge.svg)
[![codecov](https://codecov.io/gh/seu-usuario/aniversariante-vip/branch/main/graph/badge.svg)](https://codecov.io/gh/seu-usuario/aniversariante-vip)
```

### Slack Notifications (Opcional)

Adicionar ao final dos workflows:

```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Testes falharam!'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🔍 Debugging Falhas no CI

### Ver Logs Detalhados

1. Acessar: **Actions > Workflow Run > Job**
2. Expandir steps para ver logs completos
3. Download de artefatos (screenshots, vídeos)

### Reproduzir Localmente

```bash
# Simular ambiente CI
CI=true npm run test
CI=true npm run test:e2e

# Usar mesmos secrets
export VITE_SUPABASE_URL="sua-url"
export VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave"
npm run test:e2e
```

---

## 📚 Próximos Passos

1. ✅ **Configurar secrets** no GitHub
2. ✅ **Ativar branch protection** em `main`
3. ✅ **Fazer primeiro PR** para testar workflows
4. ⏳ **Configurar Codecov** (opcional)
5. ⏳ **Adicionar deploy automático** (opcional)
6. ⏳ **Configurar notificações** Slack/Discord (opcional)

---

## 🛡️ Segurança

### Secrets Management

- ❌ **NUNCA** commitar secrets no código
- ✅ Usar GitHub Secrets para variáveis sensíveis
- ✅ Usar variáveis de ambiente no CI
- ✅ Rotacionar secrets periodicamente

### Code Scanning (Opcional)

Adicionar CodeQL:

```yaml
# .github/workflows/codeql.yml
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Segunda-feira 6h

jobs:
  analyze:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript
      - uses: github/codeql-action/analyze@v2
```

---

## 📞 Suporte

- **GitHub Actions Docs**: https://docs.github.com/actions
- **Playwright CI**: https://playwright.dev/docs/ci
- **Vitest CI**: https://vitest.dev/guide/ci.html
