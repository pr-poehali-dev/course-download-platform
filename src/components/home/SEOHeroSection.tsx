import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface SEOHeroSectionProps {
  onCatalogClick: () => void;
}

export default function SEOHeroSection({ onCatalogClick }: SEOHeroSectionProps) {
  return (
    <section className="w-full py-8 sm:py-12 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-6">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Icon name="CheckCircle2" size={14} className="mr-1" />
              500+ технических материалов
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Icon name="Layers" size={14} className="mr-1" />
              Чертежи и CAD
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Icon name="BookOpen" size={14} className="mr-1" />
              База знаний
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Техническая библиотека<br />
            <span className="text-primary">для инженеров и студентов</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            База справочных материалов для обучения. Чертежи, 3D-модели, примеры технических расчётов, 
            проектная документация. Мгновенный доступ.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="text-lg px-8 py-6" onClick={onCatalogClick}>
              <Icon name="Search" size={20} className="mr-2" />
              Смотреть каталог работ
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <a href="#how-it-works">
                <Icon name="Info" size={20} className="mr-2" />
                Как это работает
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground mt-1">Материалов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">CAD</div>
              <div className="text-sm text-muted-foreground mt-1">Чертежи</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">3D</div>
              <div className="text-sm text-muted-foreground mt-1">Модели</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground mt-1">Доступ
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}