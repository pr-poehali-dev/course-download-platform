import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';
import WorksFilters from '@/components/WorksFilters';
import WorksTable from '@/components/WorksTable';
import WorkEditDialog from '@/components/WorkEditDialog';

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
  yandex_disk_link?: string;
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
      console.log('Sending update request for work:', editingWork.id);
      console.log('Update data:', {
        workId: editingWork.id,
        title: editingWork.title,
        description: editingWork.description,
        composition: editingWork.composition,
        coverImages: editingWork.cover_images || [],
        previewImageUrl: editingWork.preview_image_url || '',
        yandex_disk_link: editingWork.yandex_disk_link || '',
        category: editingWork.category,
        price_points: editingWork.price_points,
        status: editingWork.status
      });
      
      const response = await fetch(func2url['update-work'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workId: editingWork.id,
          title: editingWork.title,
          description: editingWork.description,
          composition: editingWork.composition,
          coverImages: editingWork.cover_images || [],
          previewImageUrl: editingWork.preview_image_url || '',
          yandex_disk_link: editingWork.yandex_disk_link || '',
          category: editingWork.category,
          price_points: editingWork.price_points,
          status: editingWork.status
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

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
      console.error('Error updating work:', error);
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
    try {
      console.log('Changing work status:', workId, newStatus);
      
      const response = await fetch(func2url['update-work'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workId: workId,
          status: newStatus
        })
      });

      const data = await response.json();
      console.log('Status change response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка при изменении статуса');
      }

      const updatedWorks = works.map(w => 
        w.id === workId ? { ...w, status: newStatus } : w
      );
      setWorks(updatedWorks);

      toast({
        title: 'Статус изменен',
        description: `Статус работы изменен на "${newStatus}"`
      });
    } catch (error) {
      console.error('Error changing status:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось изменить статус',
        variant: 'destructive'
      });
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

  const filteredWorks = works.filter(work => {
    const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || work.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || work.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <WorksFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        loading={loading}
        onBulkApprove={handleBulkApprove}
        onRemoveDuplicates={handleRemoveDuplicates}
      />

      <WorksTable
        works={filteredWorks}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />

      <WorkEditDialog
        work={editingWork}
        open={!!editingWork}
        onOpenChange={(open) => !open && setEditingWork(null)}
        onSave={handleSaveEdit}
        onWorkChange={setEditingWork}
      />
    </div>
  );
}