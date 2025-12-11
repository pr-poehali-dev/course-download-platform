import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';

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
  yandexDiskLink: string | null;
  purchaseCount?: number;
  isHit?: boolean;
  isNew?: boolean;
  discount?: number;
  pageCount?: number;
  fileCount?: number;
  authorId?: number | null;
  views?: number;
  downloads?: number;
  reviewsCount?: number;
}

interface CatalogWorkCardProps {
  work: Work;
  isAdmin: boolean;
  isFavorite: boolean;
  userDiscount: number;
  onToggleFavorite: (workId: string) => void;
  onNavigate: (workId: string) => void;
}

export default function CatalogWorkCard({
  work,
  isAdmin,
  isFavorite,
  userDiscount,
  onToggleFavorite,
  onNavigate
}: CatalogWorkCardProps) {
  const cardContent = (
    <>
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/3] overflow-hidden">
        {work.previewUrl || (work.previewUrls && work.previewUrls.length > 0) ? (
          <>
            <img 
              src={work.previewUrl || work.previewUrls?.[0] || ''} 
              alt={work.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </>
        ) : (
          <div className="w-full h-full relative">
            <img 
              src="https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/e0139de0-3660-402a-8d29-d07f5dac95b3.jpg"
              alt={work.workType}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-4">
              <span className="text-sm font-semibold text-white drop-shadow-lg">{work.workType}</span>
            </div>
          </div>
        )}
        
        <div className="absolute top-3 left-3 z-10 pointer-events-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(work.id);
            }}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110"
          >
            <Icon
              name="Heart"
              size={18}
              className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}
            />
          </button>
        </div>
        
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2 pointer-events-none">
          {work.discount && (
            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              −{work.discount}%
            </div>
          )}
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
          {(work.authorId === 999999 || work.authorId === null) && (
            <Badge className="bg-green-600 text-white shadow-lg">
              🛡️ Официальная
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold">{work.rating.toFixed(1)}</span>
          </div>
          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
            {work.workType}
          </Badge>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="font-bold text-sm md:text-[15px] mb-2 line-clamp-2 leading-snug min-h-[42px] group-hover:text-primary transition-colors cursor-help">
              {work.title.charAt(0).toUpperCase() + work.title.slice(1)}
            </h3>
          </TooltipTrigger>
          <TooltipContent className="max-w-md">
            <p>{work.title.charAt(0).toUpperCase() + work.title.slice(1)}</p>
          </TooltipContent>
        </Tooltip>

        <p className="text-xs text-gray-600 line-clamp-2 mb-3 min-h-[32px] leading-relaxed">
          {work.description}
        </p>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Icon name="Package" size={14} className="text-blue-600" />
            <span className="line-clamp-1">{work.composition}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Icon name="Tag" size={14} className="text-purple-600" />
            <span className="font-medium">{work.subject}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            {(work.discount || userDiscount > 0) ? (
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 line-through">{work.price} б.</span>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-green-600">{Math.round(work.price * (1 - (work.discount || userDiscount) / 100))} б.</span>
                  <span className="text-xs text-gray-500">({Math.round(work.price * (1 - (work.discount || userDiscount) / 100)) * 5}₽)</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">{work.price} б.</span>
                <span className="text-xs text-gray-500">({work.price * 5}₽)</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {isAdmin && work.yandexDiskLink && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const encodedUrl = encodeURI(work.yandexDiskLink!);
                  window.open(encodedUrl, '_blank', 'noopener,noreferrer');
                }}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Icon name="Download" size={14} className="mr-1" />
                Скачать
              </Button>
            )}
            {!isAdmin && (
              <div className="text-sm font-semibold text-blue-600 flex items-center gap-1.5">
                <Icon name="ArrowRight" size={16} />
                Купить
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
  
  return isAdmin ? (
    <div
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        onNavigate(work.id);
      }}
      className="group glass-card tech-border rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
    >
      {cardContent}
    </div>
  ) : (
    <Link
      to={`/work/${work.id}`}
      className="group glass-card tech-border rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] block"
    >
      {cardContent}
    </Link>
  );
}
