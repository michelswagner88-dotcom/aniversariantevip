-- Remover trigger problemático completamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Simplificar função handle_new_user (manter para uso futuro)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;