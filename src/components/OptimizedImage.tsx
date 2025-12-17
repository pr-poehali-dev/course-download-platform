import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export default function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  loading = 'lazy',
  priority = false
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (priority) {
      setImageSrc(src);
    } else {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setHasError(true);
      };
    }
  }, [src, priority]);

  if (hasError) {
    return (
      <div 
        className={`bg-muted flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-muted-foreground text-sm">Изображение недоступно</span>
      </div>
    );
  }

  if (!imageSrc && !priority) {
    return (
      <div 
        className={`bg-muted animate-pulse ${className}`}
        style={{ width, height }}
      />
    );
  }

  return (
    <img
      src={imageSrc || src}
      alt={alt}
      className={`${className} ${!isLoaded && !priority ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
    />
  );
}
