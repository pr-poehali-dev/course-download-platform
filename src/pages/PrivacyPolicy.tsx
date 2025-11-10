import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
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
            <Icon name="Shield" size={14} className="mr-2" />
            Конфиденциальность
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Политика конфиденциальности</h1>
          <p className="text-muted-foreground">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-blue-500/30 bg-blue-50/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Info" size={20} className="text-blue-600" />
                Важно: О 152-ФЗ «О персональных данных»
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Tech Forma обрабатывает минимальный объём данных пользователей: только <strong>адрес электронной почты</strong> и <strong>никнейм</strong>.
              </p>
              <p>
                Согласно статье 3 Федерального закона №152-ФЗ «О персональных данных», действие данного закона <strong>НЕ распространяется</strong> на отношения, 
                возникающие при обработке персональных данных физическими лицами исключительно для личных и семейных нужд, 
                если при этом не нарушаются права субъектов персональных данных.
              </p>
              <p>
                Платформа Tech Forma используется для личного информационного обмена учебными материалами между студентами 
                и не осуществляет автоматизированную обработку персональных данных в масштабах, требующих регистрации в Роскомнадзоре.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Info" size={20} className="text-primary" />
                1. Общие положения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Настоящая Политика конфиденциальности определяет порядок обработки и защиты данных 
                пользователей платформы Tech Forma (далее — «Платформа»).
              </p>
              <p>
                Администратор Платформы: tech.forma@yandex.ru
              </p>
              <p>
                Используя Платформу, вы соглашаетесь с условиями настоящей Политики конфиденциальности.
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
                При регистрации и использовании Платформы мы собираем только необходимый минимум данных:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="User" size={16} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Регистрационные данные</p>
                    <p className="text-sm">
                      <strong>Никнейм</strong> — для отображения в интерфейсе платформы<br/>
                      <strong>Email</strong> — для восстановления доступа и важных уведомлений<br/>
                      <strong>Пароль</strong> — хранится только в зашифрованном виде (хеш)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Icon name="Activity" size={16} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Данные об активности</p>
                    <p className="text-sm">
                      История скачиваний, загруженные работы, избранное, баллы — привязываются к вашему аккаунту
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Icon name="Laptop" size={16} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Технические данные</p>
                    <p className="text-sm">
                      IP-адрес, тип браузера — только для обеспечения безопасности и работы сайта
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-4">
                <p className="font-bold text-green-800 mb-2">
                  ✅ Мы НЕ собираем
                </p>
                <ul className="text-sm text-green-700 list-disc list-inside">
                  <li>ФИО, дату рождения, паспортные данные</li>
                  <li>Номера телефонов</li>
                  <li>Адреса проживания</li>
                  <li>Банковские реквизиты (обрабатываются только платёжной системой)</li>
                  <li>Любые биометрические данные</li>
                </ul>
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
              <p>Мы используем ваши данные исключительно для:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Регистрации и управления учетной записью</li>
                <li>Предоставления доступа к материалам платформы</li>
                <li>Восстановления доступа к аккаунту (через email)</li>
                <li>Отправки критически важных уведомлений</li>
                <li>Обеспечения безопасности платформы</li>
                <li>Улучшения работы сервиса (анализ анонимной статистики)</li>
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
                Мы применяем современные меры защиты:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Шифрование соединения (HTTPS/SSL)</li>
                <li>Хеширование паролей (невозможно восстановить исходный пароль)</li>
                <li>Защита от несанкционированного доступа к базе данных</li>
                <li>Регулярные резервные копии</li>
                <li>Ограниченный доступ к серверам (только администратор)</li>
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
                <strong>Мы НЕ продаём, НЕ передаём и НЕ сдаём в аренду ваши данные.</strong>
              </p>
              <p>
                Передача возможна только в следующих случаях:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Платёжные системы</strong> — для обработки транзакций (данные карты НЕ проходят через наши серверы)</li>
                <li><strong>Правоохранительные органы</strong> — только по официальному запросу в соответствии с законодательством РФ</li>
              </ul>
              <p className="mt-4">
                Мы не используем сторонние аналитические системы, которые собирают персональные данные.
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
                Платформа использует cookies только для:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Сохранения сеанса авторизации (чтобы не вводить пароль каждый раз)</li>
                <li>Запоминания настроек интерфейса</li>
              </ul>
              <p className="mt-4">
                Вы можете отключить cookies в настройках браузера, но это может ограничить функциональность сайта.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="UserX" size={20} className="text-primary" />
                7. Ваши права
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Вы имеете право:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Доступ к данным</strong> — запросить копию ваших данных</li>
                <li><strong>Изменение данных</strong> — изменить никнейм или email в настройках профиля</li>
                <li><strong>Удаление данных</strong> — удалить аккаунт и все связанные данные</li>
                <li><strong>Отзыв согласия</strong> — прекратить использование платформы в любой момент</li>
              </ul>
              <p className="mt-4">
                Для удаления аккаунта или запроса данных обратитесь на: <strong>tech.forma@yandex.ru</strong>
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
                Ваши данные хранятся до тех пор, пока:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Вы используете платформу</li>
                <li>Вы не удалите аккаунт</li>
                <li>Аккаунт не будет неактивен более 3 лет</li>
              </ul>
              <p className="mt-4">
                После удаления аккаунта данные безвозвратно удаляются в течение 30 дней.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="UserCog" size={20} className="text-primary" />
                9. Обработка персональных данных несовершеннолетних
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong>9.1.</strong> Платформа предназначена для лиц старше 18 лет.
              </p>
              <p>
                <strong>9.2.</strong> Лица в возрасте от 14 до 18 лет могут использовать Платформу только при наличии 
                письменного согласия родителей или законных представителей. Такое согласие должно быть направлено 
                на email: tech.forma@yandex.ru с приложением копий документов.
              </p>
              <p>
                <strong>9.3.</strong> Платформа не собирает намеренно данные лиц младше 14 лет. При обнаружении 
                такого аккаунта он будет немедленно заблокирован и все данные удалены.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Mail" size={20} className="text-primary" />
                10. Контакты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                По вопросам конфиденциальности обращайтесь:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Email:</strong> tech.forma@yandex.ru</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Edit" size={20} className="text-primary" />
                11. Изменения в Политике
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Мы можем обновлять эту Политику конфиденциальности. О существенных изменениях 
                мы уведомим по email или через уведомление на сайте.
              </p>
              <p>
                Дата последнего обновления указана в начале документа.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}