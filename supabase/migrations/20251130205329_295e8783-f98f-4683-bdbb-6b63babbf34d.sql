-- ==============================================================================
-- CORREÇÃO CRÍTICA: FLUXO DE CADASTRO E VALIDAÇÃO COMPLETA
-- ==============================================================================
-- Adiciona flag cadastro_completo para garantir que usuários só acessem
-- áreas protegidas após completar TODOS os campos obrigatórios

-- 1. Adicionar coluna cadastro_completo em aniversariantes
ALTER TABLE aniversariantes 
ADD COLUMN IF NOT EXISTS cadastro_completo BOOLEAN NOT NULL DEFAULT false;

-- 2. Adicionar coluna cadastro_completo em estabelecimentos
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS cadastro_completo BOOLEAN NOT NULL DEFAULT false;

-- 3. Atualizar registros existentes de aniversariantes que têm TODOS os campos obrigatórios
UPDATE aniversariantes 
SET cadastro_completo = true 
WHERE cpf IS NOT NULL 
  AND cpf != ''
  AND data_nascimento IS NOT NULL 
  AND telefone IS NOT NULL 
  AND telefone != ''
  AND cidade IS NOT NULL 
  AND cidade != ''
  AND estado IS NOT NULL 
  AND estado != ''
  AND cep IS NOT NULL
  AND cep != ''
  AND logradouro IS NOT NULL
  AND logradouro != ''
  AND bairro IS NOT NULL
  AND bairro != ''
  AND deleted_at IS NULL;

-- 4. Atualizar registros existentes de estabelecimentos que têm campos obrigatórios
UPDATE estabelecimentos 
SET cadastro_completo = true 
WHERE cnpj IS NOT NULL 
  AND cnpj != ''
  AND nome_fantasia IS NOT NULL
  AND nome_fantasia != ''
  AND deleted_at IS NULL;

-- 5. Criar índice para otimizar consultas de cadastro completo
CREATE INDEX IF NOT EXISTS idx_aniversariantes_cadastro_completo 
ON aniversariantes(cadastro_completo) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_estabelecimentos_cadastro_completo 
ON estabelecimentos(cadastro_completo) 
WHERE deleted_at IS NULL;

-- ==============================================================================
-- LIMPEZA DE USUÁRIOS ÓRFÃOS (com role mas sem cadastro completo)
-- ==============================================================================

-- Identificar e REMOVER roles de usuários que não completaram cadastro
-- Isso força esses usuários a completar o cadastro no próximo login
DELETE FROM user_roles
WHERE role = 'aniversariante'
  AND user_id IN (
    SELECT ur.user_id 
    FROM user_roles ur
    LEFT JOIN aniversariantes a ON ur.user_id = a.id
    WHERE ur.role = 'aniversariante'
      AND (a.id IS NULL OR a.cadastro_completo = false OR a.cpf IS NULL)
  );

DELETE FROM user_roles
WHERE role = 'estabelecimento'
  AND user_id IN (
    SELECT ur.user_id 
    FROM user_roles ur
    LEFT JOIN estabelecimentos e ON ur.user_id = e.id
    WHERE ur.role = 'estabelecimento'
      AND (e.id IS NULL OR e.cadastro_completo = false OR e.cnpj IS NULL)
  );