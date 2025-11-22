import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

interface WorkFileManagerProps {
  files: string[];
  onFilesChange: (files: string[]) => void;
}

export default function WorkFileManager({ files, onFilesChange }: WorkFileManagerProps) {
  const [currentFileUrl, setCurrentFileUrl] = useState('');

  const handleAddFile = () => {
    if (currentFileUrl.trim()) {
      onFilesChange([...files, currentFileUrl.trim()]);
      setCurrentFileUrl('');
      toast({
        title: 'Файл добавлен',
        description: 'Изображение добавлено в список'
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <Label>Дополнительные изображения (URL)</Label>
      <p className="text-sm text-muted-foreground">Опционально: добавьте ссылки на изображения</p>
      <div className="flex gap-2">
        <Input
          placeholder="https://example.com/image.jpg"
          value={currentFileUrl}
          onChange={(e) => setCurrentFileUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFile())}
        />
        <Button type="button" onClick={handleAddFile} variant="outline">
          <Icon name="Plus" size={18} className="mr-2" />
          Добавить
        </Button>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-2 mt-4">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Icon name="Link" size={16} className="text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate flex-1">{file}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(index)}
                className="flex-shrink-0"
              >
                <Icon name="Trash2" size={16} className="text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
