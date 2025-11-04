import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';
import SupportTab from '@/components/profile/SupportTab';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  email: string;
  balance: number;
  onLogout: () => void;
  purchases: any[];
  onOpenReferral: () => void;
  userId: number | null;
  onBalanceUpdate: (newBalance: number) => void;
}

export default function ProfileDialog({ 
  open, 
  onOpenChange, 
  username, 
  email, 
  balance,
  onLogout,
  purchases,
  onOpenReferral,
  userId,
  onBalanceUpdate
}: ProfileDialogProps) {
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ username, email });
  const [uploadForm, setUploadForm] = useState({
    title: '',
    workType: '',
    price: '',
    subject: '',
    description: '',
    file: null as File | null
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [userWorks, setUserWorks] = useState<any[]>([]);
  const [worksLoading, setWorksLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadUserWorks();
    }
  }, [open, userId]);

  const loadUserWorks = async () => {
    if (!userId) return;
    
    setWorksLoading(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/bca1c84a-e7e6-4b4c-8b15-85a8f319e0b0/user/${userId}`, {
        headers: { 'X-User-Id': userId.toString() }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserWorks(data.works || []);
      }
    } catch (error) {
      console.error('Error loading user works:', error);
    } finally {
      setWorksLoading(false);
    }
  };

  const handleUploadWork = async () => {
    if (!userId) return;
    
    if (!email) {
      toast({
        title: 'Требуется подтверждение почты',
        description: 'Подтвердите email для загрузки работ',
        variant: 'destructive'
      });
      return;
    }
    
    setUploadLoading(true);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(uploadForm.file!);
      
      reader.onload = async () => {
        const base64Data = reader.result as string;
        
        const uploadData = {
          title: uploadForm.title,
          workType: uploadForm.workType,
          subject: uploadForm.subject,
          description: uploadForm.description,
          price: parseInt(uploadForm.price),
          fileName: uploadForm.file!.name,
          fileSize: uploadForm.file!.size,
          fileData: base64Data
        };
        
        const response = await fetch('https://functions.poehali.dev/bca1c84a-e7e6-4b4c-8b15-85a8f319e0b0', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId.toString()
          },
          body: JSON.stringify(uploadData)
        });
        
        const result = await response.json();
        
        setUploadLoading(false);
        
        if (response.ok && result.success) {
          if (result.newBalance) {
            onBalanceUpdate(result.newBalance);
          }
          
          toast({
            title: 'Работа загружена!',
            description: `${result.message}. Начислено +${result.bonusEarned} баллов!`
          });
          
          setUploadForm({
            title: '',
            workType: '',
            price: '',
            subject: '',
            description: '',
            file: null
          });
          
          loadUserWorks();
        } else {
          toast({
            title: 'Ошибка загрузки',
            description: result.error || 'Не удалось загрузить работу',
            variant: 'destructive'
          });
        }
      };
      
      reader.onerror = () => {
        setUploadLoading(false);
        toast({
          title: 'Ошибка чтения файла',
          description: 'Не удалось прочитать файл',
          variant: 'destructive'
        });
      };
    } catch (error) {
      setUploadLoading(false);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при загрузке',
        variant: 'destructive'
      });
    }
  };

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

  const getStatusBadge = (status: string) => {
    const statusMap: {[key: string]: {label: string, variant: any}} = {
      'pending': { label: 'На модерации', variant: 'secondary' },
      'approved': { label: 'Одобрено', variant: 'default' },
      'rejected': { label: 'Отклонено', variant: 'destructive' }
    };
    
    const statusInfo = statusMap[status] || statusMap['pending'];
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
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
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger value="support">
              <Icon name="HelpCircle" size={16} className="mr-2" />
              Поддержка
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

          <TabsContent value="uploads" className="pt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Загрузить новую работу</CardTitle>
                <CardDescription>
                  {email ? 'Поделись своей работой и получай баллы за каждое скачивание' : 'Подтвердите email для загрузки работ'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="upload-title">Название работы <span className="text-red-500">*</span></Label>
                  <Input 
                    id="upload-title"
                    placeholder="Анализ рынка недвижимости..." 
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    disabled={!email}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="upload-type">Тип работы <span className="text-red-500">*</span></Label>
                    <Select 
                      value={uploadForm.workType}
                      onValueChange={(value) => {
                        const prices: {[key: string]: string} = {
                          'coursework': '600',
                          'diploma': '1500',
                          'dissertation': '3000',
                          'practice': '200',
                          'report': '200',
                          'referat': '200',
                          'control': '200',
                          'lab': '200'
                        };
                        setUploadForm({...uploadForm, workType: value, price: prices[value] || '600'});
                      }}
                      disabled={!email}
                    >
                      <SelectTrigger id="upload-type">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coursework">Курсовая работа (600₽)</SelectItem>
                        <SelectItem value="diploma">Дипломная работа (1500₽)</SelectItem>
                        <SelectItem value="dissertation">Диссертация (3000₽)</SelectItem>
                        <SelectItem value="practice">Отчёт по практике (200₽)</SelectItem>
                        <SelectItem value="report">Отчёт (200₽)</SelectItem>
                        <SelectItem value="referat">Реферат (200₽)</SelectItem>
                        <SelectItem value="control">Контрольная работа (200₽)</SelectItem>
                        <SelectItem value="lab">Лабораторная работа (200₽)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="upload-price">Цена в баллах <span className="text-red-500">*</span></Label>
                    <Input 
                      id="upload-price"
                      type="number" 
                      placeholder="600"
                      value={uploadForm.price}
                      onChange={(e) => setUploadForm({...uploadForm, price: e.target.value})}
                      disabled={!email}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-subject">Предмет <span className="text-red-500">*</span></Label>
                  <Input 
                    id="upload-subject"
                    placeholder="Маркетинг"
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({...uploadForm, subject: e.target.value})}
                    disabled={!email}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-description">Описание <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="upload-description"
                    placeholder="Краткое описание работы, что включено..."
                    rows={4}
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    disabled={!email}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-file">Файл работы <span className="text-red-500">*</span></Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      id="upload-file"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.dwg,.xls,.xlsx"
                      disabled={!email}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 50 * 1024 * 1024) {
                            toast({
                              title: 'Файл слишком большой',
                              description: 'Максимальный размер 50 МБ',
                              variant: 'destructive'
                            });
                            return;
                          }
                          setUploadForm({...uploadForm, file});
                        }
                      }}
                    />
                    <label htmlFor="upload-file" className="cursor-pointer">
                      {uploadForm.file ? (
                        <>
                          <Icon name="FileCheck" size={32} className="mx-auto text-green-600 mb-2" />
                          <p className="text-sm font-medium text-foreground">
                            {uploadForm.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(uploadForm.file.size / 1024 / 1024).toFixed(2)} МБ
                          </p>
                        </>
                      ) : (
                        <>
                          <Icon name="Upload" size={32} className="mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Перетащите файл сюда или нажмите для выбора
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            PDF, DOC, DOCX, DWG до 50 МБ
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!email || uploadLoading || !uploadForm.title || !uploadForm.workType || !uploadForm.price || !uploadForm.subject || !uploadForm.description || !uploadForm.file}
                  onClick={handleUploadWork}
                >
                  {uploadLoading ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="Upload" size={18} className="mr-2" />
                      Загрузить работу
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Мои загруженные работы</h3>
                <Badge variant="secondary">{userWorks.length} работ</Badge>
              </div>

              {worksLoading ? (
                <div className="text-center py-12">
                  <Icon name="Loader2" size={48} className="mx-auto text-muted-foreground mb-4 animate-spin" />
                  <p className="text-muted-foreground">Загрузка...</p>
                </div>
              ) : userWorks.length > 0 ? (
                userWorks.map((work) => (
                  <Card key={work.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-base">{work.title}</CardTitle>
                            {getStatusBadge(work.moderation_status)}
                          </div>
                          <CardDescription className="space-y-1">
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Icon name="BookOpen" size={14} />
                                {work.work_type}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="GraduationCap" size={14} />
                                {work.subject}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Coins" size={14} />
                                {work.price_points} баллов
                              </span>
                            </div>
                            {work.moderation_status === 'approved' && (
                              <div className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1 text-green-600">
                                  <Icon name="Download" size={14} />
                                  {work.downloads_count || 0} скачиваний
                                </span>
                                <span className="flex items-center gap-1 text-green-600">
                                  <Icon name="TrendingUp" size={14} />
                                  Заработано: {work.earnings_total || 0} баллов
                                </span>
                              </div>
                            )}
                            {work.moderation_comment && work.moderation_status === 'rejected' && (
                              <p className="text-red-600 text-sm mt-2">
                                <Icon name="AlertCircle" size={14} className="inline mr-1" />
                                {work.moderation_comment}
                              </p>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Icon name="FileUp" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Загрузите свою первую работу выше</p>
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

          <TabsContent value="support">
            <SupportTab userEmail={email} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}