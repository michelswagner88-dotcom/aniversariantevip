-- Permitir que todos (incluindo não autenticados) possam ver estabelecimentos
CREATE POLICY "Todos podem ver estabelecimentos publicamente"
ON public.estabelecimentos
FOR SELECT
TO public
USING (true);