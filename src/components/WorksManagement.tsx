import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Work {
  id: number;
  title: string;
  description: string;
  category: string;
  price_points: number;
  author?: string;
  downloads?: number;
  status?: 'active' | 'moderation' | 'blocked';
}

export default function WorksManagement() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/a16a43fc-fa7d-4c72-ad15-ba566d2c7413');
      const data = await response.json();
      if (data.works) {
        const worksWithStatus = data.works.map((w: any) => ({
          ...w,
          id: w.id || Math.random(),
          status: w.status || 'active',
          downloads: w.downloads || 0,
          author: w.author || 'Неизвестен'
        }));
        setWorks(worksWithStatus);
      }
    } catch (error) {
      console.error('Failed to load works:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить список работ',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (work: Work) => {
    setEditingWork(work);
  };

  const handleSaveEdit = async () => {
    if (!editingWork) return;

    toast({
      title: 'Работа обновлена',
      description: `"${editingWork.title}" успешно обновлена`
    });
    
    const updatedWorks = works.map(w => w.id === editingWork.id ? editingWork : w);
    setWorks(updatedWorks);
    setEditingWork(null);
  };

  const handleDelete = async (workId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту работу?')) return;

    const updatedWorks = works.filter(w => w.id !== workId);
    setWorks(updatedWorks);

    toast({
      title: 'Работа удалена',
      description: 'Работа успешно удалена из каталога'
    });
  };

  const handleStatusChange = async (workId: number, newStatus: 'active' | 'moderation' | 'blocked') => {
    const updatedWorks = works.map(w => 
      w.id === workId ? { ...w, status: newStatus } : w
    );
    setWorks(updatedWorks);

    toast({
      title: 'Статус изменен',
      description: `Статус работы изменен на "${newStatus}"`
    });
  };

  const filteredWorks = works.filter(work => {
    const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || work.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || work.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Активна</Badge>;
      case 'moderation':
        return <Badge className="bg-yellow-500">На модерации</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Заблокирована</Badge>;
      default:
        return <Badge>Активна</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Фильтры и поиск</CardTitle>
          <CardDescription>Найдите нужную работу для редактирования</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Поиск по названию</Label>
              <Input
                placeholder="Введите название..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Категория</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="Информатика">Информатика</SelectItem>
                  <SelectItem value="Экономика">Экономика</SelectItem>
                  <SelectItem value="Менеджмент">Менеджмент</SelectItem>
                  <SelectItem value="Маркетинг">Маркетинг</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="moderation">На модерации</SelectItem>
                  <SelectItem value="blocked">Заблокированные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список работ ({filteredWorks.length})</CardTitle>
          <CardDescription>Управление всеми работами в каталоге</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Icon name="Loader2" size={32} className="animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Загрузка работ...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorks.map((work) => (
                <div key={work.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{work.title}</h3>
                        {getStatusBadge(work.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{work.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="Tag" size={14} />
                          {work.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Coins" size={14} />
                          {work.price_points} баллов
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Download" size={14} />
                          {work.downloads} скачиваний
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(work)}>
                            <Icon name="Edit" size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Редактирование работы</DialogTitle>
                            <DialogDescription>Измените информацию о работе</DialogDescription>
                          </DialogHeader>
                          {editingWork && editingWork.id === work.id && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Название</Label>
                                <Input
                                  value={editingWork.title}
                                  onChange={(e) => setEditingWork({...editingWork, title: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Описание</Label>
                                <Textarea
                                  value={editingWork.description}
                                  onChange={(e) => setEditingWork({...editingWork, description: e.target.value})}
                                  rows={4}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Категория</Label>
                                  <Select 
                                    value={editingWork.category} 
                                    onValueChange={(value) => setEditingWork({...editingWork, category: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Информатика">Информатика</SelectItem>
                                      <SelectItem value="Экономика">Экономика</SelectItem>
                                      <SelectItem value="Менеджмент">Менеджмент</SelectItem>
                                      <SelectItem value="Маркетинг">Маркетинг</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Цена (баллы)</Label>
                                  <Input
                                    type="number"
                                    value={editingWork.price_points}
                                    onChange={(e) => setEditingWork({...editingWork, price_points: parseInt(e.target.value)})}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Статус</Label>
                                <Select 
                                  value={editingWork.status} 
                                  onValueChange={(value: any) => setEditingWork({...editingWork, status: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Активна</SelectItem>
                                    <SelectItem value="moderation">На модерации</SelectItem>
                                    <SelectItem value="blocked">Заблокирована</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingWork(null)}>
                                  Отмена
                                </Button>
                                <Button onClick={handleSaveEdit}>
                                  <Icon name="Save" size={16} className="mr-2" />
                                  Сохранить
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Select 
                        value={work.status} 
                        onValueChange={(value: any) => handleStatusChange(work.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">
                            <span className="flex items-center gap-2">
                              <Icon name="Check" size={14} />
                              Активна
                            </span>
                          </SelectItem>
                          <SelectItem value="moderation">
                            <span className="flex items-center gap-2">
                              <Icon name="Clock" size={14} />
                              Модерация
                            </span>
                          </SelectItem>
                          <SelectItem value="blocked">
                            <span className="flex items-center gap-2">
                              <Icon name="Ban" size={14} />
                              Блокировать
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(work.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
