/**
 * Utilitários para gerenciamento seguro de Storage
 */

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
const TAMANHO_MAXIMO = 50 * 1024 * 1024; // 50MB (sistema comprime automaticamente)

export interface ValidacaoArquivo {
  valido: boolean;
  erro?: string;
}

/**
 * Valida tipo e tamanho de arquivo de imagem
 */
export const validarArquivo = (file: File): ValidacaoArquivo => {
  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return { 
      valido: false, 
      erro: 'Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.' 
    };
  }
  
  if (file.size > TAMANHO_MAXIMO) {
    return { 
      valido: false, 
      erro: 'Arquivo muito grande. Máximo 5MB.' 
    };
  }
  
  return { valido: true };
};

/**
 * Gera nome único e seguro para arquivos
 */
export const gerarNomeSeguro = (
  userId: string, 
  tipo: 'avatar' | 'estabelecimento' | 'logo',
  extensao: string = 'jpg'
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${tipo}_${userId}_${timestamp}_${random}.${extensao}`;
};

/**
 * Extrai extensão do arquivo
 */
export const extrairExtensao = (fileName: string): string => {
  const partes = fileName.split('.');
  return partes[partes.length - 1].toLowerCase();
};

/**
 * Converte tipo MIME para extensão
 */
export const mimeParaExtensao = (mimeType: string): string => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[mimeType] || 'jpg';
};
