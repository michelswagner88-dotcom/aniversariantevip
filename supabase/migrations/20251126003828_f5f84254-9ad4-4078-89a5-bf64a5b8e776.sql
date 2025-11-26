-- Create flash_promos table for temporary promotional campaigns
CREATE TABLE IF NOT EXISTS public.flash_promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'PAUSED')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  views_count INTEGER DEFAULT 0,
  claims_count INTEGER DEFAULT 0
);

-- Add indexes for fast querying
CREATE INDEX idx_flash_promos_city_status ON public.flash_promos(cidade, status);
CREATE INDEX idx_flash_promos_expires_at ON public.flash_promos(expires_at DESC);

-- Enable RLS
ALTER TABLE public.flash_promos ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view flash promos (client-side will filter by active/expired)
CREATE POLICY "Anyone can view flash promos"
  ON public.flash_promos
  FOR SELECT
  USING (true);

-- Policy: Establishments can manage their own promos
CREATE POLICY "Establishments can manage their own promos"
  ON public.flash_promos
  FOR ALL
  USING (auth.uid() = estabelecimento_id)
  WITH CHECK (auth.uid() = estabelecimento_id);

-- Policy: Admins can manage all promos
CREATE POLICY "Admins can manage all promos"
  ON public.flash_promos
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));