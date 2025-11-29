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
              TechForma — инженерная платформа для обмена техническими материалами. Чертежи, 3D-модели, расчёты и проектная документация для инженеров и студентов технических специальностей.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="cyber-card rounded-xl p-6 group hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <Icon name="Target" size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Обмен опытом</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Делитесь своими разработками и учитесь на примерах коллег
              </p>
            </div>

            <div className="cyber-card rounded-xl p-6 group hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <Icon name="Shield" size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Технические форматы</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                DWG, DXF, STEP, STL, PDF и другие CAD-форматы
              </p>
            </div>

            <div className="cyber-card rounded-xl p-6 group hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <Icon name="Users" size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Профессионалы</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Сообщество инженеров, конструкторов и проектировщиков
              </p>
            </div>

            <div className="cyber-card rounded-xl p-6 group hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <Icon name="Coins" size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Система баллов</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Зарабатывайте баллы за загрузку материалов
              </p>
            </div>
          </div>

          <div className="cyber-card rounded-xl p-6 border-2 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-destructive rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Icon name="AlertTriangle" size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Важно знать</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Материалы предназначены для обучения и справки. 
                  <strong className="text-foreground">Используйте как основу для своих разработок</strong> с обязательной адаптацией под ваши задачи.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}