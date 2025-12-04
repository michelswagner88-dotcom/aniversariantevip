-- Permitir leitura pública de estabelecimentos ativos (via anon role)
-- A view public_estabelecimentos já filtra campos sensíveis

CREATE POLICY "Permitir leitura pública de estabelecimentos ativos" 
ON public.estabelecimentos 
FOR SELECT 
TO anon
USING (ativo = true AND deleted_at IS NULL);

-- Também permitir para public (authenticated mas sem role específico)
CREATE POLICY "Permitir leitura pública para todos"
ON public.estabelecimentos 
FOR SELECT 
TO public
USING (ativo = true AND deleted_at IS NULL);