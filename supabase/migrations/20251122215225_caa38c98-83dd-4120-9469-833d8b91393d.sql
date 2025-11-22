-- Add instagram and horario_funcionamento columns to estabelecimentos table
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS horario_funcionamento TEXT;