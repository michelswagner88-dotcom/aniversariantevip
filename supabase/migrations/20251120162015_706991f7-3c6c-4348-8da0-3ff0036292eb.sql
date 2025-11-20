-- Remove a política existente de gerenciamento
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Criar política para permitir inserção do primeiro admin
CREATE POLICY "Allow first admin creation"
ON public.user_roles
FOR INSERT
WITH CHECK (
  -- Permite se for admin OU se não houver nenhum admin no sistema
  public.has_role(auth.uid(), 'admin') 
  OR 
  NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
);

-- Política para admins gerenciarem roles (UPDATE e DELETE)
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));