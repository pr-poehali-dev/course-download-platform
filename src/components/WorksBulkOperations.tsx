import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
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

interface WorksBulkOperationsProps {
  works: Work[];
  selectedWorks: number[];
  onSelectionChange: (workIds: number[]) => void;
  onBulkAction: (action: string) => void;
  onExport: () => void;
}

export default function WorksBulkOperations({
  works,
  selectedWorks,
  onSelectionChange,
  onBulkAction,
  onExport
}: WorksBulkOperationsProps) {
  const [bulkAction, setBulkAction] = useState<string>('');

  const handleSelectAll = () => {
    if (selectedWorks.length === works.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(works.map(w => w.id));
    }
  };

  const handleToggleWork = (workId: number) => {
    if (selectedWorks.includes(workId)) {
      onSelectionChange(selectedWorks.filter(id => id !== workId));
    } else {
      onSelectionChange([...selectedWorks, workId]);
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction) {
      toast({
        title: 'Выберите действие',
        description: 'Пожалуйста, выберите действие для выполнения',
        variant: 'destructive'
      });
      return;
    }

    if (selectedWorks.length === 0) {
      toast({
        title: 'Нет выбранных работ',
        description: 'Выберите хотя бы одну работу',
        variant: 'destructive'
      });
      return;
    }

    onBulkAction(bulkAction);
    setBulkAction('');
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Название', 'Категория', 'Цена', 'Статус', 'Загрузки'];
    const rows = works.map(w => [
      w.id,
      `"${w.title}"`,
      w.category,
      w.price_points,
      w.status || 'active',
      w.downloads || 0
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `works_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Экспорт завершён',
      description: `Экспортировано работ: ${works.length}`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedWorks.length === works.length && works.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span>Массовые операции</span>
            {selectedWorks.length > 0 && (
              <Badge variant="secondary">
                Выбрано: {selectedWorks.length}
              </Badge>
            )}
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Icon name="Download" size={16} className="mr-2" />
            Экспорт CSV
          </Button>
        </CardTitle>
        <CardDescription>
          Выберите работы и примените действия к нескольким элементам сразу
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Выберите действие..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activate">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" size={16} />
                  Активировать
                </div>
              </SelectItem>
              <SelectItem value="block">
                <div className="flex items-center gap-2">
                  <Icon name="Ban" size={16} />
                  Заблокировать
                </div>
              </SelectItem>
              <SelectItem value="moderation">
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={16} />
                  На модерацию
                </div>
              </SelectItem>
              <SelectItem value="delete">
                <div className="flex items-center gap-2 text-destructive">
                  <Icon name="Trash2" size={16} />
                  Удалить
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleBulkAction}
            disabled={selectedWorks.length === 0 || !bulkAction}
          >
            <Icon name="Play" size={16} className="mr-2" />
            Применить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
