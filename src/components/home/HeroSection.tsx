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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Онлайн: 127 студентов</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Готовые студенческие работы
            </span>
            <br />
            <span className="text-gray-800">за 2 минуты</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Более <strong>500 проверенных работ</strong> по всем предметам. 
            Мгновенный доступ после покупки.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {!isLoggedIn ? (
              <>
                <Button 
                  onClick={onAuthClick}
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Icon name="Gift" size={24} className="mr-2" />
                  Получить 1000 баллов в подарок
                </Button>
                
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={onCatalogClick}
                  className="w-full sm:w-auto text-base sm:text-lg px-8 py-6 rounded-xl border-2 hover:bg-gray-50"
                >
                  <Icon name="Search" size={20} className="mr-2" />
                  Посмотреть работы
                </Button>
              </>
            ) : (
              <Button 
                onClick={onCatalogClick}
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Icon name="Search" size={24} className="mr-2" />
                Смотреть каталог
              </Button>
            )}
          </div>

          {!isLoggedIn && (
            <div className="pt-4">
              <p className="text-sm text-gray-500">
                🎁 <strong>1000 баллов (5000₽)</strong> за регистрацию — купите первую работу бесплатно
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Icon name="Clock" size={24} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">2 мин</p>
              <p className="text-xs sm:text-sm text-gray-600">Доступ к работе</p>
            </div>

            <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Icon name="FileCheck" size={24} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">500+</p>
              <p className="text-xs sm:text-sm text-gray-600">Готовых работ</p>
            </div>

            <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Icon name="Users" size={24} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">Растём</p>
              <p className="text-xs sm:text-sm text-gray-600">Сообщество студентов</p>
            </div>

            <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
                <Icon name="Shield" size={24} className="text-pink-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">100%</p>
              <p className="text-xs sm:text-sm text-gray-600">Гарантия возврата</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}