import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground section-title-line">О платформе</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              TechForma — это современная инженерная платформа для студентов и специалистов. Мы предоставляем доступ к справочным материалам для обучения и профессионального развития.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="cyber-card rounded-xl p-6 group hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <Icon name="Target" size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Наша миссия</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Помогать учиться эффективнее через обмен материалами
              </p>
            </div>

            <div className="cyber-card rounded-xl p-6 group hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <Icon name="Shield" size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Безопасность</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Безопасное хранение и модерация всех файлов
              </p>
            </div>

            <div className="cyber-card rounded-xl p-6 group hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <Icon name="Users" size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Сообщество</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Студенты и инженеры обмениваются знаниями
              </p>
            </div>

            <div className="cyber-card rounded-xl p-6 group hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <Icon name="Coins" size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Балльная система</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Делись материалами и получай баллы
              </p>
            </div>
          </div>

          <div className="cyber-card rounded-xl p-6 border-2 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-destructive rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Icon name="AlertTriangle" size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Правовое уведомление</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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