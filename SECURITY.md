# 🛡️ Documentação de Segurança - Aniversariante VIP

## Visão Geral

Este documento descreve as camadas de segurança implementadas na plataforma Aniversariante VIP para proteger dados pessoais (LGPD), prevenir abuso e garantir integridade dos cupons.

---

## 1. Row Level Security (RLS) - O Cofre

### Filosofia: Zero Trust
O banco de dados **não confia em ninguém**, nem mesmo no próprio frontend. Todas as operações são validadas no servidor através de políticas RLS.

### Tabelas Protegidas

#### `profiles` - Dados Sensíveis
- **Leitura Pública**: Apenas `id`, `nome` e `created_at`
- **Leitura Privada**: Campos sensíveis (`email`, `telefone`) apenas pelo próprio usuário (`auth.uid() = id`)
- **Edição**: Apenas o próprio usuário pode atualizar

#### `aniversariantes` - Dados de Aniversariantes
- **Leitura**: Apenas o próprio usuário
- **Inserção**: Apenas para si mesmo (`auth.uid() = id`)
- **Atualização**: Apenas o próprio usuário
- **CPF**: Nunca exposto publicamente
- **Admins**: Acesso total para gerenciamento

#### `cupons` - O Ativo Crítico
- **Inserção**: Usuário só pode criar cupom para si mesmo (`user_id = auth.uid()`)
- **Leitura**:
  - Aniversariante vê apenas seus cupons
  - Estabelecimento vê apenas cupons gerados para ele
  - **Ninguém vê a lista geral**
- **Validação**: Apenas estabelecimento pode marcar como usado
- **Exclusão**: Apenas admins (auditoria)

#### `estabelecimentos` - Dados de Estabelecimentos
- **Leitura Pública**: Nome, endereço, horário, benefício (sem dados sensíveis)
- **Leitura Privada**: CNPJ e telefone apenas pelo próprio estabelecimento
- **Atualização**: Apenas o dono do estabelecimento ou colaboradores
- **Exclusão**: Apenas admins

---

## 2. Validação de Entrada (Zod + Sanitização)

### Validações Implementadas

#### CPF/CNPJ com Algoritmo Real
```typescript
// Validação matemática completa dos dígitos verificadores
validateCPF(cpf: string): boolean
validateCNPJ(cnpj: string): boolean
```

- Verifica formato (11 dígitos CPF, 14 dígitos CNPJ)
- Rejeita sequências repetidas (111.111.111-11)
- Calcula e valida dígitos verificadores

#### Email & Senha
```typescript
emailSchema: z.string()
  .email()
  .max(255)
  .toLowerCase()

passwordSchema: z.string()
  .min(8)
  .regex(/[A-Z]/) // Maiúscula
  .regex(/[a-z]/) // Minúscula
  .regex(/[0-9]/) // Número
```

#### Anti-XSS (Cross-Site Scripting)
```typescript
sanitizeInput(input: string): string
```
- Escapa caracteres HTML (`<`, `>`, `"`, `'`, `/`)
- Aplicado automaticamente em campos de nome
- Previne injeção de código malicioso

---

## 3. Proteção de Rotas - ProtectedRoute

### Componente de Guarda
```typescript
<ProtectedRoute requiredRole="aniversariante">
  <Dashboard />
</ProtectedRoute>
```

### Comportamento
- **Sem sessão**: Redireciona para `/auth` instantaneamente
- **Com sessão mas sem role**: Mostra página "Acesso Negado"
- **Loading**: Exibe spinner durante verificação
- **Não renderiza**: Nenhum conteúdo protegido é exibido se não autenticado

### Rotas Protegidas
- `/area-aniversariante` - Requer role `aniversariante`
- `/area-estabelecimento` - Requer role `estabelecimento`
- `/area-colaborador` - Requer role `colaborador`
- `/meus-cupons` - Requer autenticação
- `/meus-favoritos` - Requer autenticação

---

## 4. Rate Limiting - Anti-Abuso

### Tabela `cupom_rate_limit`
Controla frequência de emissão de cupons por usuário.

### Regras
- **1 cupom por estabelecimento por semana**
- Rastreamento por `semana_referencia` (início da semana)
- Bloqueio automático via função `emit_coupon_secure`

### Função de Emissão Segura
```sql
emit_coupon_secure(
  p_aniversariante_id UUID,
  p_estabelecimento_id UUID
)
```

**Validações:**
1. Verifica se `auth.uid() = p_aniversariante_id` (não pode emitir para outros)
2. Checa rate limit semanal
3. Valida existência de aniversariante e estabelecimento
4. Calcula validade baseada nas regras do estabelecimento
5. Atualiza contador de rate limit

**Mensagens de Erro:**
- "Você só pode emitir cupons para si mesmo"
- "Você já emitiu um cupom para este estabelecimento esta semana"
- "Aniversariante não encontrado"
- "Estabelecimento não encontrado"

---

## 5. Funções Security Definer

### `has_role(_user_id UUID, _role app_role)`
- Executa com privilégios do owner
- Previne recursão infinita em RLS
- Usado em todas as policies que verificam roles

### `emit_coupon_secure`
- Executa com `SECURITY DEFINER`
- Acessa `cupom_rate_limit` mesmo com RLS habilitado
- Garante atomicidade da transação

---

## 6. Autenticação e Sessão

### Configuração Supabase Auth
- **Email/Password**: Método principal
- **Email Redirect**: Configurado para domínio correto
- **Session Storage**: localStorage com auto-refresh
- **Token Refresh**: Automático via `onAuthStateChange`

### Boas Práticas Implementadas
```typescript
// Nunca usar funções async dentro de onAuthStateChange
supabase.auth.onAuthStateChange((event, session) => {
  setSession(session);
  setUser(session?.user ?? null);
  
  // Defer para evitar deadlock
  if (session?.user) {
    setTimeout(() => {
      fetchUserProfile(session.user.id);
    }, 0);
  }
});
```

---

## 7. Checklist de Segurança

### ✅ Implementado
- [x] RLS habilitado em todas as tabelas
- [x] Validação CPF/CNPJ com checksum
- [x] Sanitização XSS em inputs
- [x] ProtectedRoute para rotas sensíveis
- [x] Rate limiting para emissão de cupons
- [x] Security definer functions
- [x] Validação de senha forte
- [x] Validação server-side (RLS)
- [x] Auditoria via timestamps (created_at, updated_at)

### ⚠️ Recomendações Adicionais

#### Habilitar Leaked Password Protection
O Supabase detectou que a proteção contra senhas vazadas está desabilitada.

**Como habilitar:**
1. Acesse o Backend (Cloud Dashboard)
2. Vá em Authentication → Settings
3. Habilite "Password Strength and Leaked Password Protection"

[Documentação oficial](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

#### Logs e Monitoramento
- Implementar logging de tentativas de acesso suspeitas
- Monitorar rate limit triggers
- Alertas para múltiplas falhas de validação

#### Backup e Disaster Recovery
- Configurar backups automáticos do Supabase
- Testar procedimentos de restauração
- Manter documentação de recuperação

---

## 8. LGPD Compliance

### Dados Coletados
- **Aniversariantes**: Nome, CPF, email, telefone, endereço, data de nascimento
- **Estabelecimentos**: Razão social, CNPJ, email, telefone, endereço

### Consentimento
- Política de Privacidade disponível em `/politica-privacidade`
- Termos de Uso disponíveis em `/termos-uso`
- Cookie Consent implementado

### Direitos do Titular
- **Acesso**: Usuário pode visualizar seus dados no perfil
- **Retificação**: Usuário pode editar dados (exceto CPF e data de nascimento)
- **Exclusão**: Implementado via admin (requer solicitação)

### Armazenamento
- Dados armazenados no Supabase (AWS, região configurável)
- Criptografia em trânsito (HTTPS) e em repouso
- Acesso restrito via RLS

---

## 9. Teste de Segurança

### Como Testar RLS

```sql
-- Conectar como usuário específico
SET request.jwt.claims = '{"sub": "user-id-aqui"}';

-- Tentar acessar dados de outro usuário
SELECT * FROM aniversariantes WHERE id != auth.uid();
-- Deve retornar vazio

-- Tentar criar cupom para outro usuário
SELECT * FROM emit_coupon_secure('outro-user-id', 'estabelecimento-id');
-- Deve retornar erro
```

### Como Testar Rate Limiting

1. Emitir cupom para um estabelecimento
2. Tentar emitir novamente na mesma semana
3. Deve retornar: "Você já emitiu um cupom para este estabelecimento esta semana"

---

## 10. Contato de Segurança

Para reportar vulnerabilidades ou questões de segurança:
- **Email**: security@aniversariantevip.com.br
- **Resposta**: Dentro de 48 horas úteis
- **Disclosure**: Responsible disclosure policy

---

**Última atualização**: 2025-11-25
**Versão**: 1.0.0
**Status**: ✅ Produção
