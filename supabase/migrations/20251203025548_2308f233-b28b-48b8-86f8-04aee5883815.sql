-- Tornar CNPJ opcional para imports admin sem CNPJ
ALTER TABLE estabelecimentos 
ALTER COLUMN cnpj DROP NOT NULL;

-- Tornar razao_social opcional também
ALTER TABLE estabelecimentos 
ALTER COLUMN razao_social DROP NOT NULL;