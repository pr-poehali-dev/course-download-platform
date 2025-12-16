import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface WorkItem {
  id: string;
  title: string;
  workType: string;
  price: string;
  subject: string;
  description: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface BulkUploadTabProps {
  email: string;
  userId: string;
  onBalanceUpdate: (newBalance: number) => void;
  onWorkUploaded: () => void;
}

export default function BulkUploadTab({ email, userId, onBalanceUpdate, onWorkUploaded }: BulkUploadTabProps) {
  const { toast } = useToast();
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentForm, setCurrentForm] = useState({
    title: '',
    workType: '',
    price: '600',
    subject: '',
    description: ''
  });

  const addWorkToQueue = (file: File) => {
    const newWork: WorkItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...currentForm,
      file,
      status: 'pending',
      progress: 0
    };
    setWorks(prev => [...prev, newWork]);
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (!currentForm.title || !currentForm.workType || !currentForm.subject || !currentForm.price) {
      toast({
        title: 'Заполните все поля',
        description: 'Перед добавлением файлов заполните информацию о работе',
        variant: 'destructive'
      });
      return;
    }

    files.forEach(file => {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'Файл слишком большой',
          description: `${file.name} превышает 50 МБ`,
          variant: 'destructive'
        });
        return;
      }
      addWorkToQueue(file);
    });

    setCurrentForm({
      title: '',
      workType: '',
      price: '600',
      subject: '',
      description: ''
    });
    
    e.target.value = '';
  };

  const removeWork = (id: string) => {
    setWorks(prev => prev.filter(w => w.id !== id));
  };

  const uploadWork = async (work: WorkItem) => {
    setWorks(prev => prev.map(w => 
      w.id === work.id ? { ...w, status: 'uploading' as const, progress: 10 } : w
    ));

    try {
      const reader = new FileReader();
      
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(work.file);
      });

      setWorks(prev => prev.map(w => 
        w.id === work.id ? { ...w, progress: 30 } : w
      ));

      const response = await fetch('https://cloudapi.poehali.dev/fb387705-926b-436e-9d4f-4f064c4a4b3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: work.title,
          workType: work.workType,
          price: work.price,
          subject: work.subject,
          description: work.description,
          files: [{
            name: work.file.name,
            content: fileContent.split(',')[1],
            contentType: work.file.type || 'application/octet-stream'
          }]
        })
      });

      setWorks(prev => prev.map(w => 
        w.id === work.id ? { ...w, progress: 90 } : w
      ));

      const result = await response.json();

      if (response.ok && result.success) {
        setWorks(prev => prev.map(w => 
          w.id === work.id ? { ...w, status: 'success' as const, progress: 100 } : w
        ));
        
        if (result.newBalance) {
          onBalanceUpdate(result.newBalance);
        }
        onWorkUploaded();
      } else {
        throw new Error(result.error || 'Ошибка загрузки');
      }
    } catch (error) {
      setWorks(prev => prev.map(w => 
        w.id === work.id ? { 
          ...w, 
          status: 'error' as const, 
          progress: 0,
          error: error instanceof Error ? error.message : 'Ошибка загрузки'
        } : w
      ));
    }
  };

  const startUpload = async () => {
    setIsUploading(true);
    
    for (const work of works) {
      if (work.status === 'pending' || work.status === 'error') {
        await uploadWork(work);
      }
    }
    
    setIsUploading(false);
    
    const successCount = works.filter(w => w.status === 'success').length;
    const errorCount = works.filter(w => w.status === 'error').length;
    
    toast({
      title: 'Загрузка завершена',
      description: `Успешно: ${successCount}, Ошибок: ${errorCount}`
    });
  };

  const clearCompleted = () => {
    setWorks(prev => prev.filter(w => w.status !== 'success'));
  };

  return (
    <div className="space-y-6 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>Массовая загрузка работ</CardTitle>
          <CardDescription>
            Добавьте несколько работ в очередь и загрузите их одновременно
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!email && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <Icon name="AlertTriangle" size={20} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Требуется подтверждение почты</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Подтвердите email для загрузки работ
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bulk-title">Название работы *</Label>
              <Input
                id="bulk-title"
                placeholder="Например: Курсовая по математике"
                value={currentForm.title}
                onChange={(e) => setCurrentForm({ ...currentForm, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="bulk-type">Тип работы *</Label>
              <Select
                value={currentForm.workType}
                onValueChange={(value) => setCurrentForm({ ...currentForm, workType: value })}
              >
                <SelectTrigger id="bulk-type">
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Курсовая работа">Курсовая работа</SelectItem>
                  <SelectItem value="Дипломная работа">Дипломная работа</SelectItem>
                  <SelectItem value="Реферат">Реферат</SelectItem>
                  <SelectItem value="Контрольная работа">Контрольная работа</SelectItem>
                  <SelectItem value="Отчёт по практике">Отчёт по практике</SelectItem>
                  <SelectItem value="Лабораторная работа">Лабораторная работа</SelectItem>
                  <SelectItem value="Эссе">Эссе</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bulk-subject">Предмет *</Label>
              <Input
                id="bulk-subject"
                placeholder="Например: Математика"
                value={currentForm.subject}
                onChange={(e) => setCurrentForm({ ...currentForm, subject: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="bulk-price">Цена (баллы) *</Label>
              <Input
                id="bulk-price"
                type="number"
                placeholder="600"
                value={currentForm.price}
                onChange={(e) => setCurrentForm({ ...currentForm, price: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bulk-description">Описание</Label>
            <Textarea
              id="bulk-description"
              placeholder="Опишите вашу работу..."
              value={currentForm.description}
              onChange={(e) => setCurrentForm({ ...currentForm, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="bulk-files">Выберите файлы для добавления в очередь</Label>
            <Input
              id="bulk-files"
              type="file"
              multiple
              accept=".rar,.zip,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dwg,.dxf,.cdw,.frw,.step"
              onChange={handleFilesSelect}
              disabled={!email}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Заполните поля выше, затем выберите файлы. Каждый файл = отдельная работа
            </p>
          </div>
        </CardContent>
      </Card>

      {works.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Очередь загрузки ({works.length})</CardTitle>
                <CardDescription>
                  Готово: {works.filter(w => w.status === 'success').length}, 
                  Ошибок: {works.filter(w => w.status === 'error').length}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompleted}
                  disabled={works.filter(w => w.status === 'success').length === 0}
                >
                  Очистить загруженные
                </Button>
                <Button
                  onClick={startUpload}
                  disabled={isUploading || works.every(w => w.status === 'success')}
                >
                  {isUploading ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="Upload" size={16} className="mr-2" />
                      Загрузить все ({works.filter(w => w.status === 'pending' || w.status === 'error').length})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {works.map((work) => (
                <div key={work.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {work.status === 'pending' && <Icon name="Clock" size={16} className="text-muted-foreground" />}
                        {work.status === 'uploading' && <Icon name="Loader2" size={16} className="text-blue-500 animate-spin" />}
                        {work.status === 'success' && <Icon name="CheckCircle" size={16} className="text-green-500" />}
                        {work.status === 'error' && <Icon name="XCircle" size={16} className="text-red-500" />}
                        <p className="font-medium truncate">{work.title}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{work.workType}</span>
                        <span>•</span>
                        <span>{work.subject}</span>
                        <span>•</span>
                        <span>{work.file.name}</span>
                        <span>•</span>
                        <span>{(work.file.size / 1024 / 1024).toFixed(2)} МБ</span>
                      </div>
                      {work.error && (
                        <p className="text-xs text-red-500 mt-1">{work.error}</p>
                      )}
                    </div>
                    {work.status !== 'uploading' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWork(work.id)}
                        disabled={isUploading}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    )}
                  </div>
                  {work.status === 'uploading' && (
                    <Progress value={work.progress} className="h-1" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
