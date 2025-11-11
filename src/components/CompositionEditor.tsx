import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import func2url from '../../backend/func2url.json';

interface CompositionEditorProps {
  workId: number;
  workTitle: string;
  currentComposition?: string;
  onUpdateSuccess: (newComposition: string) => void;
}

export default function CompositionEditor({ 
  workId, 
  workTitle, 
  currentComposition = '',
  onUpdateSuccess 
}: CompositionEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [composition, setComposition] = useState(currentComposition);
  const [uploading, setUploading] = useState(false);

  const handleUpdate = async () => {
    if (!composition.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Содержимое не может быть пустым',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const response = await fetch(func2url['upload-work-cover'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': 'techforma2025admin'
        },
        body: JSON.stringify({
          work_id: workId,
          composition: composition
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update composition');
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: 'Содержимое архива обновлено'
        });
        onUpdateSuccess(composition);
        setIsOpen(false);
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить содержимое',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setComposition(currentComposition);
            setIsOpen(true);
          }}
        >
          <Icon name="FileText" size={16} className="mr-2" />
          Содержимое
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактирование содержимого архива</DialogTitle>
          <DialogDescription>
            Работа: {workTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Содержимое архива (список файлов)
            </label>
            <Textarea
              value={composition}
              onChange={(e) => setComposition(e.target.value)}
              placeholder="Например:&#10;1. Введение.docx&#10;2. Основная часть.docx&#10;3. Заключение.docx&#10;4. Презентация.pptx"
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={uploading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={uploading || !composition.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {uploading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Обновление...
                </>
              ) : (
                <>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
