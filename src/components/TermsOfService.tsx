import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function TermsOfService() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="FileText" size={32} className="text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-3">Пользовательское соглашение</h1>
        <p className="text-muted-foreground">
          Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="FileCheck" size={20} className="text-primary" />
              1. Принятие условий
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между владельцем платформы Tech Forma (далее — «Администрация») и пользователями платформы (далее — «Пользователь»).
            </p>
            <p>
              Регистрируясь и используя Платформу, вы подтверждаете, что прочитали, поняли и согласны соблюдать условия настоящего Соглашения.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Sparkles" size={20} className="text-primary" />
              2. Описание сервиса
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Tech Forma — это образовательная платформа для обмена студенческими работами (курсовые, дипломы, чертежи, практические работы и другие учебные материалы).
            </p>
            <p><strong>Платформа предоставляет возможность:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Просматривать каталог доступных работ</li>
              <li>Приобретать работы за внутреннюю валюту (баллы)</li>
              <li>Загружать собственные работы для продажи</li>
              <li>Получать баллы за загруженные материалы</li>
              <li>Обмениваться опытом с другими студентами</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="UserPlus" size={20} className="text-primary" />
              3. Регистрация и аккаунт
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p><strong>3.1.</strong> Для использования функционала Платформы необходимо пройти регистрацию.</p>
            <p><strong>3.2.</strong> При регистрации вы обязуетесь предоставлять достоверную информацию.</p>
            <p><strong>3.3.</strong> Вы несете ответственность за сохранность данных для входа в аккаунт.</p>
            <p><strong>3.4.</strong> Запрещается передавать доступ к своему аккаунту третьим лицам.</p>
            <p><strong>3.5.</strong> Вы должны быть старше 14 лет для использования Платформы.</p>
            <p><strong>3.6.</strong> Один пользователь может иметь только один аккаунт.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Coins" size={20} className="text-primary" />
              4. Балльная система и платежи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p><strong>4.1.</strong> Баллы — внутренняя валюта Платформы, используемая для приобретения работ.</p>
            <p><strong>4.2.</strong> Баллы приобретаются за реальные деньги согласно актуальному курсу.</p>
            <p><strong>4.3.</strong> Баллы не подлежат возврату в денежном эквиваленте.</p>
            <p><strong>4.4.</strong> Все платежи обрабатываются через безопасные платежные системы.</p>
            <p><strong>4.5.</strong> Стоимость баллов и работ может изменяться Администрацией.</p>
            <p><strong>4.6.</strong> После покупки работы баллы списываются и не возвращаются.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Upload" size={20} className="text-primary" />
              5. Загрузка и продажа работ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p><strong>5.1.</strong> Пользователи могут загружать свои работы для продажи другим пользователям.</p>
            <p><strong>5.2.</strong> Загружая работу, вы подтверждаете, что:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Являетесь автором работы или имеете право на её распространение</li>
              <li>Работа не нарушает авторские права третьих лиц</li>
              <li>Работа не содержит запрещенного контента</li>
              <li>Работа соответствует заявленному описанию</li>
            </ul>
            <p><strong>5.3.</strong> Администрация оставляет за собой право модерировать загруженные работы.</p>
            <p><strong>5.4.</strong> Работы, нарушающие правила, будут удалены без возврата баллов.</p>
            <p><strong>5.5.</strong> Вы получаете баллы за каждое скачивание вашей работы согласно установленной цене.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={20} className="text-primary" />
              6. Запрещенные действия
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p><strong>Запрещается:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Загружать чужие работы без разрешения автора</li>
              <li>Размещать материалы с вирусами или вредоносным кодом</li>
              <li>Использовать автоматизированные средства для доступа к Платформе</li>
              <li>Попытки взлома или обхода систем защиты</li>
              <li>Создание множественных аккаунтов</li>
              <li>Спам, мошенничество, обман других пользователей</li>
              <li>Размещение незаконного, оскорбительного или неприемлемого контента</li>
              <li>Перепродажа приобретенных работ</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Copyright" size={20} className="text-primary" />
              7. Интеллектуальная собственность
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p><strong>7.1.</strong> Все права на Платформу принадлежат Администрации.</p>
            <p><strong>7.2.</strong> Права на загруженные работы остаются у их авторов.</p>
            <p><strong>7.3.</strong> Покупая работу, вы получаете право на личное использование в образовательных целях.</p>
            <p><strong>7.4.</strong> Запрещается коммерческое использование приобретенных работ без согласия автора.</p>
            <p><strong>7.5.</strong> Администрация не несет ответственности за нарушение авторских прав пользователями.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="ShieldOff" size={20} className="text-primary" />
              8. Ограничение ответственности
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p><strong>8.1.</strong> Платформа предоставляется «как есть» без каких-либо гарантий.</p>
            <p><strong>8.2.</strong> Администрация не гарантирует бесперебойную работу Платформы.</p>
            <p><strong>8.3.</strong> Администрация не несет ответственности за:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Качество и точность загруженных работ</li>
              <li>Действия других пользователей</li>
              <li>Потерю данных или убытки от использования Платформы</li>
              <li>Технические сбои и перерывы в работе</li>
            </ul>
            <p><strong>8.4.</strong> Ответственность Администрации ограничена суммой, уплаченной пользователем за последние 30 дней.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Ban" size={20} className="text-primary" />
              9. Приостановка и удаление аккаунта
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p><strong>9.1.</strong> Администрация вправе заблокировать или удалить аккаунт при нарушении правил.</p>
            <p><strong>9.2.</strong> При блокировке баллы не возвращаются.</p>
            <p><strong>9.3.</strong> Пользователь может самостоятельно удалить аккаунт через настройки профиля.</p>
            <p><strong>9.4.</strong> После удаления аккаунта все данные удаляются безвозвратно.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Edit" size={20} className="text-primary" />
              10. Изменение условий
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Администрация оставляет за собой право изменять условия настоящего Соглашения. Изменения вступают в силу с момента публикации на Платформе. Продолжение использования Платформы после изменений означает принятие новых условий.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Scale" size={20} className="text-primary" />
              11. Разрешение споров
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p><strong>11.1.</strong> В случае возникновения споров стороны обязуются решать их путем переговоров.</p>
            <p><strong>11.2.</strong> При невозможности урегулирования споры передаются в суд по месту нахождения Администрации.</p>
            <p><strong>11.3.</strong> К отношениям сторон применяется законодательство Российской Федерации.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Mail" size={20} className="text-primary" />
              12. Контактная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>По всем вопросам, связанным с работой Платформы, обращайтесь:</p>
            <ul className="list-none space-y-2">
              <li className="flex items-center gap-2">
                <Icon name="Mail" size={16} className="text-primary" />
                Email: rekrutiw@yandex.ru
              </li>
              <li className="flex items-center gap-2">
                <Icon name="MessageSquare" size={16} className="text-primary" />
                Техническая поддержка на сайте
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
