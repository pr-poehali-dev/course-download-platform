import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

interface PreviewData {
  work_id: string;
  title: string;
  description: string;
  composition: string[];
  preview_images: string[];
  preview_type: 'image' | 'text';
  message: string;
}

interface WorkPreviewModalProps {
  workId: string | null;
  workTitle?: string;
  open: boolean;
  onClose: () => void;
  onBuyClick?: () => void;
}

export default function WorkPreviewModal({ 
  workId, 
  workTitle,
  open, 
  onClose,
  onBuyClick 
}: WorkPreviewModalProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (open && workId) {
      fetchPreview();
    }
  }, [open, workId]);

  const fetchPreview = async () => {
    if (!workId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${func2url['work-preview']}?work_id=${workId}`
      );

      if (!response.ok) {
        throw new Error('Не удалось загрузить превью');
      }

      const data = await response.json();
      setPreviewData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки превью');
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (previewData && previewData.preview_images.length > 0) {
      setCurrentImageIndex((prev) => 
        (prev + 1) % previewData.preview_images.length
      );
    }
  };

  const prevImage = () => {
    if (previewData && previewData.preview_images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? previewData.preview_images.length - 1 : prev - 1
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Eye" size={24} className="text-primary" />
            Предпросмотр работы
          </DialogTitle>
          <DialogDescription>
            {workTitle || previewData?.title || 'Загрузка...'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Icon name="Loader2" size={48} className="animate-spin text-primary" />
              <p className="text-muted-foreground">Загрузка превью...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <Icon name="AlertCircle" size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">Ошибка</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {previewData && !loading && (
            <>
              {/* Информационное сообщение */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900">{previewData.message}</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Полная работа доступна после покупки
                  </p>
                </div>
              </div>

              {/* Превью изображений */}
              {previewData.preview_type === 'image' && previewData.preview_images.length > 0 && (
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden border shadow-lg bg-gray-50">
                    <img 
                      src={previewData.preview_images[currentImageIndex]}
                      alt={`Превью страницы ${currentImageIndex + 1}`}
                      className="w-full h-auto max-h-[600px] object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/800x1000?text=Превью+недоступно';
                      }}
                    />
                    
                    {/* Навигация по изображениям */}
                    {previewData.preview_images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                          <Icon name="ChevronLeft" size={24} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                          <Icon name="ChevronRight" size={24} />
                        </button>
                        
                        {/* Индикатор страниц */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {previewData.preview_images.length}
                        </div>
                      </>
                    )}
                    
                    {/* Водяной знак */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-xs">
                      ПРЕВЬЮ
                    </div>
                  </div>
                </div>
              )}

              {/* Текстовое превью (когда нет изображений) */}
              {previewData.preview_type === 'text' && (
                <div className="space-y-4">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-3">Описание работы</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {previewData.description}
                    </p>
                  </div>

                  {previewData.composition.length > 0 && (
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Icon name="FileText" size={20} />
                        Состав работы
                      </h3>
                      <ul className="space-y-2">
                        {previewData.composition.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Кнопки действий */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  <Icon name="X" className="mr-2 h-4 w-4" />
                  Закрыть
                </Button>
                <Button
                  onClick={() => {
                    onBuyClick?.();
                    onClose();
                  }}
                  className="flex-1"
                >
                  <Icon name="ShoppingCart" className="mr-2 h-4 w-4" />
                  Купить работу
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
