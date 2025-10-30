import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

export default function RoskomnadzorGuidePage() {
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
            Юридическая инструкция
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Регистрация в Роскомнадзоре</h1>
          <p className="text-muted-foreground">
            Инструкция для регистрации как оператор персональных данных
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-blue-500/30 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Info" size={20} className="text-blue-600" />
                Зачем регистрироваться?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Согласно <strong>ФЗ-152 "О персональных данных"</strong> (статья 22), 
                если вы собираете данные пользователей (email, телефон, платежи), 
                необходимо уведомить Роскомнадзор и получить номер в реестре операторов ПД.
              </p>
              <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mt-4">
                <p className="font-bold text-blue-800 mb-2">
                  ⚖️ Это законное требование
                </p>
                <p className="text-sm text-blue-700">
                  Регистрация <strong>бесплатная</strong> и занимает 1-2 дня. 
                  Без неё может быть наложен штраф до 75 000 рублей (ст. 13.11 КоАП РФ).
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ClipboardList" size={20} className="text-primary" />
                Пошаговая инструкция
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">Откройте сайт Роскомнадзора</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Перейдите на официальный сайт: 
                    </p>
                    <a 
                      href="https://pd.rkn.gov.ru/operators-registry/operators-notification/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      <Icon name="ExternalLink" size={16} />
                      pd.rkn.gov.ru/operators-registry/operators-notification/
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">Подготовьте документы</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Для регистрации вам понадобятся:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li>Паспорт (серия, номер, кем выдан, дата выдачи)</li>
                      <li>ИНН самозанятого (290540407146)</li>
                      <li>Адрес регистрации</li>
                      <li>Email для связи (gagarskaal@gmail.com)</li>
                      <li>Описание деятельности ("Информационная платформа Tech Forma")</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">Заполните форму уведомления</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      На сайте выберите "Направить уведомление" и заполните:
                    </p>
                    <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                      <p><strong>Тип оператора:</strong> Индивидуальный предприниматель / Самозанятый</p>
                      <p><strong>ФИО:</strong> Гагарская Елизавета Александровна</p>
                      <p><strong>ИНН:</strong> 290540407146</p>
                      <p><strong>Цель обработки:</strong> Предоставление доступа к платформе Tech Forma</p>
                      <p><strong>Категории субъектов:</strong> Студенты, учащиеся, авторы работ</p>
                      <p><strong>Обрабатываемые данные:</strong> ФИО, email, история покупок, платежные данные</p>
                      <p><strong>Срок обработки:</strong> До момента удаления аккаунта пользователем</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">Укажите меры защиты данных</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      В разделе "Меры по обеспечению безопасности" укажите:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li>Шифрование паролей (bcrypt, argon2)</li>
                      <li>SSL/TLS сертификаты для передачи данных</li>
                      <li>Защита от несанкционированного доступа (авторизация)</li>
                      <li>Резервное копирование баз данных</li>
                      <li>Обработка платежей через сертифицированные платежные системы (ЮКасса, CloudPayments)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    5
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">Отправьте уведомление</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      После заполнения формы нажмите "Отправить уведомление". 
                      Вы получите электронную квитанцию на email.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    6
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">Получите регистрационный номер</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      В течение <strong>1-2 рабочих дней</strong> Роскомнадзор присвоит вам 
                      уникальный регистрационный номер (например: 77-22-012345).
                    </p>
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 mt-3">
                      <p className="font-bold text-green-800 mb-1 text-sm">
                        ✅ После получения номера
                      </p>
                      <p className="text-sm text-green-700">
                        Добавьте его в раздел "Общие положения" Политики конфиденциальности на сайте.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-500/30 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="AlertCircle" size={20} className="text-orange-600" />
                Важные моменты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Icon name="CheckCircle" size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Регистрация бесплатная</strong> — Роскомнадзор не берёт плату за внесение в реестр
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="CheckCircle" size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Один раз на весь проект</strong> — регистрация действует пока проект работает
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="CheckCircle" size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Изменения нужно сообщать</strong> — если поменялся адрес, цель обработки данных или состав данных — подайте уведомление об изменениях
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="CheckCircle" size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Проверка номера в реестре</strong> — любой пользователь может проверить ваш номер на сайте Роскомнадзора
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileText" size={20} className="text-primary" />
                Что делать после регистрации?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                После получения регистрационного номера необходимо <strong>обновить Политику конфиденциальности</strong> на сайте.
              </p>
              <p>
                В разделе "1. Общие положения" добавьте строку:
              </p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <p className="text-foreground">
                  Сведения об операторе ПД включены в реестр операторов персональных данных Роскомнадзора 
                  (регистрационный номер: [ВАШ НОМЕР], дата регистрации: [ДАТА]).
                </p>
              </div>
              <p className="text-sm mt-4">
                Пример: "регистрационный номер: 77-22-012345, дата регистрации: 30.10.2024"
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Link" size={20} className="text-primary" />
                Полезные ссылки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a 
                href="https://pd.rkn.gov.ru/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Icon name="ExternalLink" size={16} />
                Официальный сайт реестра операторов ПД
              </a>
              <a 
                href="https://pd.rkn.gov.ru/operators-registry/operators-notification/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Icon name="ExternalLink" size={16} />
                Форма для подачи уведомления
              </a>
              <a 
                href="https://pd.rkn.gov.ru/operators-registry/search-registry/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Icon name="ExternalLink" size={16} />
                Поиск по реестру операторов ПД
              </a>
              <a 
                href="http://publication.pravo.gov.ru/Document/View/0001202007270001" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Icon name="ExternalLink" size={16} />
                ФЗ-152 "О персональных данных" (полный текст)
              </a>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-6">
            <Button asChild size="lg">
              <Link to="/">
                <Icon name="Home" size={18} className="mr-2" />
                Вернуться на главную
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
