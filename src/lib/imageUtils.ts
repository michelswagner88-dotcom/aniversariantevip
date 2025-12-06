/**
 * Image Optimization Utilities
 * Functions for WebP conversion, srcset generation, and responsive images
 */

/**
 * Gera URL otimizada baseado no provider de imagens
 */
export const getOptimizedImageUrl = (
  url: string, 
  width: number, 
  options: {
    format?: 'webp' | 'jpeg' | 'png';
    quality?: number;
  } = {}
): string => {
  if (!url) return '';
  
  const { format = 'webp', quality = 80 } = options;
  
  // Se for Supabase Storage
  if (url.includes('supabase.co') || url.includes('supabase.in')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&format=${format}&quality=${quality}`;
  }
  
  // Se for Cloudinary
  if (url.includes('cloudinary.com')) {
    const formatStr = format === 'webp' ? 'f_webp' : format === 'png' ? 'f_png' : 'f_jpg';
    return url.replace('/upload/', `/upload/w_${width},${formatStr},q_${quality}/`);
  }
  
  // Se for Google Places
  if (url.includes('googleusercontent.com') || url.includes('places.googleapis.com')) {
    if (url.includes('maxwidth=')) {
      return url.replace(/maxwidth=\d+/, `maxwidth=${width}`);
    }
    return `${url}${url.includes('?') ? '&' : '?'}maxwidth=${width}`;
  }
  
  // URL genérica - retorna como está
  return url;
};

/**
 * Gera srcset para diferentes tamanhos de tela
 */
export const generateSrcSet = (
  src: string, 
  format: 'webp' | 'jpeg' = 'webp',
  widths: number[] = [320, 480, 640, 800, 1024, 1280]
): string => {
  return widths
    .map(w => `${getOptimizedImageUrl(src, w, { format })} ${w}w`)
    .join(', ');
};

/**
 * Retorna URL de imagem em baixa qualidade para placeholder (LQIP)
 */
export const getLqipUrl = (url: string): string => {
  return getOptimizedImageUrl(url, 20, { format: 'jpeg', quality: 30 });
};

/**
 * Detecta se navegador suporta WebP
 */
export const checkWebPSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
    const img = new Image();
    
    img.onload = () => resolve(img.width > 0 && img.height > 0);
    img.onerror = () => resolve(false);
    img.src = webpData;
  });
};

/**
 * Retorna placeholder baseado na categoria do estabelecimento
 */
export const getCategoryPlaceholder = (categoria?: string | string[] | null): string => {
  const cat = Array.isArray(categoria) ? categoria[0]?.toLowerCase() : categoria?.toLowerCase();
  
  const placeholders: Record<string, string> = {
    restaurante: '/images/placeholders/restaurante.jpg',
    bar: '/images/placeholders/bar.jpg',
    academia: '/images/placeholders/academia.jpg',
    'salão de beleza': '/images/placeholders/salao.jpg',
    barbearia: '/images/placeholders/barbearia.jpg',
    cafeteria: '/images/placeholders/cafeteria.jpg',
    confeitaria: '/images/placeholders/confeitaria.jpg',
    sorveteria: '/images/placeholders/sorveteria.jpg',
    loja: '/images/placeholders/loja.jpg',
    hospedagem: '/images/placeholders/hospedagem.jpg',
    entretenimento: '/images/placeholders/entretenimento.jpg',
    'saúde e suplementos': '/images/placeholders/saude.jpg',
    serviços: '/images/placeholders/servicos.jpg',
  };
  
  return placeholders[cat || ''] || '/placeholder-estabelecimento.png';
};

/**
 * Valida se URL é uma imagem válida
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  // Verifica se é uma URL válida
  try {
    new URL(url);
  } catch {
    return false;
  }
  
  // Verifica extensões comuns de imagem ou URLs de CDN conhecidos
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?|$)/i;
  const imageCDNs = /(supabase|cloudinary|googleusercontent|unsplash|imgix|places\.googleapis)/i;
  
  return imageExtensions.test(url) || imageCDNs.test(url);
};

/**
 * Processa uma imagem e a converte para formato quadrado automaticamente
 * Recorta o centro da imagem e redimensiona para o tamanho especificado
 * @param file - Arquivo de imagem original
 * @param tamanhoFinal - Tamanho do quadrado final (padrão: 400x400)
 * @param quality - Qualidade da compressão (0-1)
 * @returns Promise com a imagem processada em base64
 */
export const processarImagemQuadrada = (
  file: File,
  tamanhoFinal: number = 400,
  quality: number = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Criar canvas quadrado
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Não foi possível criar contexto do canvas'));
          return;
        }
        
        // Tamanho final (quadrado)
        canvas.width = tamanhoFinal;
        canvas.height = tamanhoFinal;
        
        // Calcular recorte centralizado (pegar o centro da imagem)
        const menorLado = Math.min(img.width, img.height);
        const offsetX = (img.width - menorLado) / 2;
        const offsetY = (img.height - menorLado) / 2;
        
        // Desenhar imagem recortada e redimensionada
        ctx.drawImage(
          img,
          offsetX, offsetY,           // Ponto inicial do recorte (centralizado)
          menorLado, menorLado,       // Tamanho do recorte (quadrado)
          0, 0,                        // Posição no canvas
          tamanhoFinal, tamanhoFinal   // Tamanho final
        );
        
        // Converter para base64 com compressão
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };
      
      img.onerror = () => {
        reject(new Error('Erro ao carregar a imagem'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Converte uma string base64 para Blob
 * @param dataURL - String base64 da imagem
 * @returns Blob da imagem
 */
export const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Redimensiona uma imagem mantendo o aspect ratio
 * @param file - Arquivo de imagem original
 * @param maxWidth - Largura máxima em pixels
 * @param maxHeight - Altura máxima em pixels
 * @param quality - Qualidade da compressão (0-1)
 * @returns Promise com o arquivo redimensionado
 */
export const resizeImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.85
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular novas dimensões mantendo aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        // Criar canvas para redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível criar contexto do canvas'));
          return;
        }
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Não foi possível processar a imagem'));
              return;
            }
            
            // Criar novo File com o blob redimensionado
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(resizedFile);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Erro ao carregar a imagem'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };
    
    reader.readAsDataURL(file);
  });
};
