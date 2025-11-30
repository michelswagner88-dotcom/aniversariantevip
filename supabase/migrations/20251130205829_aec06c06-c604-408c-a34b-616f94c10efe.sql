-- Corrigir políticas RLS para email_analytics
-- (VIEWs herdam políticas das tabelas base, então não precisam de políticas próprias)

-- Remover política antiga que permite qualquer autenticado
DROP POLICY IF EXISTS "Require authentication for email_analytics select" ON public.email_analytics;

-- Adicionar política restritiva: apenas admins e colaboradores
CREATE POLICY "Only admins and colaboradores can view email analytics"
ON public.email_analytics
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'colaborador')
);