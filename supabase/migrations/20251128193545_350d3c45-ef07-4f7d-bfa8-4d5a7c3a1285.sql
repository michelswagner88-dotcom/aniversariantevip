-- Restaurar todos os estabelecimentos que foram marcados como deletados
UPDATE estabelecimentos 
SET deleted_at = NULL 
WHERE deleted_at IS NOT NULL;

-- Verificar se a política de UPDATE para admins existe e está correta
-- Se não existir, criar uma
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'estabelecimentos' 
    AND policyname = 'Admins podem atualizar estabelecimentos'
  ) THEN
    CREATE POLICY "Admins podem atualizar estabelecimentos"
    ON estabelecimentos
    FOR UPDATE
    USING (has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;