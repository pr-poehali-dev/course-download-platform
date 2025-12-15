import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface NewYearBannerProps {
  onBuyPoints?: () => void;
}

export default function NewYearBanner({ onBuyPoints }: NewYearBannerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const newYear = new Date('2025-01-01T00:00:00').getTime();
      const now = new Date().getTime();
      const difference = newYear - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const [closed, setClosed] = useState(() => {
    return localStorage.getItem('newYearBannerClosed') === 'true';
  });

  if (closed) return null;

  const handleClose = () => {
    setClosed(true);
    localStorage.setItem('newYearBannerClosed', 'true');
  };

  return (
    <div className="relative bg-gradient-to-r from-red-600 via-green-600 to-red-600 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-10 text-4xl animate-pulse">🎄</div>
        <div className="absolute top-4 right-20 text-3xl animate-bounce">⭐</div>
        <div className="absolute bottom-3 left-1/4 text-2xl animate-pulse">🎁</div>
        <div className="absolute top-1/2 right-10 text-4xl animate-bounce">🎅</div>
        <div className="absolute bottom-4 right-1/3 text-3xl animate-pulse">❄️</div>
      </div>

      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-4xl animate-bounce">🎄</div>
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold mb-1">
                🎉 Новогодняя распродажа! 🎉
              </h3>
              <p className="text-sm md:text-base opacity-90">
                Скидка <span className="font-bold text-yellow-300">20%</span> на все работы до Нового Года!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
              <div className="text-xs opacity-80 mb-1">До конца акции:</div>
              <div className="flex gap-2 font-mono text-lg font-bold">
                <span>{String(timeLeft.days).padStart(2, '0')}д</span>
                <span>:</span>
                <span>{String(timeLeft.hours).padStart(2, '0')}ч</span>
                <span>:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}м</span>
                <span>:</span>
                <span>{String(timeLeft.seconds).padStart(2, '0')}с</span>
              </div>
            </div>

            {onBuyPoints && (
              <Button
                onClick={onBuyPoints}
                className="bg-yellow-400 hover:bg-yellow-500 text-red-700 font-bold shadow-lg hover:scale-105 transition-transform"
              >
                <Icon name="Gift" size={18} className="mr-2" />
                Получить скидку
              </Button>
            )}
          </div>

          <button
            onClick={handleClose}
            className="absolute top-2 right-2 md:relative md:top-0 md:right-0 text-white/80 hover:text-white transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
