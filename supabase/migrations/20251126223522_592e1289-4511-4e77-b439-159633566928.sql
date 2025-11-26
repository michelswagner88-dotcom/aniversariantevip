-- Desabilitar trigger de email temporariamente
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

-- Recriar função handle_new_user sem envio de email
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
    NEW.raw_user_meta_data->>'nome'
  );
  RETURN NEW;
END;
$$;