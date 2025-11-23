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
          <h2 className="text-5xl font-bold mb-4">Маркетплейс учебных материалов</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Платформа для обмена студенческими работами — для ознакомления и самостоятельной переработки
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
                Tech Forma — это платформа-посредник, где студенты делятся своими учебными работами. 
                Мы предоставляем только техническую инфраструктуру для размещения материалов.
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
                Авторы несут полную ответственность за содержание своих работ. 
                Возврат баллов возможен в течение 24 часов, если работа не соответствует описанию.
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
                Более 2500 студентов используют платформу для обмена учебными материалами. 
                Получите 1000 баллов в подарок при регистрации!
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
                Загрузите работу — получите баллы. Или купите баллы, чтобы получить 
                доступ к работам других студентов для изучения и переработки.
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
                <strong>⚠️ Важно:</strong> Все материалы предназначены <strong>исключительно для ознакомления и самостоятельной переработки</strong>. 
                Использование работ "как есть" без переработки может привести к обвинениям в плагиате. 
                Пользователь самостоятельно несёт ответственность за использование материалов.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}