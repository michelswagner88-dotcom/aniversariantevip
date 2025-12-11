# Suite de Testes - AniversarianteVIP

## 📋 Visão Geral

Suite de testes automatizados para validar segurança, validações e fluxos da plataforma AniversarianteVIP.

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

# Rodar teste específico
npm run test -- database.test
npm run test -- registration.test
npm run test -- protected-route.test
```

## 📁 Estrutura dos Testes

```
src/__tests__/
├── setup.ts                    # Configuração global dos testes
├── database.test.ts            # Validação de CPF, CNPJ, telefone, CEP
├── registration.test.ts        # Fluxo de cadastro e campos obrigatórios
└── protected-route.test.ts     # Autorização e rotas protegidas
```

## 🔒 Cobertura de Testes

### 1. **Validações de Dados** (`database.test.ts`)

| Teste                                        | Status |
| -------------------------------------------- | ------ |
| CPF válido (dígitos verificadores corretos)  | ✅     |
| CPF inválido (dígitos errados, todos iguais) | ✅     |
| CNPJ válido (dígitos verificadores corretos) | ✅     |
| CNPJ inválido                                | ✅     |
| Telefone celular (11 dígitos, começa com 9)  | ✅     |
| CEP (8 dígitos)                              | ✅     |
| Data de nascimento (18+ anos)                | ✅     |
| Máscaras de formatação                       | ✅     |
| Casos de borda (null, espaços)               | ✅     |

### 2. **Fluxo de Cadastro** (`registration.test.ts`)

| Teste                                  | Status |
| -------------------------------------- | ------ |
| Campos obrigatórios de aniversariante  | ✅     |
| Campos obrigatórios de estabelecimento | ✅     |
| Verificação de CPF duplicado           | ✅     |
| Verificação de CNPJ duplicado          | ✅     |
| Timing de criação de role              | ✅     |
| Transição de estados do cadastro       | ✅     |

### 3. **Rotas Protegidas** (`protected-route.test.ts`)

| Teste                         | Status |
| ----------------------------- | ------ |
| Verificação de sessão         | ✅     |
| Verificação de role           | ✅     |
| Cadastro completo obrigatório | ✅     |
| Flags de sessionStorage       | ✅     |
| Cenários de autorização       | ✅     |
| Tratamento de erros           | ✅     |

## 🎯 Cenários Críticos Testados

### Aniversariante

- [x] CPF deve ser válido matematicamente (algoritmo oficial)
- [x] CPF duplicado é detectado
- [x] Telefone deve ser celular (11 dígitos, 9 no início)
- [x] CEP deve ter 8 dígitos
- [x] Data de nascimento: mínimo 18 anos
- [x] Todos os campos de endereço são obrigatórios
- [x] Usuário sem sessão → redirect para /auth
- [x] Usuário sem role → redirect para /selecionar-perfil
- [x] Cadastro incompleto → redirect para /auth com flags

### Estabelecimento

- [x] CNPJ deve ser válido matematicamente (algoritmo oficial)
- [x] CNPJ duplicado é detectado
- [x] Nome fantasia é obrigatório

## 📊 Métricas

| Métrica                 | Valor |
| ----------------------- | ----- |
| Total de testes         | ~85   |
| Tempo de execução       | < 3s  |
| Cobertura de validações | 100%  |

## 🔧 Tecnologias

- **Vitest**: Framework de testes
- **@testing-library/react**: Testes de componentes
- **jsdom**: Ambiente DOM

## 📝 Convenções

### Estrutura AAA

```typescript
it('deve validar CPF corretamente', () => {
  // Arrange - preparar dados
  const cpfValido = '529.982.247-25';

  // Act - executar ação
  const result = validateCPF(cpfValido);

  // Assert - verificar resultado
  expect(result).toBe(true);
});
```

### Dados de Teste

```typescript
// CPFs VÁLIDOS para usar em testes
const VALID_CPFS = {
  cpf1: '529.982.247-25',
  cpf2: '453.178.287-91',
  cpf3: '714.593.642-14',
};

// CNPJs VÁLIDOS para usar em testes
const VALID_CNPJS = {
  cnpj1: '11.222.333/0001-81',
  cnpj2: '12.345.678/0001-95',
};

// ❌ NUNCA usar CPFs/CNPJs inválidos como:
// '123.456.789-09' - dígitos verificadores errados
// '12345678000199' - dígitos verificadores errados
```

## 🐛 Debugging

```bash
# Teste específico com logs
npm run test -- database.test --reporter=verbose

# UI interativa
npm run test:ui

# Modo debug
npm run test -- --inspect-brk
```

## ✅ Checklist de Qualidade

- [x] CPFs/CNPJs de teste são matematicamente válidos
- [x] Testes não dependem de banco de dados real
- [x] Testes não usam waitForTimeout (antipattern)
- [x] Seletores usam roles/labels (acessibilidade)
- [x] Cada teste é independente (não depende de outros)
- [x] Mocks são limpos entre testes

## 📚 Referências

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Algoritmo CPF](https://www.macoratti.net/alg_cpf.htm)
- [Algoritmo CNPJ](https://www.macoratti.net/alg_cnpj.htm)
