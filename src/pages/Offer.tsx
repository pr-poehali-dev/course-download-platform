import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

export default function Offer() {
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
            Договор-оферта
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Договор-оферта на оказание информационных услуг</h1>
          <p className="text-muted-foreground">
            Дата публикации: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Info" size={20} className="text-primary" />
                Важная информация об оферте
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Настоящий документ является публичной офертой в соответствии со статьей 437 
                Гражданского кодекса Российской Федерации.
              </p>
              <p>
                Акцептом (принятием) настоящей оферты считается факт регистрации на платформе 
                Tech Forma и/или совершение действий по использованию сервиса.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileText" size={20} className="text-primary" />
                1. Термины и определения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">Исполнитель</p>
                  <p className="text-sm">
                    Самозанятый гражданин, предоставляющий информационные услуги через платформу Tech Forma:
                  </p>
                  <div className="bg-muted p-3 rounded-lg mt-2 text-sm">
                    <p><strong>ФИО:</strong> Гагарская Елизавета Александровна</p>
                    <p><strong>ИНН:</strong> 290540407146</p>
                    <p><strong>Email:</strong> gagarskaal@gmail.com</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-foreground">Заказчик (Пользователь)</p>
                  <p className="text-sm">
                    Физическое лицо, зарегистрированное на платформе и использующее услуги Исполнителя.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">Платформа</p>
                  <p className="text-sm">
                    Веб-сайт Tech Forma, обеспечивающий информационный обмен учебными материалами между студентами.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">Баллы</p>
                  <p className="text-sm">
                    Внутренняя расчетная единица платформы для доступа к материалам. 
                    Не является электронным средством платежа или денежным эквивалентом.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">Услуга</p>
                  <p className="text-sm">
                    Предоставление доступа к информационным материалам и функционалу платформы.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ShoppingCart" size={20} className="text-primary" />
                2. Предмет договора
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-semibold text-foreground">
                2.1. Исполнитель обязуется предоставить Заказчику:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Доступ к платформе Tech Forma для поиска и обмена учебными материалами</li>
                <li>Возможность загрузки собственных работ и получения баллов</li>
                <li>Доступ к скачиванию работ других пользователей за баллы</li>
                <li>Функционал управления аккаунтом, избранным, корзиной</li>
                <li>Техническую поддержку по вопросам работы платформы</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                2.2. Услуги носят информационный характер
              </p>
              <p>
                Платформа предоставляет только техническую возможность обмена информацией между 
                пользователями и не несет ответственности за качество, достоверность или 
                законность размещаемых материалов.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Coins" size={20} className="text-primary" />
                3. Стоимость услуг и порядок расчетов
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-semibold text-foreground">
                3.1. Балльная система
              </p>
              <p>
                Для доступа к материалам используется система внутренних баллов. 
                Баллы можно получить двумя способами:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Загрузка собственных работ (бесплатно)</li>
                <li>Покупка баллов за денежные средства</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                3.2. Стоимость баллов (примерная)
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">• 100 баллов = 99 рублей</p>
                <p className="text-sm">• 500 баллов = 449 рублей (скидка 10%)</p>
                <p className="text-sm">• 1000 баллов = 799 рублей (скидка 20%)</p>
                <p className="text-sm mt-2 text-muted-foreground">
                  Стоимость может быть изменена Исполнителем в одностороннем порядке
                </p>
              </div>

              <p className="font-semibold text-foreground mt-4">
                3.3. Порядок оплаты
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Оплата производится онлайн через платежные системы (Юкасса, CloudPayments и др.)</li>
                <li>Баллы зачисляются автоматически после подтверждения платежа</li>
                <li>Чек НПД направляется на email в течение 24 часов</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                3.4. Возврат средств
              </p>
              <p>
                Возврат денежных средств за неиспользованные баллы НЕ производится, 
                за исключением случаев технической ошибки при зачислении.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="UserCheck" size={20} className="text-primary" />
                4. Права и обязанности Исполнителя
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-semibold text-foreground">
                4.1. Исполнитель обязуется:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Обеспечивать работоспособность платформы 24/7 (кроме технических работ)</li>
                <li>Предоставлять техническую поддержку</li>
                <li>Защищать персональные данные пользователей</li>
                <li>Проводить модерацию загружаемых материалов</li>
                <li>Уведомлять о планируемых изменениях в работе сервиса</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                4.2. Исполнитель имеет право:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Изменять условия договора с уведомлением за 7 дней</li>
                <li>Удалять материалы, нарушающие правила или законодательство</li>
                <li>Блокировать аккаунты нарушителей без возврата баллов</li>
                <li>Приостанавливать работу платформы для технического обслуживания</li>
                <li>Изменять стоимость баллов и услуг</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" size={20} className="text-primary" />
                5. Права и обязанности Заказчика
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-semibold text-foreground">
                5.1. Заказчик обязуется:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Предоставлять достоверные данные при регистрации</li>
                <li>Не передавать доступ к аккаунту третьим лицам</li>
                <li>Загружать только собственные работы или работы с разрешения автора</li>
                <li>Не использовать платформу для незаконной деятельности</li>
                <li>Соблюдать правила платформы и законодательство РФ</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                5.2. Заказчик имеет право:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Использовать все функции платформы в рамках действующих правил</li>
                <li>Загружать работы и получать баллы</li>
                <li>Скачивать материалы других пользователей за баллы</li>
                <li>Обращаться в службу поддержки</li>
                <li>Удалить свой аккаунт в любой момент</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-500/30 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ShieldAlert" size={20} className="text-orange-600" />
                6. Ответственность сторон
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-semibold text-foreground">
                6.1. Исполнитель НЕ несет ответственности за:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Качество, достоверность и законность материалов, загруженных пользователями</li>
                <li>Нарушение авторских прав третьих лиц пользователями</li>
                <li>Временную недоступность платформы по техническим причинам</li>
                <li>Действия третьих лиц (хакерские атаки, DDOS и т.д.)</li>
                <li>Убытки пользователя от использования скачанных материалов</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                6.2. Заказчик несет полную ответственность за:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Содержание загружаемых им материалов</li>
                <li>Нарушение авторских прав при загрузке чужих работ</li>
                <li>Использование скачанных материалов</li>
                <li>Действия, совершенные под его учетной записью</li>
              </ul>

              <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mt-4">
                <p className="font-bold text-orange-800 mb-2">
                  ⚠️ ВАЖНО: Ограничение ответственности
                </p>
                <p className="text-sm text-orange-700">
                  Загружая работу, Заказчик принимает на себя все риски и освобождает 
                  Исполнителя от любой ответственности за претензии третьих лиц. 
                  Заказчик обязуется возместить Исполнителю все убытки, возникшие 
                  в связи с нарушением авторских прав.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Clock" size={20} className="text-primary" />
                7. Срок действия договора
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Договор вступает в силу с момента акцепта оферты (регистрации на платформе) 
                и действует бессрочно до момента расторжения одной из сторон.
              </p>
              <p className="font-semibold text-foreground mt-4">
                7.1. Расторжение договора
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Заказчик может расторгнуть договор, удалив свой аккаунт</li>
                <li>Исполнитель может расторгнуть договор, заблокировав аккаунт при нарушениях</li>
                <li>При расторжении неиспользованные баллы сгорают без возврата денежных средств</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="AlertCircle" size={20} className="text-primary" />
                8. Разрешение споров
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Все споры и разногласия решаются путем переговоров. Претензионный порядок 
                обязателен — срок рассмотрения претензии 30 дней.
              </p>
              <p className="mt-4">
                При невозможности урегулирования спора в досудебном порядке, спор передается 
                на рассмотрение в суд по месту нахождения Исполнителя в соответствии 
                с законодательством Российской Федерации.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Edit" size={20} className="text-primary" />
                9. Изменение условий договора
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Исполнитель имеет право вносить изменения в условия настоящего договора в 
                одностороннем порядке.
              </p>
              <p>
                Новая редакция договора вступает в силу через 7 дней после публикации на сайте, 
                если иной срок не указан дополнительно.
              </p>
              <p>
                Продолжение использования платформы после внесения изменений означает согласие 
                Заказчика с новыми условиями.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Mail" size={20} className="text-primary" />
                10. Реквизиты и контакты Исполнителя
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-semibold text-foreground">Самозанятый гражданин:</p>
                <p><strong>ФИО:</strong> Гагарская Елизавета Александровна</p>
                <p><strong>ИНН:</strong> 290540407146</p>
                <p><strong>Email:</strong> gagarskaal@gmail.com</p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                <p className="font-bold text-blue-800 mb-2">
                  📄 Важно для налоговой отчетности
                </p>
                <p className="text-sm text-blue-700">
                  После каждой покупки баллов вы получите чек НПД (налог на профессиональный доход) 
                  на указанный email. Сохраняйте чеки для учета.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}