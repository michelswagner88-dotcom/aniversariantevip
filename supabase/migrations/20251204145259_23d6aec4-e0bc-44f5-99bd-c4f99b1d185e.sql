-- Garantir que a view public_estabelecimentos seja acessível publicamente
-- A view já existe, precisamos apenas garantir que as políticas de segurança permitam leitura

-- Primeiro, verificar se RLS está habilitado e criar policy de leitura pública se necessário
DO $$
BEGIN
  -- Se a view for uma tabela materializada ou view normal, garantir acesso
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'public_estabelecimentos' 
    AND policyname = 'Permitir leitura publica da view'
  ) THEN
    -- Tentar criar policy (funciona se for uma tabela, não view)
    BEGIN
      CREATE POLICY "Permitir leitura publica da view" 
      ON public_estabelecimentos
      FOR SELECT 
      USING (true);
    EXCEPTION WHEN OTHERS THEN
      -- Se falhar, a view já é pública por natureza
      NULL;
    END;
  END IF;
END $$;

-- Garantir que anon e authenticated tenham acesso de SELECT
GRANT SELECT ON public_estabelecimentos TO anon;
GRANT SELECT ON public_estabelecimentos TO authenticated;