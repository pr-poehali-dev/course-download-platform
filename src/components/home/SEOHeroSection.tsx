import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface SEOHeroSectionProps {
  onCatalogClick: () => void;
}

export default function SEOHeroSection({ onCatalogClick }: SEOHeroSectionProps) {
  return (
    <section className="w-full py-16 sm:py-24 bg-background border-b border-primary/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center space-y-10 hero-glow">
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 cyber-card rounded-full text-xs uppercase tracking-widest text-primary mb-4">
              <Icon name="Zap" size={14} className="inline mr-2" />
              Следующее поколение
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-tight hero-title" style={{fontFamily: 'Orbitron'}}>
              ИНЖЕНЕРНАЯ<br />
              <span className="text-primary glow-text">ПЛАТФОРМА</span>
            </h1>
            <p className="text-base sm:text-lg text-cyan-300 max-w-2xl mx-auto leading-relaxed tracking-wide">
              Чертежи, 3D-модели, примеры расчётов и проектная документация
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="px-10 h-14 text-base font-bold uppercase tracking-wider cyber-card neon-border hover:shadow-2xl hover:shadow-primary/50 transition-all" 
              onClick={onCatalogClick}
            >
              <Icon name="ArrowRight" size={20} className="mr-2" />
              Смотреть каталог
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-10 h-14 text-base font-bold uppercase tracking-wider border-primary/50 hover:bg-primary/20 hover:border-primary transition-all" 
              asChild
            >
              <a href="#categories">
                <Icon name="Grid3x3" size={20} className="mr-2" />
                Категории
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto">
            <div className="cyber-card p-6 rounded-lg text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-black text-primary mb-2" style={{fontFamily: 'Orbitron'}}>500+</div>
              <div className="text-xs text-cyan-400 uppercase tracking-wider">Материалов</div>
            </div>
            <div className="cyber-card p-6 rounded-lg text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-black text-primary mb-2" style={{fontFamily: 'Orbitron'}}>CAD</div>
              <div className="text-xs text-cyan-400 uppercase tracking-wider">Чертежи</div>
            </div>
            <div className="cyber-card p-6 rounded-lg text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-black text-primary mb-2" style={{fontFamily: 'Orbitron'}}>3D</div>
              <div className="text-xs text-cyan-400 uppercase tracking-wider">Модели</div>
            </div>
            <div className="cyber-card p-6 rounded-lg text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-black text-primary mb-2" style={{fontFamily: 'Orbitron'}}>24/7</div>
              <div className="text-xs text-cyan-400 uppercase tracking-wider">Доступ</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}