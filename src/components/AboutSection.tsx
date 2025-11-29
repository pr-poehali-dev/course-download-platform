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
          <h2 className="text-5xl font-bold mb-4">Платформа обмена знаниями</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Студенты помогают друг другу — делятся работами и получают доступ к материалам для обучения
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
                Помогать студентам учиться эффективнее через обмен материалами. 
                Платформа работает как база референсных работ для обучения.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/30 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Icon name="ShieldCheck" size={32} className="text-primary" />
              </div>
              <CardTitle className="text-2xl">Безопасность и качество</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Платформа обеспечивает безопасное хранение материалов. Авторы сами 
                несут ответственность за качество и оригинальность своих работ.
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
                Присоединяйся к растущему сообществу студентов, которые помогают 
                друг другу учиться эффективнее через обмен материалами.
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
                Поделись работой — получи баллы. Или купи баллы, чтобы получить 
                доступ к материалам других студентов для обучения.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="AlertTriangle" size={24} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-yellow-900">⚠️ Правовое уведомление</h3>
              <p className="text-yellow-800 leading-relaxed">
                Материалы платформы предназначены исключительно для образовательных целей как справочные пособия. 
                Примеры учебных работ должны использоваться только для изучения подходов к решению задач, оформления 
                и структурирования. <strong>Все материалы требуют обязательной авторской переработки перед использованием.</strong> 
                Прямое копирование запрещено. Администрация не несёт ответственности за использование материалов 
                в нарушение их назначения.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}