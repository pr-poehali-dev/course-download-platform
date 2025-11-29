import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface SEOHeroSectionProps {
  onCatalogClick: () => void;
}

export default function SEOHeroSection({ onCatalogClick }: SEOHeroSectionProps) {
  return (
    <section className="w-full py-20 bg-background text-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight hero-title">
          ИНЖЕНЕРНАЯ ПЛАТФОРМА БУДУЩЕГО
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
          Место, где инженеры и технические специалисты делятся работами, получают признание и развиваются вместе
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg font-semibold bg-secondary hover:bg-secondary/90"
            onClick={onCatalogClick}
          >
            Начать сейчас
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="px-8 py-6 text-lg font-semibold border-primary text-primary hover:bg-primary/10"
            asChild
          >
            <a href="#about">Узнать больше</a>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-5xl font-bold text-accent mb-2">2,458</div>
            <div className="text-sm text-muted-foreground">Технических работ</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-accent mb-2">1,203</div>
            <div className="text-sm text-muted-foreground">Авторов</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-accent mb-2">45,871</div>
            <div className="text-sm text-muted-foreground">Загрузок</div>
          </div>
        </div>
      </div>
    </section>
  );
}