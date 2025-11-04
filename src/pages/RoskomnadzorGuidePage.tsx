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
                    <p className="font-semibold text-foreground mb-2">Откройте форму подачи уведомления</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Перейдите напрямую в форму регистрации:
                    </p>
                    <a 
                      href="https://pd.rkn.gov.ru/operators-registry/operators-notification/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium mb-3"
                    >
                      <Icon name="ExternalLink" size={16} />
                      Открыть форму уведомления →
                    </a>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mt-3">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Совет:</strong> На странице нажмите кнопку "Направить уведомление об обработке персональных данных" — это откроет форму для заполнения.
                      </p>
                    </div>
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
                      <li>ИНН самозанятого (380416803984)</li>
                      <li>Адрес регистрации</li>
                      <li>Email для связи (rekrutiw@yandex.ru)</li>
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
                    <p className="text-sm text-muted-foreground mb-3">
                      В открывшейся форме заполните следующие поля:
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">РАЗДЕЛ 1: Сведения об операторе</p>
                        <div className="space-y-1 text-sm">
                          <p><strong>Организационно-правовая форма:</strong> Физическое лицо (самозанятый)</p>
                          <p><strong>ФИО:</strong> Рекрутив Максим Станиславович</p>
                          <p><strong>ИНН:</strong> 380416803984</p>
                          <p><strong>Адрес:</strong> [ваш адрес регистрации по паспорту]</p>
                          <p><strong>Email:</strong> rekrutiw@yandex.ru</p>
                        </div>
                      </div>

                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">РАЗДЕЛ 2: Цели обработки персональных данных</p>
                        <div className="space-y-1 text-sm">
                          <p><strong>Цель:</strong> Предоставление доступа к информационной платформе Tech Forma для обмена студенческими работами</p>
                          <p><strong>Описание деятельности:</strong> Информационная платформа для студентов, обеспечивающая возможность загрузки, поиска и покупки учебных материалов</p>
                        </div>
                      </div>

                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">РАЗДЕЛ 3: Категории субъектов персональных данных</p>
                        <div className="space-y-1 text-sm">
                          <p><strong>Категории:</strong> Студенты, учащиеся, авторы работ, пользователи платформы</p>
                        </div>
                      </div>

                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">РАЗДЕЛ 4: Перечень персональных данных</p>
                        <div className="space-y-1 text-sm">
                          <p><strong>Обрабатываемые данные:</strong></p>
                          <ul className="list-disc list-inside ml-3 space-y-0.5">
                            <li>ФИО</li>
                            <li>Адрес электронной почты (email)</li>
                            <li>История покупок и транзакций</li>
                            <li>Платежные данные (обрабатываются через ЮКасса/CloudPayments)</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">РАЗДЕЛ 5: Сроки обработки</p>
                        <div className="space-y-1 text-sm">
                          <p><strong>Срок:</strong> До момента удаления аккаунта пользователем или прекращения деятельности платформы</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">Укажите меры защиты данных</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      В разделе <strong>"Сведения о мерах по обеспечению безопасности персональных данных"</strong> опишите:
                    </p>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <p className="font-semibold mb-2">Скопируйте и вставьте в форму:</p>
                      <div className="bg-background p-3 rounded border">
                        <p className="leading-relaxed">
                          Применяются следующие меры защиты персональных данных:<br/>
                          1. Криптографическое шифрование паролей (bcrypt, argon2)<br/>
                          2. Использование SSL/TLS сертификатов для защищенной передачи данных<br/>
                          3. Система авторизации и аутентификации пользователей<br/>
                          4. Регулярное резервное копирование баз данных<br/>
                          5. Обработка платежных данных исключительно через сертифицированные платежные системы (ЮКасса, CloudPayments) в соответствии с PCI DSS<br/>
                          6. Ограничение доступа к базам данных (только авторизованный персонал)<br/>
                          7. Мониторинг несанкционированного доступа
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    5
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">Проверьте и отправьте уведомление</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        1. Внимательно проверьте все заполненные поля (особенно ИНН и email)
                      </p>
                      <p>
                        2. Поставьте галочку "Подтверждаю достоверность указанных сведений"
                      </p>
                      <p>
                        3. Нажмите кнопку <strong>"Направить уведомление"</strong>
                      </p>
                      <p className="mt-3">
                        ✅ На ваш email <strong>rekrutiw@yandex.ru</strong> придет электронная квитанция с номером обращения.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    6
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">Получите регистрационный номер</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        В течение <strong>1-2 рабочих дней</strong> на email <strong>rekrutiw@yandex.ru</strong> придет письмо с регистрационным номером.
                      </p>
                      <p>
                        Номер выглядит так: <code className="bg-muted px-2 py-1 rounded">77-22-012345</code>
                      </p>
                      <p>
                        Вы также можете проверить статус на сайте Роскомнадзора в разделе "Проверить статус обращения" по номеру квитанции.
                      </p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 mt-3">
                      <p className="font-bold text-green-800 mb-2 text-sm">
                        ✅ Что делать после получения номера?
                      </p>
                      <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                        <li>Сохраните письмо с номером в надежное место</li>
                        <li>Добавьте номер в Политику конфиденциальности на сайте</li>
                        <li>Укажите его в договоре-оферте (если есть)</li>
                      </ol>
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