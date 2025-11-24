import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function ExitIntentModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('user');
    if (isLoggedIn) {
      setHasShown(true);
      return;
    }

    const lastShown = localStorage.getItem('exit_intent_shown');
    if (lastShown) {
      const hoursSinceShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60);
      if (hoursSinceShown < 24) {
        setHasShown(true);
        return;
      }
    }

    const timeOnPage = Date.now();
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (hasShown) return;
      
      const timeSpent = Date.now() - timeOnPage;
      if (timeSpent < 30000) return;
      
      if (e.clientY <= 0) {
        setIsVisible(true);
        setHasShown(true);
        localStorage.setItem('exit_intent_shown', Date.now().toString());
      }
    };

    setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 30000);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-8 animate-slide-up"
        style={{
          animation: 'slideUp 0.4s ease-out'
        }}
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="X" size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <Icon name="Gift" size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-gray-900">
            Получите 1000 баллов! 🎁
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Зарегистрируйтесь прямо сейчас
          </p>
          <p className="text-sm text-gray-500">
            Это <span className="font-bold text-green-600">1000₽ в подарок</span> — получите доступ к материалам бесплатно!
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Icon name="Clock" size={24} className="text-green-600 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              Доступ к работе за 2 минуты после покупки
            </span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Icon name="Shield" size={24} className="text-blue-600 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              Возврат баллов в течение 24 часов, если не подошла работа
            </span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Icon name="Zap" size={24} className="text-purple-600 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              Бонусные баллы до +700 при покупке пакетов
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => {
              setIsVisible(false);
              window.location.href = '/profile';
            }}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold h-12"
          >
            <Icon name="Gift" size={18} className="mr-2" />
            Пополнить баланс
          </Button>
          <Button
            onClick={() => setIsVisible(false)}
            variant="outline"
            className="flex-1 h-12"
          >
            Может позже
          </Button>
        </div>

        <p className="text-xs text-center text-gray-400 mt-4">
          Бонусные баллы начисляются автоматически при покупке пакетов
        </p>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}