-- Adicionar campos de endereço na tabela aniversariantes
ALTER TABLE public.aniversariantes
ADD COLUMN cep VARCHAR(9),
ADD COLUMN logradouro TEXT,
ADD COLUMN bairro TEXT,
ADD COLUMN numero TEXT,
ADD COLUMN complemento TEXT,
ADD COLUMN cidade TEXT,
ADD COLUMN estado VARCHAR(2);