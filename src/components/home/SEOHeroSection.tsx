import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface SEOHeroSectionProps {
  onCatalogClick: () => void;
}

export default function SEOHeroSection({ onCatalogClick }: SEOHeroSectionProps) {
  return (
    <section className="relative w-full py-24 bg-gradient-to-b from-background to-muted/30 text-center overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none"></div>
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Icon name="Wrench" size={16} className="text-primary" />
          <span className="text-sm font-semibold text-primary">Для инженеров и студентов</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight hero-title">
          Готовые работы для студентов
          <br />
          <span className="text-primary">от 200₽ за 3 минуты</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
          500+ курсовых, дипломов и отчётов с чертежами DWG, 3D-моделями и расчётами. Скачивайте мгновенно после оплаты.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            onClick={onCatalogClick}
          >
            <Icon name="Download" size={20} className="mr-2" />
            Выбрать работу
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="px-8 py-6 text-lg font-semibold border-2 hover:bg-muted/50"
            asChild
          >
            <a href="#about">
              <Icon name="Info" size={20} className="mr-2" />
              О платформе
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
          <div className="cyber-card rounded-xl p-6 text-center hover:scale-105 transition-transform">
            <div className="text-5xl font-bold text-primary mb-2">500+</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Готовых работ</div>
          </div>
          <div className="cyber-card rounded-xl p-6 text-center hover:scale-105 transition-transform">
            <div className="text-5xl font-bold text-primary mb-2">от 200₽</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Минимальная цена</div>
          </div>
          <div className="cyber-card rounded-xl p-6 text-center hover:scale-105 transition-transform">
            <div className="text-5xl font-bold text-primary mb-2">3 мин</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">До скачивания</div>
          </div>
        </div>
      </div>
    </section>
  );
}