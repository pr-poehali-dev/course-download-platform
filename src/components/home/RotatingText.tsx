import { useEffect, useState } from 'react';

const ROTATING_TEXTS = [
  '📚 Скачай готовую работу за 2 минуты',
  '💰 Продай свою работу — заработай баллы',
  '⚡ Мгновенный доступ после покупки',
  '✅ Проверенные работы от студентов',
  '🎓 Более 500 работ в каталоге',
  '🔒 Безопасные платежи',
];

export default function RotatingText() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ROTATING_TEXTS.length);
        setIsVisible(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-12 sm:h-16 flex items-center justify-center overflow-hidden">
      <p 
        className={`text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        {ROTATING_TEXTS[currentIndex]}
      </p>
    </div>
  );
}
