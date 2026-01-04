/**
 * Módulo de validação compartilhado para Edge Functions
 * Contém validadores reutilizáveis para garantir segurança e integridade dos dados
 */

// Regex para validação de UUID v4
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Regex para validação de email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regex para validação de Stripe Price ID
const STRIPE_PRICE_REGEX = /^price_[a-zA-Z0-9]+$/;

/**
 * Valida se uma string é um UUID v4 válido
 */
export function isValidUUID(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return UUID_REGEX.test(id);
}

/**
 * Valida se uma string é um email válido
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 255) return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

/**
 * Valida coordenadas de latitude e longitude
 * @param lat Latitude (-90 a 90)
 * @param lng Longitude (-180 a 180)
 */
export function isValidLatLng(lat: number, lng: number): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

/**
 * Valida requisitos de senha forte
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos um caractere especial
 */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Senha é obrigatória' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Senha deve ter no mínimo 8 caracteres' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos um caractere especial' };
  }
  
  return { valid: true };
}

/**
 * Valida se um valor numérico está dentro de um range
 */
export function isValidNumericRange(
  value: number,
  min: number,
  max: number
): boolean {
  if (typeof value !== 'number' || isNaN(value)) return false;
  return value >= min && value <= max;
}

/**
 * Valida e sanitiza mensagens de chat
 * Remove caracteres perigosos e limita tamanho
 */
export function sanitizeChatMessage(message: string, maxLength: number = 500): string | null {
  if (!message || typeof message !== 'string') return null;
  
  const trimmed = message.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > maxLength) return null;
  
  // Remove caracteres de controle mas mantém emojis e acentos
  return trimmed
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, maxLength);
}

/**
 * Valida se um Stripe Price ID é válido
 */
export function isValidStripePriceId(priceId: string): boolean {
  if (!priceId || typeof priceId !== 'string') return false;
  return STRIPE_PRICE_REGEX.test(priceId);
}

/**
 * Valida tipo de pagamento
 */
export function isValidPaymentType(type: string): boolean {
  return type === 'subscription' || type === 'onetime';
}

/**
 * Sanitiza string de endereço para geocodificação
 * Remove caracteres perigosos e limita tamanho
 */
export function sanitizeAddress(address: string, maxLength: number = 300): string | null {
  if (!address || typeof address !== 'string') return null;
  
  const sanitized = address
    .trim()
    .replace(/[<>'"`;\\]/g, '')  // Remove caracteres perigosos
    .replace(/--/g, '')           // Remove comentários SQL
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .slice(0, maxLength);
  
  if (sanitized.length < 3) return null;  // Endereço muito curto
  
  return sanitized;
}

/**
 * Sanitiza termo de busca
 */
export function sanitizeSearchTerm(term: string, maxLength: number = 100): string {
  if (!term || typeof term !== 'string') return '';
  
  return term
    .trim()
    .replace(/[<>'"`;\\]/g, '')
    .replace(/--/g, '')
    .slice(0, maxLength);
}

/**
 * Valida e sanitiza nome
 * Remove caracteres especiais mas mantém acentos
 */
export function sanitizeName(name: string, maxLength: number = 100): string | null {
  if (!name || typeof name !== 'string') return null;
  
  const sanitized = name
    .trim()
    .replace(/[<>'"`;\\0-9]/g, '')  // Remove caracteres perigosos e números
    .replace(/\s+/g, ' ')            // Normaliza espaços
    .slice(0, maxLength);
  
  if (sanitized.length < 2) return null;  // Nome muito curto
  
  return sanitized;
}

/**
 * Log de evento de segurança padronizado
 */
export function logSecurityEvent(
  eventType: string,
  details: Record<string, unknown>,
  severity: 'info' | 'warn' | 'error' = 'info'
): void {
  const logFn = severity === 'error' ? console.error : 
                severity === 'warn' ? console.warn : 
                console.log;
  
  logFn(`[SECURITY:${severity.toUpperCase()}] ${eventType}`, JSON.stringify(details));
}
