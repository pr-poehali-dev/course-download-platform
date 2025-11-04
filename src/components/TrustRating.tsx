import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TrustRatingProps {
  rating: number;
  purchaseCount?: number;
  isHit?: boolean;
  isNew?: boolean;
  compact?: boolean;
}

interface TrustScore {
  score: number;
  level: 'elite' | 'verified' | 'good' | 'new';
  label: string;
  color: string;
  icon: string;
  description: string;
}

function calculateTrustScore(
  rating: number,
  purchaseCount: number = 0,
  isHit: boolean = false,
  isNew: boolean = false
): TrustScore {
  let score = 0;
  
  score += rating * 1.5;
  
  if (purchaseCount > 0) {
    if (purchaseCount >= 100) score += 3.0;
    else if (purchaseCount >= 50) score += 2.5;
    else if (purchaseCount >= 20) score += 2.0;
    else if (purchaseCount >= 10) score += 1.5;
    else score += purchaseCount * 0.15;
  }
  
  if (isHit) score += 1.5;
  
  if (isNew) score += 0.5;
  
  score = Math.min(score, 10);
  score = Math.max(score, 0);
  
  if (score >= 9.0) {
    return {
      score: Number(score.toFixed(1)),
      level: 'elite',
      label: 'Элитная работа',
      color: 'from-yellow-400 to-orange-500',
      icon: 'Award',
      description: 'Проверена временем, отличные отзывы'
    };
  } else if (score >= 7.5) {
    return {
      score: Number(score.toFixed(1)),
      level: 'verified',
      label: 'Проверенная',
      color: 'from-green-400 to-emerald-500',
      icon: 'ShieldCheck',
      description: 'Надёжная работа с хорошей репутацией'
    };
  } else if (score >= 6.0) {
    return {
      score: Number(score.toFixed(1)),
      level: 'good',
      label: 'Хорошая работа',
      color: 'from-blue-400 to-cyan-500',
      icon: 'ThumbsUp',
      description: 'Качественная работа'
    };
  } else {
    return {
      score: Number(score.toFixed(1)),
      level: 'new',
      label: 'Новая работа',
      color: 'from-purple-400 to-pink-500',
      icon: 'Sparkles',
      description: 'Недавно добавлена в каталог'
    };
  }
}

export default function TrustRating({ 
  rating, 
  purchaseCount = 0, 
  isHit = false, 
  isNew = false,
  compact = false 
}: TrustRatingProps) {
  const trustScore = calculateTrustScore(rating, purchaseCount, isHit, isNew);
  
  const progressPercentage = (trustScore.score / 10) * 100;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 cursor-help">
              <Icon name={trustScore.icon as any} size={14} className={`bg-gradient-to-r ${trustScore.color} bg-clip-text text-transparent`} />
              <span className="text-xs font-bold">{trustScore.score}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${trustScore.color} flex items-center justify-center`}>
                  <Icon name={trustScore.icon as any} size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{trustScore.label}</p>
                  <p className="text-xs text-muted-foreground">{trustScore.description}</p>
                </div>
              </div>
              <div className="pt-2 border-t space-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <Icon name="Star" size={12} className="text-yellow-500" />
                  <span>Рейтинг: {rating.toFixed(1)}/5.0</span>
                </div>
                {purchaseCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Icon name="ShoppingBag" size={12} className="text-green-500" />
                    <span>{purchaseCount} покупок</span>
                  </div>
                )}
                {isHit && (
                  <div className="flex items-center gap-1.5">
                    <Icon name="Flame" size={12} className="text-orange-500" />
                    <span>Хит продаж</span>
                  </div>
                )}
                {isNew && (
                  <div className="flex items-center gap-1.5">
                    <Icon name="Sparkles" size={12} className="text-purple-500" />
                    <span>Новинка</span>
                  </div>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${trustScore.color} flex items-center justify-center shadow-lg`}>
            <Icon name={trustScore.icon as any} size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">{trustScore.label}</p>
            <p className="text-xs text-muted-foreground">{trustScore.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold bg-gradient-to-r ${trustScore.color} bg-clip-text text-transparent`}>
            {trustScore.score}
          </p>
          <p className="text-xs text-muted-foreground">из 10</p>
        </div>
      </div>

      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${trustScore.color} rounded-full transition-all duration-500`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Icon name="Star" size={14} className="text-yellow-500" />
          <span>Рейтинг: <span className="font-semibold text-foreground">{rating.toFixed(1)}</span></span>
        </div>
        {purchaseCount > 0 && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Icon name="ShoppingBag" size={14} className="text-green-500" />
            <span><span className="font-semibold text-foreground">{purchaseCount}</span> покупок</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {isHit && (
          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200">
            <Icon name="Flame" size={12} className="mr-1" />
            Хит продаж
          </Badge>
        )}
        {isNew && (
          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
            <Icon name="Sparkles" size={12} className="mr-1" />
            Новинка
          </Badge>
        )}
        {trustScore.level === 'elite' && (
          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200">
            <Icon name="Award" size={12} className="mr-1" />
            Топ выбор
          </Badge>
        )}
      </div>
    </div>
  );
}
