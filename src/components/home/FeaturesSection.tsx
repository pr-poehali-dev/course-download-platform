import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Почему выбирают нас?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Мы создали самую удобную платформу для обмена студенческими работами
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 hover:border-primary transition-all hover:shadow-xl">
            <CardContent className="pt-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Icon name="Shield" size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">Безопасно</h3>
              <p className="text-muted-foreground text-center">
                Все работы проверены. Безопасные платежи и защита данных.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:border-primary transition-all hover:shadow-xl">
            <CardContent className="pt-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Icon name="Zap" size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">Быстро</h3>
              <p className="text-muted-foreground text-center">
                Доступ к материалам за 2 минуты после оплаты. Скачивай сразу.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:border-primary transition-all hover:shadow-xl">
            <CardContent className="pt-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Icon name="DollarSign" size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">Выгодно</h3>
              <p className="text-muted-foreground text-center">
                Зарабатывай баллы за свои работы. Покупай работы других.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:border-primary transition-all hover:shadow-xl">
            <CardContent className="pt-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Icon name="Users" size={32} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">Сообщество</h3>
              <p className="text-muted-foreground text-center">
                Тысячи студентов уже с нами. Присоединяйся к сообществу!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}