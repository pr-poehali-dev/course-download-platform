import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';

interface DiscountProgressBarProps {
  currentPoints: number;
}

export default function DiscountProgressBar({ currentPoints }: DiscountProgressBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  const THRESHOLDS = [
    { points: 100, discount: 5, label: 'Скидка 5%' },
    { points: 600, discount: 10, label: 'Скидка 10%' },
    { points: 1500, discount: 15, label: 'Скидка 15%' },
  ];

  const nextThreshold = THRESHOLDS.find(t => currentPoints < t.points);
  
  useEffect(() => {
    if (currentPoints > 0 && currentPoints < 1500) {
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, [currentPoints]);

  if (!isVisible || !nextThreshold) return null;

  const progress = (currentPoints / nextThreshold.points) * 100;
  const remaining = nextThreshold.points - currentPoints;

  return (
    <div 
      className="fixed bottom-24 right-6 z-40 bg-white rounded-2xl shadow-2xl p-4 max-w-xs border-2 border-purple-200 animate-slide-in-right"
      style={{
        animation: 'slideInRight 0.5s ease-out'
      }}
    >
      <button
        onClick={() => setIsVisible(false)}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
      >
        <Icon name="X" size={14} />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
          <Icon name="Gift" size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">
            {nextThreshold.label}
          </p>
          <p className="text-xs text-gray-600">
            Ещё {remaining} баллов
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
        <div 
          className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-500 relative"
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-pulse" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{currentPoints} баллов</span>
        <span className="font-bold text-purple-600">{nextThreshold.points}</span>
      </div>

      <button
        onClick={() => {
          window.location.href = '/profile';
        }}
        className="w-full mt-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg py-2 text-sm font-semibold hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
      >
        <Icon name="Zap" size={16} />
        Пополнить баланс
      </button>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
