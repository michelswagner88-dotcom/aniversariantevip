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
