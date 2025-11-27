import { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const SafeImage = ({ 
  src, 
  alt, 
  fallbackSrc = '/placeholder-estabelecimento.png',
  className,
  ...props 
}: SafeImageProps) => {
  const [error, setError] = useState(false);

  return (
    <img
      src={error ? fallbackSrc : src}
      alt={alt}
      onError={() => setError(true)}
      loading="lazy"
      className={className}
      {...props}
    />
  );
};
