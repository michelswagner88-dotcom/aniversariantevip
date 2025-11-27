-- Adicionar política RLS para permitir admins atualizarem estabelecimentos
CREATE POLICY "Admins podem atualizar estabelecimentos"
ON public.estabelecimentos
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));