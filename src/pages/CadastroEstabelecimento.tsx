Execute a seguinte migração SQL no Supabase para corrigir o bug "Verificando acesso..." e adicionar suporte a múltiplas fotos e tipo de benefício:

1. Adicionar coluna `cadastro_completo` (BOOLEAN) na tabela `estabelecimentos`
2. Adicionar coluna `tipo_beneficio` (TEXT) na tabela `estabelecimentos`  
3. Adicionar coluna `fotos` (JSONB) na tabela `estabelecimentos`
4. Atualizar registros existentes: setar `cadastro_completo = true` onde já tem CNPJ e nome preenchidos

SQL:

ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS cadastro_completo BOOLEAN DEFAULT false;

ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS tipo_beneficio TEXT;

ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS fotos JSONB;

UPDATE estabelecimentos 
SET cadastro_completo = true 
WHERE cadastro_completo IS NULL 
  AND cnpj IS NOT NULL 
  AND (nome_fantasia IS NOT NULL OR razao_social IS NOT NULL);

Isso é necessário porque:
- cadastro_completo: O Guard de autenticação verifica esse campo para liberar acesso à área do estabelecimento
- tipo_beneficio: Novo campo obrigatório para os chips (cortesia, brinde, desconto, bonus, gratis)
- fotos: Array JSON para suportar até 10 fotos com 3 tamanhos cada (thumb, card, gallery)