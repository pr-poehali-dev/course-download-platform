import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface PreviewCarouselProps {
  images?: string[];
  previews?: string[];
  title?: string;
  className?: string;
  onError?: () => void;
}

export default function PreviewCarousel({ images, previews, title = '', className = '', onError }: PreviewCarouselProps) {
  const imageList = previews || images || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (!imageList || imageList.length === 0) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <Icon name="FileText" size={48} className="text-muted-foreground" />
      </div>
    );
  }

  const handleImageError = () => {
    setImageError(true);
    if (onError) onError();
  };

  if (imageError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <Icon name="FileText" size={48} className="text-muted-foreground" />
      </div>
    );
  }

  if (imageList.length === 1) {
    return (
      <img
        src={imageList[0]}
        alt={title}
        className={`object-cover ${className}`}
        loading="lazy"
        onError={handleImageError}
      />
    );
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div 
      className={`relative group ${className}`}
      onClick={(e) => {
        console.log('PreviewCarousel clicked, NOT stopping propagation');
      }}
    >
      <img
        src={imageList[currentIndex]}
        alt={`${title} - ${currentIndex + 1}`}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={handleImageError}
      />

      {imageList.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="Предыдущее изображение"
          >
            <Icon name="ChevronLeft" size={20} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="Следующее изображение"
          >
            <Icon name="ChevronRight" size={20} />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {imageList.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-white w-4'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
                aria-label={`Перейти к изображению ${idx + 1}`}
              />
            ))}
          </div>

          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
            {currentIndex + 1} / {imageList.length}
          </div>
        </>
      )}
    </div>
  );
}