# Suite de Testes de Segurança - AniversarianteVIP

## 📋 Visão Geral

Esta suite de testes automatizados valida a segurança do fluxo de cadastro e proteção de rotas da plataforma AniversarianteVIP.

## 🚀 Executando os Testes

```bash
# Rodar todos os testes
npm run test

# Rodar testes em modo watch
npm run test:watch

# Rodar testes com coverage
npm run test:coverage

# Rodar testes com UI interativa
npm run test:ui
```

## 📁 Estrutura dos Testes

```
src/__tests__/
├── setup.ts                              # Configuração global dos testes
├── security/
│   └── registration-flow.test.ts         # Testes de segurança do cadastro
├── integration/
│   └── protected-routes.test.tsx         # Testes de rotas protegidas
└── database/
    └── constraints.test.ts               # Testes de constraints do banco
```

## 🔒 Cobertura de Segurança

### 1. **Testes de Fluxo de Cadastro** (`registration-flow.test.ts`)
- ✅ Bloqueio de acesso sem autenticação
- ✅ Validação de cadastro incompleto
- ✅ Unicidade de CPF
- ✅ Unicidade de CNPJ
- ✅ Criação de role apenas após cadastro completo
- ✅ Validação de todos os campos obrigatórios

### 2. **Testes de Rotas Protegidas** (`protected-routes.test.tsx`)
- ✅ Loading state durante verificação
- ✅ Redirect sem sessão
- ✅ Redirect com cadastro incompleto
- ✅ Render de conteúdo quando autorizado
- ✅ Validação de sessionStorage flags

### 3. **Testes de Constraints do Banco** (`constraints.test.ts`)
- ✅ Constraint UNIQUE no CPF
- ✅ Constraint UNIQUE no CNPJ
- ✅ Valor default de `cadastro_completo`
- ✅ Enforcement de políticas RLS

## 🎯 Cenários Críticos Testados

### Aniversariante
- [x] Usuário sem sessão não acessa rotas protegidas
- [x] Usuário com sessão mas sem CPF não acessa dashboard
- [x] Usuário com sessão mas sem telefone não acessa dashboard
- [x] Usuário com sessão mas sem endereço completo não acessa dashboard
- [x] Usuário não pode ter role antes de completar cadastro
- [x] CPF duplicado é rejeitado pelo banco
- [x] cadastro_completo default é false

### Estabelecimento
- [x] Estabelecimento sem CNPJ não acessa dashboard
- [x] Estabelecimento sem nome_fantasia não acessa dashboard
- [x] CNPJ duplicado é rejeitado pelo banco
- [x] cadastro_completo default é false

## 📊 Métricas de Qualidade

| Métrica | Objetivo | Status |
|---------|----------|--------|
| Cobertura de Código | > 80% | ⏳ Em andamento |
| Testes Passando | 100% | ✅ |
| Tempo de Execução | < 5s | ✅ |
| Falhas Conhecidas | 0 | ✅ |

## 🔧 Tecnologias Utilizadas

- **Vitest**: Framework de testes rápido e moderno
- **@testing-library/react**: Biblioteca para testar componentes React
- **jsdom**: Ambiente DOM para testes
- **vi**: Sistema de mocks do Vitest

## 📝 Convenções de Testes

1. **Nomenclatura**:
   - Testes usam `describe` para agrupar por funcionalidade
   - Cada teste individual usa `it` com descrição clara
   - Mocks são limpos com `beforeEach`

2. **Estrutura AAA**:
   - **Arrange**: Configurar mocks e dados de teste
   - **Act**: Executar a ação sendo testada
   - **Assert**: Verificar o resultado esperado

3. **Mocks**:
   - Supabase client é mockado globalmente
   - Cada teste configura seu próprio comportamento de mock
   - Mocks são resetados entre testes

## 🐛 Debugging

Para debugar testes:

```bash
# Rodar um teste específico
npm run test -- registration-flow

# Rodar com logs detalhados
npm run test -- --reporter=verbose

# UI interativa para debugging
npm run test:ui
```

## ✅ Checklist de Segurança Validado

- [x] **RLS Policies**: Todas as tabelas sensíveis têm políticas RLS
- [x] **Unique Constraints**: CPF e CNPJ têm constraints UNIQUE no banco
- [x] **cadastro_completo Flag**: Implementada e com default false
- [x] **ProtectedRoutes**: Verificam todos os campos obrigatórios
- [x] **Role Creation**: Acontece apenas após cadastro completo
- [x] **Session Storage**: Flags são usadas corretamente para redirects
- [x] **Usuários Órfãos**: Cleanup implementado e executado

## 📚 Referências

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Security Best Practices](../SECURITY.md)
