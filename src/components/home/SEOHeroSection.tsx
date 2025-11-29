import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface SEOHeroSectionProps {
  onCatalogClick: () => void;
}

export default function SEOHeroSection({ onCatalogClick }: SEOHeroSectionProps) {
  return (
    <section className="w-full py-12 sm:py-20 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-gray-900">
            Техническая библиотека<br />
            <span className="text-primary">для инженеров и студентов</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Чертежи, 3D-модели, примеры расчётов и проектная документация
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <Button size="lg" className="px-8 h-12 text-base font-medium" onClick={onCatalogClick}>
              Смотреть каталог
            </Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-base font-medium" asChild>
              <a href="#categories">
                Категории материалов
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 max-w-3xl mx-auto">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-primary mb-1">500+</div>
              <div className="text-sm text-gray-500">Материалов</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-primary mb-1">CAD</div>
              <div className="text-sm text-gray-500">Чертежи</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-primary mb-1">3D</div>
              <div className="text-sm text-gray-500">Модели</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-gray-500">Доступ</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}