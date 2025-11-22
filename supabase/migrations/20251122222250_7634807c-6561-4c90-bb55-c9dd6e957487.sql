-- Adicionar políticas de DELETE para admins nas tabelas necessárias

-- Permitir admins deletarem aniversariantes
CREATE POLICY "Admins podem deletar aniversariantes"
ON public.aniversariantes
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Permitir admins deletarem estabelecimentos
CREATE POLICY "Admins podem deletar estabelecimentos"
ON public.estabelecimentos
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Permitir admins deletarem profiles
CREATE POLICY "Admins podem deletar profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Permitir admins deletarem cupons
CREATE POLICY "Admins podem deletar cupons"
ON public.cupons
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));