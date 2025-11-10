import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';

export default function Requisites() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            asChild
          >
            <Link to="/">
              <Icon name="Home" size={18} className="mr-2" />
              На главную
            </Link>
          </Button>
          
          <Badge variant="outline" className="mb-4">
            <Icon name="FileText" size={14} className="mr-2" />
            Юридическая информация
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Реквизиты</h1>
          <p className="text-muted-foreground">
            Информация об исполнителе и реквизиты для связи
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Mail" size={20} className="text-primary" />
                Контакты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                <div className="flex items-start gap-2">
                  <Icon name="Mail" size={16} className="mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email для связи:</p>
                    <p className="text-sm text-muted-foreground">tech.forma@yandex.ru</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Info" size={20} className="text-primary" />
                О платформе
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Платформа Tech Forma предоставляет информационные услуги по обмену учебными материалами между студентами.
              </p>
              <p className="text-sm text-muted-foreground">
                Все материалы размещаются пользователями платформы и предоставляются в ознакомительных целях.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}