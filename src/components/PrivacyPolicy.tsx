import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Shield" size={32} className="text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-3">Политика конфиденциальности</h1>
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
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей платформы Tech Forma (далее — «Платформа»).
            </p>
            <p>
              Используя Платформу, вы соглашаетесь с условиями настоящей Политики конфиденциальности. Если вы не согласны с данными условиями, пожалуйста, не используйте Платформу.
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
          <CardContent className="space-y-3 text-muted-foreground">
            <p><strong>Мы собираем следующую информацию:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Email адрес для регистрации и связи</li>
              <li>Имя пользователя (никнейм)</li>
              <li>Информацию о транзакциях и покупках баллов</li>
              <li>Загруженные работы и файлы</li>
              <li>Обращения в техническую поддержку</li>
              <li>Техническую информацию (IP-адрес, браузер, операционная система)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Target" size={20} className="text-primary" />
              3. Цели обработки данных
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p><strong>Мы используем ваши данные для:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Предоставления доступа к функционалу Платформы</li>
              <li>Обработки платежей и транзакций</li>
              <li>Технической поддержки пользователей</li>
              <li>Улучшения качества сервиса</li>
              <li>Предотвращения мошенничества и нарушений</li>
              <li>Отправки важных уведомлений о работе Платформы</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Lock" size={20} className="text-primary" />
              4. Защита данных
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Мы применяем современные технические и организационные меры для защиты ваших персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Шифрование данных при передаче (SSL/TLS)</li>
              <li>Безопасное хранение в защищенных базах данных</li>
              <li>Ограниченный доступ к персональным данным</li>
              <li>Регулярный аудит безопасности</li>
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
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Мы не продаем и не передаем ваши персональные данные третьим лицам, за исключением следующих случаев:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Платежные системы для обработки платежей</li>
              <li>По требованию законодательства или государственных органов</li>
              <li>С вашего явного согласия</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Cookie" size={20} className="text-primary" />
              6. Файлы cookie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Платформа использует файлы cookie для улучшения пользовательского опыта, сохранения настроек и анализа использования сервиса. Вы можете настроить браузер для блокировки cookie, однако это может ограничить функциональность Платформы.
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
          <CardContent className="space-y-3 text-muted-foreground">
            <p><strong>Вы имеете право:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Получить доступ к своим персональным данным</li>
              <li>Исправить неточные данные</li>
              <li>Удалить свои данные (право на забвение)</li>
              <li>Ограничить обработку данных</li>
              <li>Отозвать согласие на обработку данных</li>
              <li>Получить копию данных в машиночитаемом формате</li>
            </ul>
            <p className="mt-4">
              Для реализации своих прав, пожалуйста, свяжитесь с нами через форму поддержки на сайте.
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
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Мы храним ваши персональные данные в течение срока, необходимого для достижения целей обработки, или в соответствии с требованиями законодательства. После удаления аккаунта ваши данные будут безвозвратно удалены в течение 30 дней.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Baby" size={20} className="text-primary" />
              9. Возрастные ограничения
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Платформа предназначена для лиц старше 14 лет. Мы не собираем намеренно персональные данные детей младше 14 лет без согласия родителей или законных представителей.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="RefreshCw" size={20} className="text-primary" />
              10. Изменения в политике
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Мы можем периодически обновлять настоящую Политику конфиденциальности. Существенные изменения будут опубликованы на данной странице с указанием даты обновления. Рекомендуем регулярно проверять эту страницу.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Mail" size={20} className="text-primary" />
              11. Контакты
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              По всем вопросам, связанным с обработкой персональных данных, вы можете обратиться через форму поддержки на сайте.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}