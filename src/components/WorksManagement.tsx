import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';
import PreviewUploader from '@/components/PreviewUploader';
import CoverImagesUploader from '@/components/CoverImagesUploader';
import CompositionEditor from '@/components/CompositionEditor';
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
  preview_image_url?: string;
  cover_images?: string[];
  composition?: string;
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
      const response = await fetch(func2url.works);
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

    try {
      const response = await fetch(func2url['update-work'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workId: editingWork.id,
          title: editingWork.title,
          description: editingWork.description,
          composition: editingWork.composition,
          coverImages: editingWork.cover_images || [],
          previewImageUrl: editingWork.preview_image_url || ''
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка при обновлении работы');
      }

      toast({
        title: 'Работа обновлена',
        description: `"${editingWork.title}" успешно обновлена`
      });
      
      const updatedWorks = works.map(w => w.id === editingWork.id ? editingWork : w);
      setWorks(updatedWorks);
      setEditingWork(null);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить работу',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (workId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту работу?')) return;

    try {
      const response = await fetch(`${func2url['delete-work']}?workId=${workId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Email': 'rekrutiw@yandex.ru'
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка при удалении работы');
      }

      const updatedWorks = works.filter(w => w.id !== workId);
      setWorks(updatedWorks);

      toast({
        title: 'Работа удалена',
        description: 'Работа успешно удалена из каталога'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить работу',
        variant: 'destructive'
      });
    }
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

  const handleBulkApprove = async () => {
    if (!confirm('Одобрить следующие 100 работ со статусом "pending"?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${func2url['bulk-approve-works']}?limit=100`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to bulk approve');
      
      const data = await response.json();
      
      toast({
        title: 'Успешно!',
        description: `Одобрено работ: ${data.approved}`
      });
      
      await loadWorks();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось одобрить работы',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (!confirm('Удалить все дубликаты работ? Будут удалены повторяющиеся записи с одинаковым yandex_disk_link.')) return;
    
    setLoading(true);
    try {
      const response = await fetch(func2url.works, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-Email': 'rekrutiw@yandex.ru'
        },
        body: JSON.stringify({ action: 'remove_duplicates' })
      });
      
      if (!response.ok) throw new Error('Failed to remove duplicates');
      
      const data = await response.json();
      
      toast({
        title: 'Успешно!',
        description: data.message || `Удалено дубликатов: ${data.deleted}`
      });
      
      await loadWorks();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить дубликаты',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Фильтры и поиск</CardTitle>
              <CardDescription>Найдите нужную работу для редактирования</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleRemoveDuplicates}
                disabled={loading}
                variant="destructive"
              >
                <Icon name="Copy" size={18} className="mr-2" />
                Удалить дубликаты
              </Button>
              <Button 
                onClick={handleBulkApprove}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Icon name="CheckCheck" size={18} className="mr-2" />
                Одобрить 100 работ
              </Button>
            </div>
          </div>
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
                    <div className="flex gap-2 ml-4 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const response = await fetch(`${func2url['download-work']}?workId=${work.id}&userId=admin`);
                            const data = await response.json();
                            if (data.url) {
                              const encodedUrl = encodeURI(data.url);
                              window.open(encodedUrl, '_blank');
                              toast({
                                title: 'Скачивание...',
                                description: 'Файл открывается в новой вкладке'
                              });
                            } else {
                              throw new Error('URL не найден');
                            }
                          } catch (error) {
                            toast({
                              title: 'Ошибка',
                              description: 'Не удалось скачать работу',
                              variant: 'destructive'
                            });
                          }
                        }}
                        className="gap-2"
                      >
                        <Icon name="Download" size={16} />
                        Скачать
                      </Button>
                      <PreviewUploader
                        workId={work.id}
                        workTitle={work.title}
                        currentPreviewUrl={work.preview_image_url}
                        onUploadSuccess={(newUrl) => {
                          const updatedWorks = works.map(w => 
                            w.id === work.id ? { ...w, preview_image_url: newUrl } : w
                          );
                          setWorks(updatedWorks);
                        }}
                      />
                      <CoverImagesUploader
                        workId={work.id}
                        workTitle={work.title}
                        currentImages={work.cover_images}
                        onUploadSuccess={(imageUrls) => {
                          const updatedWorks = works.map(w => 
                            w.id === work.id ? { ...w, cover_images: imageUrls } : w
                          );
                          setWorks(updatedWorks);
                        }}
                      />
                      <CompositionEditor
                        workId={work.id}
                        workTitle={work.title}
                        currentComposition={work.composition}
                        onUpdateSuccess={(newComposition) => {
                          const updatedWorks = works.map(w => 
                            w.id === work.id ? { ...w, composition: newComposition } : w
                          );
                          setWorks(updatedWorks);
                        }}
                      />
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