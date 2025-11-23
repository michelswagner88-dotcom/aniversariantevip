-- Adicionar campos detalhados de endereço na tabela estabelecimentos
ALTER TABLE public.estabelecimentos
ADD COLUMN cep VARCHAR(9),
ADD COLUMN logradouro TEXT,
ADD COLUMN numero TEXT,
ADD COLUMN complemento TEXT,
ADD COLUMN bairro TEXT,
ADD COLUMN latitude NUMERIC(10, 8),
ADD COLUMN longitude NUMERIC(11, 8);