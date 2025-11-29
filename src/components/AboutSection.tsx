import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground section-title-line">О платформе</h2>
            <p className="text-lg text-muted-foreground">
              Инженерная платформа для студентов и специалистов
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="cyber-card rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Icon name="Target" size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Наша миссия</h3>
              <p className="text-muted-foreground leading-relaxed">
                Помогать учиться эффективнее через обмен материалами. База справочных работ для обучения.
              </p>
            </div>

            <div className="cyber-card rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Icon name="Shield" size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Безопасность</h3>
              <p className="text-muted-foreground leading-relaxed">
                Безопасное хранение материалов. Модерация всех загружаемых файлов.
              </p>
            </div>

            <div className="cyber-card rounded-lg p-6">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                <Icon name="Users" size={24} className="text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Сообщество</h3>
              <p className="text-muted-foreground leading-relaxed">
                Растущее сообщество студентов и инженеров, обменивающихся знаниями.
              </p>
            </div>

            <div className="cyber-card rounded-lg p-6">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                <Icon name="Coins" size={24} className="text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Балльная система</h3>
              <p className="text-muted-foreground leading-relaxed">
                Делись материалами — получай баллы. Используй баллы для доступа к работам других.
              </p>
            </div>
          </div>

          <div className="cyber-card rounded-lg p-6 border-destructive/50">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-destructive/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="AlertTriangle" size={20} className="text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Правовое уведомление</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Материалы предназначены для образовательных целей как справочные пособия. 
                  <strong className="text-foreground"> Все материалы требуют обязательной авторской переработки.</strong> 
                  Прямое копирование запрещено.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}