import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Badge variant="outline" className="mb-4">
            <Icon name="FileText" size={14} className="mr-2" />
            Юридические документы
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Пользовательское соглашение</h1>
          <p className="text-muted-foreground">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Info" size={20} className="text-primary" />
                1. Общие положения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между 
                администрацией платформы Tech Forma (далее — «Платформа») и пользователями сервиса.
              </p>
              <p>
                Регистрируясь на Платформе, вы подтверждаете свое согласие с условиями данного Соглашения. 
                Если вы не согласны с каким-либо пунктом, пожалуйста, не используйте сервис.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" size={20} className="text-primary" />
                2. Регистрация и аккаунт
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                2.1. Для использования функций Платформы необходимо пройти регистрацию, предоставив 
                достоверную информацию.
              </p>
              <p>
                2.2. Вы обязуетесь не передавать свои учетные данные третьим лицам и несете полную 
                ответственность за действия, совершенные под вашей учетной записью.
              </p>
              <p>
                2.3. В случае обнаружения несанкционированного доступа к аккаунту, необходимо 
                незамедлительно сообщить об этом администрации.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Upload" size={20} className="text-primary" />
                3. Загрузка работ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                3.1. Загружая работу на Платформу, вы подтверждаете, что являетесь автором работы 
                или имеете право на её распространение.
              </p>
              <p>
                3.2. Запрещается загружать работы, содержащие:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Плагиат или нарушение авторских прав</li>
                <li>Вредоносный код или вирусы</li>
                <li>Оскорбительный, дискриминационный контент</li>
                <li>Материалы, нарушающие законодательство РФ</li>
              </ul>
              <p>
                3.3. Администрация оставляет за собой право удалить любую работу без объяснения причин.
              </p>
              <p>
                3.4. Загружая работу, вы подтверждаете её оригинальность и принимаете ответственность 
                за предоставленный контент.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Coins" size={20} className="text-primary" />
                4. Балльная система и платежи
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                4.1. Для доступа к работам используется внутренняя балльная система. Баллы приобретаются 
                за реальные деньги или зарабатываются путем загрузки собственных работ.
              </p>
              <p>
                4.2. Все платежи обрабатываются через защищенные платежные шлюзы. Администрация не 
                хранит данные банковских карт пользователей.
              </p>
              <p>
                4.3. Возврат средств возможен только в случае технических ошибок при обработке платежа. 
                Возврат за приобретенные материалы не предусмотрен.
              </p>
              <p>
                4.4. Баллы не подлежат обмену на денежные средства, за исключением случаев, 
                предусмотренных программой вывода для авторов работ.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="BookOpen" size={20} className="text-primary" />
                5. Использование материалов
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                5.1. Все материалы на Платформе предоставляются исключительно в ознакомительных и 
                образовательных целях.
              </p>
              <p>
                5.2. Материалы могут использоваться как референсные источники, примеры оформления, 
                структуры и методологии выполнения работ.
              </p>
              <p>
                5.3. Запрещается:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Копирование материалов без изменений и выдача их за собственные</li>
                <li>Распространение скачанных работ третьим лицам</li>
                <li>Использование материалов в коммерческих целях без согласия автора</li>
              </ul>
              <p>
                5.4. Пользователь несет полную ответственность за использование скачанных материалов.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ShieldAlert" size={20} className="text-primary" />
                6. Ответственность
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                6.1. Администрация не несет ответственности за качество, достоверность и актуальность 
                размещенных работ.
              </p>
              <p>
                6.2. Платформа не гарантирует бесперебойную работу сервиса и не несет ответственности 
                за технические сбои.
              </p>
              <p>
                6.3. Администрация вправе заблокировать аккаунт пользователя при нарушении условий 
                Соглашения без возврата неизрасходованных баллов.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Settings" size={20} className="text-primary" />
                7. Изменение условий
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                7.1. Администрация оставляет за собой право изменять условия настоящего Соглашения 
                в одностороннем порядке.
              </p>
              <p>
                7.2. Новая редакция вступает в силу с момента размещения на сайте, если иное не 
                предусмотрено новой редакцией Соглашения.
              </p>
              <p>
                7.3. Продолжение использования Платформы после изменения условий означает принятие 
                новой редакции Соглашения.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Icon name="Mail" size={24} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-2">Остались вопросы?</p>
                  <p className="text-sm text-muted-foreground">
                    Если у вас возникли вопросы по Пользовательскому соглашению, свяжитесь с нами 
                    через форму обратной связи в разделе "Поддержка".
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
