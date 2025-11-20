import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PlatformSettings() {
  const [settings, setSettings] = useState({
    platformName: 'Tech Forma',
    platformCommission: 10,
    minPrice: 50,
    maxPrice: 5000,
    defaultPrice: 150,
    registrationBonus: 100,
    referralBonus: 50,
    autoModeration: true,
    emailNotifications: true,
    maintenanceMode: false,
    maxFileSize: 10,
    allowedFormats: 'pdf, docx, xlsx, pptx',
    supportEmail: 'tech.forma@yandex.ru',
    contactPhone: '+7 (999) 123-45-67'
  });

  const [categories, setCategories] = useState([
    { id: 1, name: 'Информатика', active: true },
    { id: 2, name: 'Экономика', active: true },
    { id: 3, name: 'Менеджмент', active: true },
    { id: 4, name: 'Маркетинг', active: true },
    { id: 5, name: 'Юриспруденция', active: false }
  ]);

  const [newCategory, setNewCategory] = useState('');

  const handleSaveSettings = () => {
    toast({
      title: 'Настройки сохранены',
      description: 'Изменения успешно применены'
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    const newCat = {
      id: categories.length + 1,
      name: newCategory,
      active: true
    };
    
    setCategories([...categories, newCat]);
    setNewCategory('');
    
    toast({
      title: 'Категория добавлена',
      description: `"${newCategory}" успешно добавлена`
    });
  };

  const handleToggleCategory = (id: number) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, active: !cat.active } : cat
    ));
  };

  const handleDeleteCategory = (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;
    
    setCategories(categories.filter(cat => cat.id !== id));
    
    toast({
      title: 'Категория удалена',
      description: 'Категория успешно удалена'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Общие настройки</CardTitle>
          <CardDescription>Основные параметры платформы</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Название платформы</Label>
              <Input
                id="platform-name"
                value={settings.platformName}
                onChange={(e) => setSettings({...settings, platformName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commission">Комиссия платформы (%)</Label>
              <Input
                id="commission"
                type="number"
                value={settings.platformCommission}
                onChange={(e) => setSettings({...settings, platformCommission: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="support-email">Email поддержки</Label>
              <Input
                id="support-email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Телефон поддержки</Label>
              <Input
                id="contact-phone"
                value={settings.contactPhone}
                onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings}>
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить общие настройки
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ценообразование</CardTitle>
          <CardDescription>Настройки цен и баллов</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-price">Минимальная цена (баллы)</Label>
              <Input
                id="min-price"
                type="number"
                value={settings.minPrice}
                onChange={(e) => setSettings({...settings, minPrice: parseInt(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-price">Максимальная цена (баллы)</Label>
              <Input
                id="max-price"
                type="number"
                value={settings.maxPrice}
                onChange={(e) => setSettings({...settings, maxPrice: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-price">Цена по умолчанию (баллы)</Label>
              <Input
                id="default-price"
                type="number"
                value={settings.defaultPrice}
                onChange={(e) => setSettings({...settings, defaultPrice: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registration-bonus">Бонус за регистрацию (баллы)</Label>
              <Input
                id="registration-bonus"
                type="number"
                value={settings.registrationBonus}
                onChange={(e) => setSettings({...settings, registrationBonus: parseInt(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="referral-bonus">Бонус за реферала (баллы)</Label>
              <Input
                id="referral-bonus"
                type="number"
                value={settings.referralBonus}
                onChange={(e) => setSettings({...settings, referralBonus: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings}>
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить настройки цен
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Управление категориями</CardTitle>
          <CardDescription>Добавление и редактирование категорий работ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Название новой категории..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <Button onClick={handleAddCategory}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить
            </Button>
          </div>

          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={category.active}
                    onCheckedChange={() => handleToggleCategory(category.id)}
                  />
                  <span className={category.active ? 'font-medium' : 'text-muted-foreground'}>
                    {category.name}
                  </span>
                  {!category.active && (
                    <span className="text-xs text-muted-foreground">(отключена)</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Icon name="Trash2" size={16} className="text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Настройки файлов</CardTitle>
          <CardDescription>Ограничения на загружаемые файлы</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="max-file-size">Максимальный размер файла (МБ)</Label>
            <Input
              id="max-file-size"
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowed-formats">Разрешенные форматы (через запятую)</Label>
            <Input
              id="allowed-formats"
              value={settings.allowedFormats}
              onChange={(e) => setSettings({...settings, allowedFormats: e.target.value})}
            />
          </div>

          <Button onClick={handleSaveSettings}>
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить настройки файлов
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Системные настройки</CardTitle>
          <CardDescription>Управление функциями платформы</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Автоматическая модерация</Label>
              <p className="text-sm text-muted-foreground">
                Автоматически одобрять работы от проверенных пользователей
              </p>
            </div>
            <Switch
              checked={settings.autoModeration}
              onCheckedChange={(checked) => setSettings({...settings, autoModeration: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email уведомления</Label>
              <p className="text-sm text-muted-foreground">
                Отправлять пользователям уведомления на email
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Режим обслуживания</Label>
              <p className="text-sm text-muted-foreground">
                Временно отключить доступ к платформе для пользователей
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
            />
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить системные настройки
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Опасная зона</CardTitle>
          <CardDescription>Действия, которые нельзя отменить</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            <Icon name="Database" size={16} className="mr-2" />
            Экспортировать все данные
          </Button>
          
          <Button variant="outline" className="w-full">
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Сбросить статистику
          </Button>

          <Button variant="destructive" className="w-full">
            <Icon name="AlertTriangle" size={16} className="mr-2" />
            Очистить все данные платформы
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}