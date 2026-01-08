/**
 * Contact Validation and Formatting Utilities
 * Validates and formats contact data (WhatsApp, Instagram, Phone, Website)
 */

/**
 * Valida e formata número de telefone para WhatsApp
 * Aceita: (61) 99999-9999, 61999999999, +5561999999999
 * Retorna: 5561999999999 ou null se inválido
 */
export const formatWhatsApp = (phone: string | null | undefined): string | null => {
  if (!phone) return null;
  
  // Remove tudo que não é número
  let cleaned = phone.replace(/\D/g, '');
  
  // Se não tem números suficientes, inválido
  if (cleaned.length < 10) return null;
  
  // Se começa com 0, remove
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Se não tem código do país, adiciona 55 (Brasil)
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  
  // Validar tamanho final (55 + DDD + número = 12 ou 13 dígitos)
  if (cleaned.length < 12 || cleaned.length > 13) return null;
  
  return cleaned;
};

/**
 * Gera link do WhatsApp com mensagem personalizada
 */
export const getWhatsAppLink = (
  phone: string | null | undefined, 
  message?: string
): string | null => {
  const formatted = formatWhatsApp(phone);
  if (!formatted) return null;
  
  const baseUrl = 'https://wa.me/';
  const msg = message ? `?text=${encodeURIComponent(message)}` : '';
  
  return `${baseUrl}${formatted}${msg}`;
};

/**
 * Valida e formata Instagram
 * Aceita: @usuario, usuario, https://instagram.com/usuario
 * Retorna: URL completa ou null se inválido
 */
export const formatInstagram = (instagram: string | null | undefined): string | null => {
  if (!instagram) return null;
  
  let username = instagram.trim();
  
  // Se já é URL completa, validar e retornar
  if (username.includes('instagram.com')) {
    // Extrair username da URL
    const match = username.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
    if (match) {
      username = match[1];
    } else {
      return null;
    }
  }
  
  // Remover @ se tiver
  username = username.replace('@', '');
  
  // Remover acentos para validação (Instagram não aceita acentos, mas vamos ser permissivos)
  const usernameNormalized = username.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Validar formato do username (letras, números, pontos, underscores)
  if (!/^[a-zA-Z0-9._]+$/.test(usernameNormalized)) return null;
  
  // Username muito curto ou muito longo
  if (usernameNormalized.length < 1 || usernameNormalized.length > 30) return null;
  
  return `https://instagram.com/${username}`;
};

/**
 * Valida e formata número de telefone para ligação
 * Retorna: tel:+5561999999999 ou null se inválido
 */
export const formatPhoneLink = (phone: string | null | undefined): string | null => {
  const formatted = formatWhatsApp(phone);
  if (!formatted) return null;
  
  return `tel:+${formatted}`;
};

/**
 * Valida e formata URL do site
 * Aceita: exemplo.com, www.exemplo.com, https://exemplo.com
 * Retorna: URL com https:// ou null se inválido
 */
export const formatWebsite = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  let website = url.trim();
  
  // Se está vazio ou muito curto
  if (website.length < 4) return null;
  
  // Se não tem protocolo, adicionar https://
  if (!website.startsWith('http://') && !website.startsWith('https://')) {
    website = 'https://' + website;
  }
  
  // Validar se é URL válida
  try {
    new URL(website);
    return website;
  } catch {
    return null;
  }
};

/**
 * Gera mensagem personalizada por categoria
 */
export const getWhatsAppMessage = (nome: string, categoria?: string | string[] | null): string => {
  const cat = Array.isArray(categoria) ? categoria[0]?.toLowerCase() : categoria?.toLowerCase();
  
  const messages: Record<string, string> = {
    gastronomia: `Olá! Vi o ${nome} no Aniversariante VIP e gostaria de reservar uma mesa para meu aniversário! 🎂`,
    restaurante: `Olá! Vi o ${nome} no Aniversariante VIP e gostaria de reservar uma mesa para meu aniversário! 🎂`,
    bar: `Olá! Vi o ${nome} no Aniversariante VIP e quero saber sobre o benefício de aniversário! 🍻🎂`,
    'beleza & estética': `Olá! Vi o ${nome} no Aniversariante VIP e gostaria de agendar um horário especial de aniversário! ✨🎂`,
    'saude-beleza': `Olá! Vi o ${nome} no Aniversariante VIP e gostaria de agendar um horário especial de aniversário! ✨🎂`,
    academia: `Olá! Vi a ${nome} no Aniversariante VIP e tenho interesse no benefício de aniversário! 💪🎂`,
    'salão de beleza': `Olá! Vi o ${nome} no Aniversariante VIP e gostaria de agendar um horário especial de aniversário! 💇‍♀️🎂`,
    barbearia: `Olá! Vi a ${nome} no Aniversariante VIP e gostaria de agendar um horário especial de aniversário! 💈🎂`,
    sorveteria: `Olá! Vi a ${nome} no Aniversariante VIP e quero saber sobre o benefício de aniversário! 🍦🎂`,
    cafeteria: `Olá! Vi a ${nome} no Aniversariante VIP e quero saber sobre o benefício de aniversário! ☕🎂`,
    confeitaria: `Olá! Vi a ${nome} no Aniversariante VIP e gostaria de encomendar algo especial! 🧁🎂`,
    balada: `Olá! Vi a ${nome} no Aniversariante VIP e quero saber sobre entrada VIP de aniversário! 🎉🎂`,
    'casa-noturna': `Olá! Vi a ${nome} no Aniversariante VIP e quero saber sobre entrada VIP de aniversário! 🎉🎂`,
    hotel: `Olá! Vi o ${nome} no Aniversariante VIP e gostaria de saber sobre o benefício de aniversário! 🏨🎂`,
    hospedagem: `Olá! Vi o ${nome} no Aniversariante VIP e gostaria de saber sobre o benefício de aniversário! 🏨🎂`,
    loja: `Olá! Vi a ${nome} no Aniversariante VIP e quero saber sobre os descontos de aniversário! 🛍️🎂`,
  };
  
  return messages[cat || ''] || `Olá! Vi o ${nome} no Aniversariante VIP e gostaria de saber mais sobre o benefício de aniversário! 🎂`;
};

/**
 * Interface para contatos validados
 */
export interface ValidatedContacts {
  whatsapp: string | null;
  instagram: string | null;
  phone: string | null;
  website: string | null;
  hasAnyContact: boolean;
}

/**
 * Retorna todos os contatos validados de um estabelecimento
 */
export const getValidatedContacts = (estabelecimento: {
  whatsapp?: string | null;
  telefone?: string | null;
  instagram?: string | null;
  site?: string | null;
  nome_fantasia?: string | null;
  categoria?: string[] | null;
}): ValidatedContacts => {
  const message = getWhatsAppMessage(
    estabelecimento.nome_fantasia || 'estabelecimento',
    estabelecimento.categoria
  );
  
  const whatsapp = getWhatsAppLink(
    estabelecimento.whatsapp || estabelecimento.telefone,
    message
  );
  
  const instagram = formatInstagram(estabelecimento.instagram);
  const phone = formatPhoneLink(estabelecimento.telefone);
  const website = formatWebsite(estabelecimento.site);
  
  return {
    whatsapp,
    instagram,
    phone,
    website,
    hasAnyContact: !!(whatsapp || instagram || phone || website)
  };
};
