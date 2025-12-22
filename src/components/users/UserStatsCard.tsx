import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface UserStatsCardProps {
  totalUsers: number;
  activeUsers: number;
  activeLastWeek: number;
  totalBalance: number;
  totalEarned: number;
  onDeleteFakeUsers: () => void;
  deletingFakeUsers: boolean;
}

export default function UserStatsCard({
  totalUsers,
  activeUsers,
  activeLastWeek,
  totalBalance,
  totalEarned,
  onDeleteFakeUsers,
  deletingFakeUsers
}: UserStatsCardProps) {
  return (
    <>
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Icon name="Activity" size={24} className="text-blue-600" />
            Статистика активности пользователей
          </CardTitle>
          <CardDescription>Реальные зарегистрированные пользователи (без тестовых аккаунтов)</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего пользователей</CardDescription>
            <CardTitle className="text-3xl">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Users" size={16} />
              <span>Зарегистрировано</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Активных</CardDescription>
            <CardTitle className="text-3xl">{activeUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Icon name="CheckCircle" size={16} />
              <span>Статус "Активен"</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <CardDescription>Активны за 7 дней</CardDescription>
            <CardTitle className="text-3xl text-green-600">{activeLastWeek}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Icon name="TrendingUp" size={16} />
              <span>Недавняя активность</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Общий баланс</CardDescription>
            <CardTitle className="text-3xl">{totalBalance}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Coins" size={16} />
              <span>Баллов в системе</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего заработано</CardDescription>
            <CardTitle className="text-3xl">{totalEarned}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="DollarSign" size={16} />
              <span>За все время</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Icon name="Trash2" size={20} />
            Опасная зона
          </CardTitle>
          <CardDescription>
            Удаление тестовых пользователей — необратимое действие
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={onDeleteFakeUsers}
            disabled={deletingFakeUsers}
            className="w-full md:w-auto"
          >
            {deletingFakeUsers ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Удаление...
              </>
            ) : (
              <>
                <Icon name="Trash2" size={16} className="mr-2" />
                Удалить всех тестовых пользователей
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
