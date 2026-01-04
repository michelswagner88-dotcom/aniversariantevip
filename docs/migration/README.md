# Guia de Migração Supabase - AniversarianteVIP

## Resumo Executivo

Este guia contém todos os scripts SQL necessários para migrar o projeto AniversarianteVIP do Lovable Cloud (`muwugpcegkdgujfesrfq`) para seu projeto Supabase PRO (`nugyoqgbrjqgtopkmdvz`).

## Arquivos de Migração

Execute os scripts **NA ORDEM** abaixo no SQL Editor do seu projeto Supabase PRO:

| # | Arquivo | Descrição | Registros |
|---|---------|-----------|-----------|
| 1 | `01-SCHEMA-CREATE.sql` | Criar tabelas, índices, views | ~30 tabelas |
| 2 | `02-FUNCTIONS-CREATE.sql` | Criar funções e triggers | ~35 funções |
| 3 | `03-RLS-POLICIES.sql` | Políticas de segurança RLS | ~60 políticas |
| 4 | `04-STORAGE-SETUP.sql` | Buckets e políticas storage | 4 buckets |
| 5 | `05-DATA-ESPECIALIDADES.sql` | Dados de especialidades | 113 registros |
| 6 | `06-DATA-USERS.sql` | Profiles, roles, admins | 21 registros |
| 7 | *(Gerado separadamente)* | Estabelecimentos | 335 registros |

## ⚠️ PROBLEMA CRÍTICO: Usuários (auth.users)

Os usuários armazenados em `auth.users` **NÃO PODEM** ser migrados diretamente via SQL porque:
1. A tabela `auth.users` é gerenciada pelo Supabase Auth
2. Você não tem acesso ao projeto Lovable Cloud

### Soluções

**Opção A: Usuários fazem novo cadastro (RECOMENDADO)**
- Mais simples de implementar
- Usuários criam nova conta
- Dados de aniversariante/estabelecimento precisam ser re-vinculados

**Opção B: Migrar via Supabase Admin API**
- Requer acesso ao projeto Cloud (você NÃO tem)
- Precisaria exportar senhas hasheadas

**Opção C: Contatar Suporte Lovable**
- Solicitar exportação dos auth.users
- Ou pedir para reconectar Lovable ao seu projeto PRO

## Passos Pós-Migração

### 1. Configurar Google OAuth no Projeto PRO

No Supabase Dashboard (`nugyoqgbrjqgtopkmdvz`):
1. **Authentication > Providers > Google**
2. Habilitar e configurar Client ID/Secret
3. URLs de callback: `https://acesso.aniversariantevip.com.br/auth/v1/callback`

No Google Cloud Console:
1. **Authorized JavaScript origins**: `https://acesso.aniversariantevip.com.br`
2. **Authorized redirect URIs**: `https://acesso.aniversariantevip.com.br/auth/v1/callback`

### 2. Configurar Secrets (Edge Functions)

Em **Settings > Edge Functions > Secrets**:
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `VITE_GOOGLE_MAPS_API_KEY`
- `LOVABLE_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### 3. Atualizar URLs de Storage

Após migrar as fotos, execute:
```sql
UPDATE estabelecimentos 
SET galeria_fotos = array_replace(
  galeria_fotos, 
  'muwugpcegkdgujfesrfq', 
  'nugyoqgbrjqgtopkmdvz'
)
WHERE galeria_fotos IS NOT NULL;

UPDATE estabelecimentos 
SET logo_url = replace(logo_url, 'muwugpcegkdgujfesrfq', 'nugyoqgbrjqgtopkmdvz')
WHERE logo_url IS NOT NULL AND logo_url LIKE '%muwugpcegkdgujfesrfq%';
```

### 4. Atualizar Código Lovable

Depois de migrar, você precisará atualizar as variáveis de ambiente do Lovable:
- `VITE_SUPABASE_URL` → `https://nugyoqgbrjqgtopkmdvz.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` → anon key do projeto PRO
- `VITE_SUPABASE_PROJECT_ID` → `nugyoqgbrjqgtopkmdvz`

## Dados a Migrar (Resumo)

| Tabela | Registros | Prioridade |
|--------|-----------|------------|
| estabelecimentos | 335 | ALTA |
| especialidades | 113 | ALTA |
| profiles | 12 | MÉDIA* |
| user_roles | 5 | MÉDIA* |
| admins | 1 | MÉDIA* |
| aniversariantes | 3 | MÉDIA* |
| estabelecimento_analytics | 601 | BAIXA |
| admin_access_logs | 158 | BAIXA |
| rate_limits | 98 | IGNORAR |
| cupons | 0 | N/A |
| favoritos | 0 | N/A |

*Dependem de auth.users existentes

## Checklist Final

- [ ] Verificar projeto PRO está ativo
- [ ] Custom Domain configurado no PRO
- [ ] Executar scripts de schema (1-4)
- [ ] Executar scripts de dados (5-7)
- [ ] Configurar Google OAuth
- [ ] Configurar Secrets
- [ ] Migrar fotos do Storage
- [ ] Atualizar URLs no banco
- [ ] Testar autenticação
- [ ] Testar fluxo de cupons
- [ ] Verificar acesso admin

## Suporte

Se encontrar problemas:
1. Verifique os logs no Supabase Dashboard
2. Contate o suporte Lovable para acesso ao projeto Cloud
3. Revise as políticas RLS se houver erros de permissão
