import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Icon name="Info" size={14} className="mr-2" />
            О платформе
          </Badge>
          <h2 className="text-5xl font-bold mb-4">Tech Forma — платформа для студентов</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Мы создали экосистему, где студенты могут обмениваться качественными работами и зарабатывать на своих знаниях
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <Card className="border-2 hover:border-primary/30 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Icon name="Target" size={32} className="text-primary" />
              </div>
              <CardTitle className="text-2xl">Наша миссия</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Сделать качественные образовательные материалы доступными каждому студенту. 
                Мы верим, что взаимопомощь и обмен знаниями — ключ к успешному обучению.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/30 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Icon name="ShieldCheck" size={32} className="text-primary" />
              </div>
              <CardTitle className="text-2xl">Гарантии качества</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Все работы проходят модерацию перед публикацией. Мы проверяем соответствие описанию, 
                качество оформления и уникальность контента.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/30 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Icon name="Users" size={32} className="text-primary" />
              </div>
              <CardTitle className="text-2xl">Сообщество</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Более 5000 студентов уже используют платформу. Присоединяйся к сообществу активных 
                студентов, которые помогают друг другу учиться эффективнее.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/30 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Icon name="Coins" size={32} className="text-primary" />
              </div>
              <CardTitle className="text-2xl">Система обмена</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Загружай свои качественные работы и получай баллы за каждое скачивание. 
                Используй заработанные баллы для доступа к другим материалам на платформе.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-primary/5 rounded-2xl p-8 max-w-4xl mx-auto border-2 border-primary/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="Lightbulb" size={24} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Для чего это нужно?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Платформа создана как база референсных материалов для обучения. Здесь вы можете найти примеры оформления, 
                структуры работ, подходы к решению задач. Все материалы предоставлены исключительно в ознакомительных целях 
                и не должны использоваться как готовые решения без переработки.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}