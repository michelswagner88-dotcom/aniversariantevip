-- Remover TODOS os triggers de email que estão bloqueando
DROP TRIGGER IF EXISTS on_auth_user_created_send_welcome ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON profiles CASCADE;
DROP FUNCTION IF EXISTS public.send_welcome_email_on_signup() CASCADE;

-- Garantir que o trigger de criação de profile funciona
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

-- Recriar trigger básico
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();