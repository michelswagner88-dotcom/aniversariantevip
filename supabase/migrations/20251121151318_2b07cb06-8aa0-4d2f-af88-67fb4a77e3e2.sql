-- Remover constraint de foreign key do estabelecimentos.id
-- Isso permite cadastrar estabelecimentos sem criar usuário de acesso
-- O id agora será gerado automaticamente

ALTER TABLE estabelecimentos DROP CONSTRAINT IF EXISTS estabelecimentos_id_fkey;

-- Modificar id para ter default gen_random_uuid()
ALTER TABLE estabelecimentos ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Adicionar coluna para indicar se tem conta de acesso
ALTER TABLE estabelecimentos ADD COLUMN IF NOT EXISTS tem_conta_acesso boolean DEFAULT false;

-- Atualizar estabelecimentos existentes que têm conta
UPDATE estabelecimentos SET tem_conta_acesso = true WHERE id IN (SELECT id FROM auth.users);

-- Atualizar RLS policies para permitir que colaboradores insiram estabelecimentos sem precisar de user_id
DROP POLICY IF EXISTS "Estabelecimentos podem inserir seu próprio perfil" ON estabelecimentos;

CREATE POLICY "Estabelecimentos podem inserir seu próprio perfil" 
ON estabelecimentos 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Nova policy: Colaboradores podem inserir estabelecimentos sem user_id
CREATE POLICY "Colaboradores podem cadastrar estabelecimentos" 
ON estabelecimentos 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'colaborador'::app_role));

-- Colaboradores podem atualizar qualquer estabelecimento
CREATE POLICY "Colaboradores podem atualizar estabelecimentos" 
ON estabelecimentos 
FOR UPDATE 
USING (has_role(auth.uid(), 'colaborador'::app_role));

-- Estabelecimentos podem ver e atualizar apenas o próprio perfil
CREATE POLICY "Estabelecimentos podem ver próprio perfil com conta" 
ON estabelecimentos 
FOR SELECT 
USING (auth.uid() = id AND tem_conta_acesso = true);