import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => window.history.back()}
          >
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Назад
          </Button>
          
          <Badge variant="outline" className="mb-4">
            <Icon name="Shield" size={14} className="mr-2" />
            Конфиденциальность
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Политика конфиденциальности</h1>
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
                Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных 
                данных пользователей платформы Tech Forma (далее — «Платформа»).
              </p>
              <p>
                Мы серьезно относимся к защите вашей конфиденциальности и обязуемся обрабатывать ваши 
                персональные данные в соответствии с действующим законодательством Российской Федерации.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Database" size={20} className="text-primary" />
                2. Какие данные мы собираем
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                При использовании Платформы мы можем собирать следующие категории персональных данных:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="User" size={16} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Регистрационные данные</p>
                    <p className="text-sm">Имя пользователя, адрес электронной почты, пароль (в зашифрованном виде)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Icon name="CreditCard" size={16} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Платежная информация</p>
                    <p className="text-sm">Данные о транзакциях, история покупок баллов (данные карт обрабатываются платежными системами)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Icon name="Activity" size={16} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Данные об активности</p>
                    <p className="text-sm">История скачиваний, загруженные работы, избранное, корзина</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Icon name="Laptop" size={16} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Технические данные</p>
                    <p className="text-sm">IP-адрес, тип браузера, операционная система, данные cookies</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Target" size={20} className="text-primary" />
                3. Цели обработки данных
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Мы используем ваши персональные данные для следующих целей:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Регистрация и управление учетной записью пользователя</li>
                <li>Обработка платежей и предоставление доступа к материалам</li>
                <li>Коммуникация с пользователями (уведомления, поддержка)</li>
                <li>Улучшение качества сервиса и персонализация опыта</li>
                <li>Предотвращение мошенничества и обеспечение безопасности</li>
                <li>Выполнение требований законодательства</li>
                <li>Анализ использования Платформы и формирование статистики</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ShieldCheck" size={20} className="text-primary" />
                4. Защита данных
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Мы применяем современные технические и организационные меры для защиты ваших 
                персональных данных:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Шифрование данных при передаче (SSL/TLS)</li>
                <li>Безопасное хранение паролей (хеширование)</li>
                <li>Регулярное резервное копирование</li>
                <li>Ограниченный доступ к данным (только уполномоченный персонал)</li>
                <li>Мониторинг и защита от несанкционированного доступа</li>
                <li>Регулярные аудиты безопасности</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Share2" size={20} className="text-primary" />
                5. Передача данных третьим лицам
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Мы не продаем и не сдаем в аренду ваши персональные данные третьим лицам. 
                Передача данных возможна только в следующих случаях:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Платежным системам — для обработки транзакций (в зашифрованном виде)</li>
                <li>Сервисам аналитики — в обезличенном виде для улучшения Платформы</li>
                <li>По требованию правоохранительных органов — в соответствии с законодательством РФ</li>
                <li>С вашего явного согласия</li>
              </ul>
              <p className="mt-4">
                Все третьи лица, получающие доступ к вашим данным, обязуются соблюдать конфиденциальность 
                и использовать данные только для указанных целей.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Cookie" size={20} className="text-primary" />
                6. Использование Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Платформа использует cookies и аналогичные технологии для:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Сохранения сеанса пользователя (авторизация)</li>
                <li>Запоминания настроек и предпочтений</li>
                <li>Анализа использования сайта</li>
                <li>Персонализации контента</li>
              </ul>
              <p className="mt-4">
                Вы можете управлять cookies через настройки браузера. Отключение cookies может 
                ограничить функциональность Платформы.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="UserCheck" size={20} className="text-primary" />
                7. Ваши права
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>В соответствии с законодательством РФ вы имеете право:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Получать информацию об обработке ваших персональных данных</li>
                <li>Требовать уточнения, изменения или удаления ваших данных</li>
                <li>Отозвать согласие на обработку персональных данных</li>
                <li>Ограничить обработку данных</li>
                <li>Получить копию ваших данных в структурированном формате</li>
                <li>Обжаловать действия администрации в надзорных органах</li>
              </ul>
              <p className="mt-4">
                Для реализации своих прав свяжитесь с нами через форму обратной связи в разделе "Поддержка".
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Clock" size={20} className="text-primary" />
                8. Хранение данных
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Мы храним ваши персональные данные только в течение периода, необходимого для 
                достижения целей обработки:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Данные аккаунта — пока вы используете Платформу или до удаления аккаунта</li>
                <li>Платежные данные — в соответствии с требованиями налогового законодательства (до 5 лет)</li>
                <li>Техническая информация — от 1 до 12 месяцев</li>
              </ul>
              <p className="mt-4">
                После удаления аккаунта ваши данные будут удалены в течение 30 дней, 
                за исключением информации, которую мы обязаны хранить по закону.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="AlertCircle" size={20} className="text-primary" />
                9. Изменения в Политике
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. 
                Новая редакция вступает в силу с момента её размещения на Платформе.
              </p>
              <p>
                О существенных изменениях мы уведомим вас по электронной почте или через 
                уведомления на Платформе.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Icon name="Mail" size={24} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-2">Контакты по вопросам конфиденциальности</p>
                  <p className="text-sm text-muted-foreground">
                    Если у вас возникли вопросы о том, как мы обрабатываем ваши данные, или вы 
                    хотите реализовать свои права, свяжитесь с нами через раздел "Поддержка" 
                    или отправьте запрос через форму обратной связи.
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