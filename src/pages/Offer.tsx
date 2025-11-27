import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function Offer() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Breadcrumbs />
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
                  <p className="font-semibold text-foreground">Администратор Платформы</p>
                  <p className="text-sm">
                    Физическое лицо, предоставляющее информационные услуги через платформу Tech Forma
                  </p>
                  <div className="bg-muted p-3 rounded-lg mt-2 text-sm">
                    <p><strong>Email для связи:</strong> tech.forma@yandex.ru</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-foreground">Пользователь</p>
                  <p className="text-sm">
                    Физическое лицо, зарегистрированное на платформе и использующее её услуги.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">Платформа</p>
                  <p className="text-sm">
                    Веб-сайт Tech Forma — посредник (маркетплейс), обеспечивающий техническую инфраструктуру для информационного 
                    обмена учебными материалами между авторами и пользователями. Платформа не создает контент и не несет 
                    ответственности за материалы, публикуемые пользователями.
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
                2.1. Платформа предоставляет Пользователю:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Доступ к платформе Tech Forma для поиска и обмена учебными материалами</li>
                <li>Возможность загрузки собственных работ</li>
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
                <li><strong>Покупка баллов</strong> — через платежную систему по текущему тарифу</li>
                <li><strong>Загрузка работ</strong> — получение баллов за каждую опубликованную работу</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                3.2. Тарифы на баллы (примерные, могут изменяться):
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>100 баллов — 500 рублей</li>
                <li>500 баллов — 2500 рублей</li>
                <li>1000 баллов — 5000 рублей</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                3.3. Политика возврата средств
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 space-y-2">
                <p>
                  <strong>Возврат денежных средств возможен</strong> в следующих случаях:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>В течение <strong>24 часов</strong> с момента покупки баллов</li>
                  <li>При условии, что купленные баллы <strong>не были использованы</strong> (не потрачены на работы)</li>
                  <li>По решению администрации в исключительных случаях</li>
                </ul>
                <p className="mt-3">
                  <strong>Порядок возврата:</strong> обратитесь в службу поддержки через раздел «Поддержка» 
                  в личном кабинете или на email <strong>tech.forma@yandex.ru</strong> с указанием номера транзакции. 
                  Возврат осуществляется на банковскую карту/счет в течение 5-10 рабочих дней.
                </p>
                <p className="mt-3 text-sm">
                  <strong>Внимание:</strong> возврат невозможен, если баллы уже были использованы для покупки работ.
                </p>
              </div>
              <p className="text-sm mt-2">
                <strong>Курс:</strong> 1 балл = 5 рублей
              </p>

              <p className="font-semibold text-foreground mt-4">
                3.3. Порядок оплаты
              </p>
              <p>
                Оплата производится через сторонние платежные системы (CloudPayments, Яндекс.Касса и др.). 
                Баллы зачисляются автоматически после успешной оплаты.
              </p>

              <p className="font-semibold text-foreground mt-4">
                3.4. Возврат средств
              </p>
              <p>
                Баллы возврату не подлежат, кроме случаев технической ошибки при зачислении. 
                Баллы не могут быть обменены на денежные средства или переданы другим пользователям.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="UserCheck" size={20} className="text-primary" />
                4. Права и обязанности Пользователя
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-semibold text-foreground">
                4.1. Пользователь имеет право:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Пользоваться всеми функциями платформы</li>
                <li>Загружать свои работы и получать баллы</li>
                <li>Скачивать работы других пользователей за баллы</li>
                <li>Обращаться в службу поддержки</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                4.2. Пользователь обязан:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Соблюдать условия настоящего договора и законодательство РФ</li>
                <li>Загружать только свои работы или материалы с разрешением автора</li>
                <li>Не нарушать авторские права третьих лиц</li>
                <li>Использовать скачанные материалы только в ознакомительных целях</li>
                <li>Не предоставлять третьим лицам доступ к своему аккаунту</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Settings" size={20} className="text-primary" />
                5. Права и обязанности Администратора
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-semibold text-foreground">
                5.1. Администратор обязан:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Обеспечивать функционирование платформы</li>
                <li>Обрабатывать обращения пользователей</li>
                <li>Защищать данные пользователей</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                5.2. Администратор имеет право:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Проводить технические работы с временной приостановкой сервиса</li>
                <li>Удалять работы, нарушающие правила или права третьих лиц</li>
                <li>Блокировать аккаунты за нарушение условий</li>
                <li>Изменять тарифы и условия с уведомлением пользователей</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ShieldOff" size={20} className="text-primary" />
                6. Ответственность сторон
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-semibold text-foreground">
                6.1. Администратор НЕ несет ответственности за:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Качество и оригинальность работ, загруженных пользователями</li>
                <li>Нарушение авторских прав в материалах пользователей</li>
                <li>Последствия использования скачанных работ</li>
                <li>Технические сбои, находящиеся вне контроля Администратора</li>
              </ul>

              <p className="font-semibold text-foreground mt-4">
                6.2. Пользователь несет полную ответственность за:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Содержание загружаемых им работ</li>
                <li>Нарушение авторских прав при публикации материалов</li>
                <li>Действия, совершенные под его учетной записью</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="AlertTriangle" size={20} className="text-primary" />
                7. Форс-мажор
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Стороны освобождаются от ответственности за неисполнение обязательств, 
                если это произошло вследствие обстоятельств непреодолимой силы: 
                стихийных бедствий, военных действий, изменений законодательства, 
                действий государственных органов, технических сбоев интернета и других независящих от сторон обстоятельств.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="XCircle" size={20} className="text-primary" />
                8. Расторжение договора
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong>8.1.</strong> Пользователь может расторгнуть договор в любой момент, удалив свой аккаунт. 
                При этом неиспользованные баллы аннулируются. Возврат средств возможен в соответствии с разделом 3.3.
              </p>
              <p>
                <strong>8.2.</strong> Администратор может расторгнуть договор в одностороннем порядке 
                при нарушении Пользователем условий настоящего договора.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Scale" size={20} className="text-primary" />
                9. Разрешение споров
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Все споры решаются путем переговоров. При недостижении согласия споры 
                передаются в суд в соответствии с законодательством Российской Федерации.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileText" size={20} className="text-primary" />
                10. Применимое право
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Настоящий договор регулируется и толкуется в соответствии с законодательством 
                Российской Федерации. К отношениям сторон применяются:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Гражданский кодекс РФ</li>
                <li>Закон РФ «О защите прав потребителей»</li>
                <li>Федеральный закон «Об информации, информационных технологиях и о защите информации»</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Mail" size={20} className="text-primary" />
                11. Контактная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                По всем вопросам, связанным с исполнением настоящего договора, обращайтесь:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Email:</strong> tech.forma@yandex.ru</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}