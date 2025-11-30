# 🧪 Guia de Testes - AniversarianteVIP

## Executar Testes

```bash
# Rodar todos os testes
npm run test

# Modo watch (desenvolvimento)
npm run test:watch

# Coverage completo
npm run test:coverage

# UI interativa
npm run test:ui
```

## Estrutura

- `src/__tests__/security/` - Testes de segurança do fluxo de cadastro
- `src/__tests__/integration/` - Testes de integração de componentes
- `src/__tests__/database/` - Testes de constraints e RLS do banco

## Coverage

A suite de testes cobre os seguintes aspectos críticos de segurança:

✅ Autenticação e autorização  
✅ Validação de cadastro completo  
✅ Constraints do banco (CPF/CNPJ únicos)  
✅ Políticas RLS  
✅ Proteção de rotas sensíveis  

Para mais detalhes, veja [src/__tests__/README.md](src/__tests__/README.md).
