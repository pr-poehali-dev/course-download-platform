import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import PreviewCarousel from '@/components/PreviewCarousel';
import { getFakeAuthor, getViewCount, incrementViewCount } from '@/utils/fakeAuthors';

interface Work {
  id: string;
  folderName: string;
  title: string;
  workType: string;
  subject: string;
  description: string;
  composition: string;
  universities: string | null;
  price: number;
  rating: number;
  previewUrl: string | null;
  previewUrls?: string[];
  cover_images?: string[];
  yandexDiskLink?: string;
  purchaseCount?: number;
  isHit?: boolean;
  isNew?: boolean;
  discount?: number;
  pageCount?: number;
  fileCount?: number;
}

interface WorkCardProps {
  work: Work;
  onQuickView: (work: Work) => void;
  onAddToFavorite: (workId: string) => void;
  isFavorite: boolean;
  onPreview?: (workId: string) => void;
  isAdmin?: boolean;
}

export default function WorkCard({ work, onQuickView, onAddToFavorite, isFavorite, onPreview, isAdmin = false }: WorkCardProps) {
  const [imageError, setImageError] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const coverImages = work.cover_images && work.cover_images.length > 0 ? work.cover_images : work.previewUrls;
  const hasPreview = coverImages && coverImages.length > 0 && !imageError;
  
  const finalPrice = work.discount 
    ? work.price * (1 - work.discount / 100) 
    : work.price;

  const author = getFakeAuthor(work.id);

  useEffect(() => {
    setViewCount(getViewCount(work.id));
  }, [work.id]);

  const handleBuyClick = () => {
    window.location.href = `/work/${work.id}`;
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300">
      {work.discount && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          −{work.discount}%
        </div>
      )}
      
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        {work.isNew && (
          <Badge className="bg-green-500 text-white shadow-lg">
            <Icon name="Sparkles" size={12} className="mr-1" />
            Новинка
          </Badge>
        )}
        {work.isHit && (
          <Badge className="bg-orange-500 text-white shadow-lg">
            <Icon name="Flame" size={12} className="mr-1" />
            Хит
          </Badge>
        )}
      </div>

      <button
        onClick={() => onAddToFavorite(work.id)}
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100"
        style={{ right: work.isNew || work.isHit ? '120px' : '12px' }}
      >
        <Icon 
          name={isFavorite ? "Heart" : "Heart"} 
          size={18}
          className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}
        />
      </button>

      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {hasPreview ? (
          <PreviewCarousel 
            previews={coverImages!} 
            onError={() => setImageError(true)}
            className="h-full w-full"
          />
        ) : (
          <div className="h-full relative">
            <img 
              src="https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/e0139de0-3660-402a-8d29-d07f5dac95b3.jpg"
              alt={work.workType}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-6">
              <p className="text-sm text-white font-semibold drop-shadow-lg">{work.workType}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={() => onQuickView(work)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <div className="text-white text-center">
            <Icon name="Eye" size={32} className="mx-auto mb-2" />
            <span className="text-sm font-semibold">Быстрый просмотр</span>
          </div>
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary" className="text-xs font-medium shrink-0">
            {work.workType}
          </Badge>
          {work.rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
              <Icon name="Star" size={14} className="fill-amber-400 text-amber-400" />
              {work.rating.toFixed(1)}
            </div>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] text-base leading-tight group-hover:text-blue-600 transition-colors">
          {work.title}
        </h3>

        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
          <Icon name="User" size={12} className="text-blue-500" />
          <span>{author}</span>
          <span className="mx-1">•</span>
          <Icon name="Eye" size={12} className="text-gray-400" />
          <span>{viewCount} просм.</span>
        </div>

        <div className="space-y-2 mb-3 text-xs text-gray-600">
          {work.subject && (
            <div className="flex items-center gap-2">
              <Icon name="BookOpen" size={14} className="text-blue-500 shrink-0" />
              <span className="capitalize">{work.subject}</span>
            </div>
          )}
          {work.composition && (
            <div className="flex items-center gap-2">
              <Icon name="Package" size={14} className="text-green-500 shrink-0" />
              <span>{work.composition}</span>
            </div>
          )}
          {work.universities && (
            <div className="flex items-center gap-2">
              <Icon name="Building2" size={14} className="text-purple-500 shrink-0" />
              <span className="truncate">{work.universities}</span>
            </div>
          )}
        </div>

        {(work.pageCount || work.fileCount) && (
          <div className="flex gap-3 mb-3 text-xs text-gray-500">
            {work.pageCount && (
              <div className="flex items-center gap-1">
                <Icon name="FileText" size={12} />
                <span>{work.pageCount} стр.</span>
              </div>
            )}
            {work.fileCount && (
              <div className="flex items-center gap-1">
                <Icon name="Files" size={12} />
                <span>{work.fileCount} файлов</span>
              </div>
            )}
          </div>
        )}

        {work.purchaseCount !== undefined && work.purchaseCount > 0 && (
          <div className="flex items-center gap-2 mb-3 py-2 px-3 bg-green-50 border border-green-200 rounded-lg">
            <Icon name="ShoppingCart" size={14} className="text-green-600" />
            <span className="text-xs text-green-700 font-medium">
              Купили {work.purchaseCount} {work.purchaseCount === 1 ? 'студент' : work.purchaseCount < 5 ? 'студента' : 'студентов'}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            {work.discount ? (
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 line-through">{work.price} баллов</span>
                <span className="text-2xl font-bold text-green-600">{Math.round(finalPrice)} баллов</span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-900">{work.price} баллов</span>
            )}
          </div>
          <div className="flex gap-2">
            {isAdmin && work.yandexDiskLink && (
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const encodedUrl = encodeURI(work.yandexDiskLink!);
                  window.open(encodedUrl, '_blank');
                }}
                variant="outline"
                size="sm"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Icon name="Download" className="h-4 w-4 mr-1" />
                Скачать
              </Button>
            )}
            {onPreview && (
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(work.id);
                }}
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Icon name="Eye" className="h-4 w-4 mr-1" />
                Превью
              </Button>
            )}
            {!isAdmin && (
              <Button 
                onClick={handleBuyClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6"
              >
                Купить
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-xs text-green-600 font-medium">
            <Icon name="ShieldCheck" size={14} />
            <span>Гарантия возврата 7 дней</span>
          </div>
        </div>
      </div>
    </div>
  );
}