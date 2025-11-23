import { useState, useEffect } from 'react';

const phrases = [
  'Курсовую работу за 2 минуты',
  'Дипломную работу за 2 минуты',
  'Реферат за 2 минуты',
  'Отчёт по практике за 2 минуты',
  'Контрольную работу за 2 минуты',
  'Лабораторную работу за 2 минуты'
];

export default function AnimatedHeroText() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 px-4 min-h-[60px] sm:min-h-[80px] flex items-center justify-center">
      <span
        className={`bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent transition-all duration-500 ${
          isAnimating ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'
        }`}
      >
        {phrases[currentIndex]}
      </span>
    </h3>
  );
}
