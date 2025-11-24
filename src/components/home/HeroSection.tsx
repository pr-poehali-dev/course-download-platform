import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface HeroSectionProps {
  onCatalogClick: () => void;
  onAuthClick: () => void;
  isLoggedIn: boolean;
}

export default function HeroSection({ onCatalogClick, onAuthClick, isLoggedIn }: HeroSectionProps) {
  return (
    <section className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-blue-100">
            <Icon name="Sparkles" size={16} className="text-blue-600" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Профессиональная платформа для студентов
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
            <span className="block text-gray-900 mb-2">Tech Forma</span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl">
              База референсных работ
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-semibold text-gray-700 max-w-2xl mx-auto">
            <span className="text-purple-600">500+ примеров работ</span> для ознакомления и изучения структуры
          </p>

          <div className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <Icon name="Gift" size={28} className="text-white" />
              <div className="text-left">
                <p className="text-white font-bold text-lg">1000 баллов в подарок</p>
                <p className="text-white/90 text-sm">Это 1000₽ на первые покупки 🔥</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button 
              onClick={onCatalogClick}
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg px-10 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              <Icon name="BookOpen" size={24} className="mr-2" />
              Смотреть каталог
            </Button>
            
            {!isLoggedIn && (
              <Button 
                onClick={onAuthClick}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-10 py-7 rounded-xl border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold"
              >
                <Icon name="Sparkles" size={24} className="mr-2" />
                Получить подарок
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}