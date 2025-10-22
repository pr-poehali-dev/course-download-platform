import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  email: string;
  balance: number;
  onLogout: () => void;
  purchases: any[];
  onOpenReferral: () => void;
}



const MOCK_UPLOADS = [
  { id: 1, title: 'Проектирование базы данных', downloads: 45, earned: 675 },
  { id: 2, title: 'Курсовая по менеджменту', downloads: 23, earned: 345 },
];

export default function ProfileDialog({ 
  open, 
  onOpenChange, 
  username, 
  email, 
  balance,
  onLogout,
  purchases,
  onOpenReferral
}: ProfileDialogProps) {
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ username, email });

  const handleSaveProfile = () => {
    toast({
      title: 'Профиль обновлён',
      description: 'Ваши данные успешно сохранены',
    });
    setEditMode(false);
  };

  const handleLogout = () => {
    onLogout();
    onOpenChange(false);
    toast({
      title: 'Вы вышли из системы',
      description: 'До скорой встречи!',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="User" size={24} className="text-primary" />
            Личный кабинет
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <Icon name="UserCircle" size={16} className="mr-2" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="purchases">
              <Icon name="ShoppingBag" size={16} className="mr-2" />
              Покупки
            </TabsTrigger>
            <TabsTrigger value="uploads">
              <Icon name="FileUp" size={16} className="mr-2" />
              Мои работы
            </TabsTrigger>
            <TabsTrigger value="referral">
              <Icon name="Users" size={16} className="mr-2" />
              Рефералы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Баланс баллов</CardTitle>
                <CardDescription>Ваши доступные средства</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="Coins" size={24} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{balance}</p>
                      <p className="text-sm text-muted-foreground">баллов</p>
                    </div>
                  </div>
                  <Button>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Пополнить
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Личные данные</CardTitle>
                  <CardDescription>Информация о вашем аккаунте</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                >
                  <Icon name={editMode ? 'X' : 'Edit'} size={16} className="mr-2" />
                  {editMode ? 'Отмена' : 'Редактировать'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-username">Никнейм</Label>
                  <Input
                    id="profile-username"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    disabled={!editMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    disabled={!editMode}
                  />
                </div>

                {editMode && (
                  <Button onClick={handleSaveProfile} className="w-full">
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить изменения
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Безопасность и бонусы</CardTitle>
                <CardDescription>Управление аккаунтом</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full">
                    <Icon name="KeyRound" size={16} className="mr-2" />
                    Пароль
                  </Button>
                  <Button variant="outline" className="w-full" onClick={onOpenReferral}>
                    <Icon name="Users" size={16} className="mr-2" />
                    Рефералка
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти из аккаунта
            </Button>
          </TabsContent>

          <TabsContent value="purchases" className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">История покупок</h3>
                <Badge variant="secondary">{purchases.length} работ</Badge>
              </div>

              {purchases.map((purchase) => (
                <Card key={purchase.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base">{purchase.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Icon name="Calendar" size={14} />
                            {purchase.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Coins" size={14} />
                            {purchase.price} баллов
                          </span>
                        </CardDescription>
                      </div>
                      <Button size="sm" variant="outline">
                        <Icon name="Download" size={14} className="mr-2" />
                        Скачать
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {purchases.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="ShoppingBag" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Вы ещё не совершали покупок</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="uploads" className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Загруженные работы</h3>
                <Badge variant="secondary">{MOCK_UPLOADS.length} работ</Badge>
              </div>

              {MOCK_UPLOADS.map((upload) => (
                <Card key={upload.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base">{upload.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Icon name="Download" size={14} />
                            {upload.downloads} скачиваний
                          </span>
                          <span className="flex items-center gap-1 text-green-600">
                            <Icon name="TrendingUp" size={14} />
                            Заработано: {upload.earned} баллов
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Icon name="Edit" size={14} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {MOCK_UPLOADS.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="FileUp" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Вы ещё не загружали работы</p>
                  <Button>
                    <Icon name="Upload" size={16} className="mr-2" />
                    Загрузить первую работу
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="referral" className="pt-4">
            <Card className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Icon name="Gift" size={48} className="mx-auto text-primary" />
                  <h3 className="text-2xl font-bold">Реферальная программа</h3>
                  <p className="text-muted-foreground">
                    Приглашайте друзей и получайте <span className="font-bold text-primary">50 баллов</span> за каждого
                  </p>
                  <Button onClick={onOpenReferral} size="lg">
                    <Icon name="Users" size={18} className="mr-2" />
                    Открыть реферальную программу
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}