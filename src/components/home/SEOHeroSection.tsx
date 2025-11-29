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
          Инженерная платформа
          <br />
          <span className="text-primary">технических знаний</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
          Чертежи DWG/DXF, 3D-модели, технические расчёты и проектная документация. Обменивайтесь опытом и развивайте навыки.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            onClick={onCatalogClick}
          >
            <Icon name="Search" size={20} className="mr-2" />
            Найти материалы
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
            <div className="text-5xl font-bold text-primary mb-2">2,458</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Инженерных материалов</div>
          </div>
          <div className="cyber-card rounded-xl p-6 text-center hover:scale-105 transition-transform">
            <div className="text-5xl font-bold text-primary mb-2">1,203</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Инженеров</div>
          </div>
          <div className="cyber-card rounded-xl p-6 text-center hover:scale-105 transition-transform">
            <div className="text-5xl font-bold text-primary mb-2">45,871</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Скачиваний</div>
          </div>
        </div>
      </div>
    </section>
  );
}