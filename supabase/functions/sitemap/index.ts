import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SITE_URL = 'https://aniversariantevip.com.br'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SitemapURL {
  loc: string
  lastmod?: string
  changefreq: string
  priority: number
}

const STATIC_PAGES: SitemapURL[] = [
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/explorar', changefreq: 'daily', priority: 0.9 },
  { loc: '/como-funciona', changefreq: 'monthly', priority: 0.7 },
  { loc: '/seja-parceiro', changefreq: 'monthly', priority: 0.8 },
  { loc: '/faq', changefreq: 'monthly', priority: 0.6 },
  { loc: '/feed', changefreq: 'daily', priority: 0.7 },
  { loc: '/ofertas', changefreq: 'daily', priority: 0.7 },
  { loc: '/termos-uso', changefreq: 'yearly', priority: 0.3 },
  { loc: '/politica-privacidade', changefreq: 'yearly', priority: 0.3 },
]

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const generateSitemapXML = (urls: SitemapURL[]): string => {
  const today = new Date().toISOString().split('T')[0]
  
  const urlEntries = urls.map(url => `
  <url>
    <loc>${SITE_URL}${url.loc}</loc>
    <lastmod>${url.lastmod || today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Buscar estabelecimentos ativos
    const { data: estabelecimentos, error } = await supabase
      .from('estabelecimentos')
      .select('slug, estado, cidade, updated_at')
      .eq('ativo', true)
      .is('deleted_at', null)

    if (error) {
      console.error('Erro ao buscar estabelecimentos:', error)
      throw error
    }

    const estabelecimentoURLs: SitemapURL[] = (estabelecimentos || []).map(estab => ({
      loc: `/${estab.estado?.toLowerCase() || 'br'}/${slugify(estab.cidade || '')}/${estab.slug}`,
      lastmod: estab.updated_at?.split('T')[0],
      changefreq: 'weekly',
      priority: 0.8,
    }))

    // Cidades únicas
    const cidadesMap = new Map<string, SitemapURL>()
    estabelecimentos?.forEach(estab => {
      if (estab.estado && estab.cidade) {
        const key = `${estab.estado}|${estab.cidade}`
        if (!cidadesMap.has(key)) {
          cidadesMap.set(key, {
            loc: `/${estab.estado.toLowerCase()}/${slugify(estab.cidade)}`,
            changefreq: 'daily',
            priority: 0.85,
          })
        }
      }
    })

    const cidadeURLs = Array.from(cidadesMap.values())

    // Combinar todas as URLs
    const allURLs = [
      ...STATIC_PAGES,
      ...cidadeURLs,
      ...estabelecimentoURLs,
    ]

    const sitemapXML = generateSitemapXML(allURLs)

    return new Response(sitemapXML, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error)
    return new Response(
      JSON.stringify({ error: 'Erro ao gerar sitemap' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
