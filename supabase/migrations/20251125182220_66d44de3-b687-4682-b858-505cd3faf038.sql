-- Add active status field to estabelecimentos table
ALTER TABLE public.estabelecimentos 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_ativo ON public.estabelecimentos(ativo);

-- Update RLS policy to allow admins to update active status
-- (existing policies already allow admin updates, so no changes needed)