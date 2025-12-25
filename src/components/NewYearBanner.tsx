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
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Московское время: 2026-01-01 00:00:00 MSK (UTC+3)
      const newYearMoscow = Date.UTC(2025, 11, 31, 21, 0, 0); // 31 декабря 2025 21:00 UTC = 1 января 2026 00:00 MSK
      const now = Date.now();
      const difference = newYearMoscow - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const [closed, setClosed] = useState(() => {
    return localStorage.getItem('newYearBannerClosed') === 'true';
  });

  if (closed || isExpired) return null;

  const handleClose = () => {
    setClosed(true);
    localStorage.setItem('newYearBannerClosed', 'true');
  };

  return (
    <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-green-700 text-white overflow-hidden shadow-2xl">
      {/* Анимированный фон */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      
      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl"></div>
        
        {/* Летающие иконки */}
        <div className="absolute top-4 left-[10%] text-5xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>🎄</div>
        <div className="absolute top-8 right-[15%] text-4xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}>⭐</div>
        <div className="absolute bottom-6 left-[20%] text-3xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }}>🎁</div>
        <div className="absolute top-1/2 right-[8%] text-5xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}>🎅</div>
        <div className="absolute bottom-8 right-[25%] text-4xl animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '3.2s' }}>❄️</div>
        <div className="absolute top-12 left-[45%] text-3xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '2.7s' }}>🔔</div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-10 relative z-10">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Заголовок */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-6xl animate-bounce" style={{ animationDuration: '1.5s' }}>🎄</div>
              <div>
                <h2 className="text-3xl md:text-5xl font-black mb-2 drop-shadow-2xl">
                  Новогодняя Распродажа!
                </h2>
                <div className="flex items-center justify-center gap-2 text-lg md:text-2xl">
                  <span className="inline-block px-4 py-2 bg-yellow-400 text-red-700 font-black rounded-full shadow-lg transform -rotate-2">
                    СКИДКА 20%
                  </span>
                  <span className="font-semibold">на все работы!</span>
                </div>
              </div>
              <div className="text-6xl animate-bounce" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }}>🎁</div>
            </div>
            
            <p className="text-base md:text-xl text-white/90 max-w-2xl leading-relaxed">
              Успейте скачать чертежи и 3D-модели со специальной новогодней скидкой! 
              Акция действует только до Нового Года! ⏰
            </p>
          </div>

          {/* Таймер */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl px-8 py-6 shadow-2xl border-4 border-yellow-300">
            <div className="text-red-700 font-bold text-sm md:text-base mb-3 uppercase tracking-wider">
              ⏰ До конца акции осталось:
            </div>
            <div className="flex gap-3 md:gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl px-4 py-3 md:px-6 md:py-4 shadow-lg min-w-[70px] md:min-w-[90px]">
                  <div className="text-3xl md:text-5xl font-black">{String(timeLeft.days).padStart(2, '0')}</div>
                </div>
                <div className="text-red-700 font-semibold text-xs md:text-sm mt-2">дней</div>
              </div>
              
              <div className="flex items-center">
                <div className="text-3xl md:text-5xl font-black text-red-700">:</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl px-4 py-3 md:px-6 md:py-4 shadow-lg min-w-[70px] md:min-w-[90px]">
                  <div className="text-3xl md:text-5xl font-black">{String(timeLeft.hours).padStart(2, '0')}</div>
                </div>
                <div className="text-green-700 font-semibold text-xs md:text-sm mt-2">часов</div>
              </div>
              
              <div className="flex items-center">
                <div className="text-3xl md:text-5xl font-black text-green-700">:</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl px-4 py-3 md:px-6 md:py-4 shadow-lg min-w-[70px] md:min-w-[90px]">
                  <div className="text-3xl md:text-5xl font-black">{String(timeLeft.minutes).padStart(2, '0')}</div>
                </div>
                <div className="text-red-700 font-semibold text-xs md:text-sm mt-2">минут</div>
              </div>
              
              <div className="flex items-center">
                <div className="text-3xl md:text-5xl font-black text-red-700">:</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl px-4 py-3 md:px-6 md:py-4 shadow-lg min-w-[70px] md:min-w-[90px]">
                  <div className="text-3xl md:text-5xl font-black">{String(timeLeft.seconds).padStart(2, '0')}</div>
                </div>
                <div className="text-green-700 font-semibold text-xs md:text-sm mt-2">секунд</div>
              </div>
            </div>
          </div>

          {/* Кнопка */}
          {onBuyPoints && (
            <Button
              onClick={onBuyPoints}
              size="lg"
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-red-700 font-black text-lg md:text-xl px-8 py-6 md:px-12 md:py-8 shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-white rounded-2xl"
            >
              <Icon name="Gift" size={28} className="mr-3" />
              <span>Получить скидку 20%</span>
              <Icon name="Sparkles" size={24} className="ml-3" />
            </Button>
          )}
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all hover:scale-110"
          aria-label="Закрыть баннер"
        >
          <Icon name="X" size={24} />
        </button>
      </div>
    </div>
  );
}