-- Adicionar campo de site para os estabelecimentos
ALTER TABLE public.estabelecimentos 
ADD COLUMN IF NOT EXISTS site TEXT;