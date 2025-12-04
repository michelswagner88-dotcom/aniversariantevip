import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'place';
  noindex?: boolean;
}

const SITE_NAME = 'Aniversariante VIP';
const DEFAULT_DESCRIPTION = 'Descubra benefícios exclusivos para aniversariantes em restaurantes, bares, academias e muito mais. Cadastre-se grátis!';
const DEFAULT_IMAGE = 'https://aniversariantevip.com.br/og-image.png';
const SITE_URL = 'https://aniversariantevip.com.br';

export const useSEO = ({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
}: SEOProps) => {
  useEffect(() => {
    // Title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    // Meta tags helper
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Description
    setMeta('description', description || DEFAULT_DESCRIPTION);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical || `${SITE_URL}${window.location.pathname}`;

    // Robots
    if (noindex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      setMeta('robots', 'index, follow');
    }

    // Open Graph
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description || DEFAULT_DESCRIPTION, true);
    setMeta('og:type', ogType, true);
    setMeta('og:url', canonical || `${SITE_URL}${window.location.pathname}`, true);
    setMeta('og:image', ogImage || DEFAULT_IMAGE, true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:locale', 'pt_BR', true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description || DEFAULT_DESCRIPTION);
    setMeta('twitter:image', ogImage || DEFAULT_IMAGE);

  }, [title, description, canonical, ogImage, ogType, noindex]);
};

export default useSEO;
