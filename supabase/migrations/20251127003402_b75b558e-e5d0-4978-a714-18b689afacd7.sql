-- Adicionar política RLS para permitir admins inserirem estabelecimentos na importação
CREATE POLICY "Admins podem inserir estabelecimentos"
ON public.estabelecimentos
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));