import Icon from '@/components/ui/icon';

interface LastPurchaseBadgeProps {
  minutesAgo: number;
}

export default function LastPurchaseBadge({ minutesAgo }: LastPurchaseBadgeProps) {
  if (minutesAgo > 30) return null;

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
      <Icon name="TrendingUp" size={12} />
      <span>Купили {minutesAgo}м назад</span>
    </div>
  );
}
