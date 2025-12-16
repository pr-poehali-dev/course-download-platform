import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface UploadsTabProps {
  uploadForm: {
    title: string;
    workType: string;
    price: string;
    subject: string;
    description: string;
    file: File | null;
    files: File[];
  };
  uploadLoading: boolean;
  userWorks: any[];
  worksLoading: boolean;
  email: string;
  onUploadFormChange: (form: any) => void;
  onUploadWork: () => void;
  getStatusBadge: (status: string) => JSX.Element;
}

export default function UploadsTab({
  uploadForm,
  uploadLoading,
  userWorks,
  worksLoading,
  email,
  onUploadFormChange,
  onUploadWork,
  getStatusBadge
}: UploadsTabProps) {
  return (
    <div className="space-y-6 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>Загрузить новую работу</CardTitle>
          <CardDescription>
            Поделитесь своей работой и зарабатывайте баллы. Теперь можно загружать до 10 файлов одновременно!
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
          
          <div>
            <Label htmlFor="work-title">Название работы *</Label>
            <Input
              id="work-title"
              placeholder="Например: Курсовая по математике"
              value={uploadForm.title}
              onChange={(e) => onUploadFormChange({ ...uploadForm, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="work-type">Тип работы *</Label>
            <Select
              value={uploadForm.workType}
              onValueChange={(value) => onUploadFormChange({ ...uploadForm, workType: value })}
            >
              <SelectTrigger id="work-type">
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
            <Label htmlFor="subject">Предмет *</Label>
            <Input
              id="subject"
              placeholder="Например: Математика"
              value={uploadForm.subject}
              onChange={(e) => onUploadFormChange({ ...uploadForm, subject: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="price">Цена (баллы) *</Label>
            <Input
              id="price"
              type="number"
              placeholder="600"
              value={uploadForm.price}
              onChange={(e) => onUploadFormChange({ ...uploadForm, price: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Рекомендуемая цена: 600 баллов
            </p>
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Опишите вашу работу..."
              value={uploadForm.description}
              onChange={(e) => onUploadFormChange({ ...uploadForm, description: e.target.value })}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="files">Файл работы *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                id="files"
                type="file"
                multiple
                className="hidden"
                key={uploadForm.files.length}
                accept=".rar,.zip,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dwg,.dxf,.cdw,.frw,.step"
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files || []);
                  const existingFiles = uploadForm.files || [];
                  const totalFiles = [...existingFiles, ...selectedFiles];
                  
                  if (totalFiles.length > 10) {
                    alert(`Можно загрузить максимум 10 файлов. У вас уже ${existingFiles.length}, вы пытаетесь добавить ${selectedFiles.length}`);
                    return;
                  }
                  
                  onUploadFormChange({ ...uploadForm, files: totalFiles, file: totalFiles[0] || null });
                  e.target.value = '';
                }}
              />
              
              {uploadForm.files && uploadForm.files.length > 0 ? (
                <div className="space-y-3">
                  {uploadForm.files.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 bg-muted/50 px-4 py-3 rounded-lg">
                      <Icon name="Upload" size={32} className="text-primary" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} МБ</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = uploadForm.files.filter((_, i) => i !== index);
                          onUploadFormChange({ ...uploadForm, files: newFiles, file: newFiles[0] || null });
                        }}
                        className="hover:text-destructive"
                      >
                        <Icon name="X" size={20} />
                      </button>
                    </div>
                  ))}
                  {uploadForm.files.length < 10 && (
                    <label htmlFor="files" className="text-primary hover:underline cursor-pointer inline-block font-medium">
                      + Добавить ещё файлы (макс. {10 - uploadForm.files.length})
                    </label>
                  )}
                </div>
              ) : (
                <label htmlFor="files" className="cursor-pointer block">
                  <Icon name="Upload" size={48} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Нажмите для выбора файлов</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Можно выбрать до 10 файлов одновременно
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Поддерживаемые форматы: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, DWG, CDW, FRW, MAX, SPW, KOMPAS, A3D, M3D, RAR, ZIP, 7Z
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Максимальный размер одного файла: 50 МБ
                  </p>
                </label>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={onUploadWork}
            disabled={
              uploadLoading ||
              !uploadForm.title ||
              !uploadForm.workType ||
              !uploadForm.subject ||
              !uploadForm.price ||
              (!uploadForm.file && (!uploadForm.files || uploadForm.files.length === 0))
            }
            className="w-full"
          >
            {uploadLoading ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Icon name="Upload" size={16} className="mr-2" />
                Загрузить работу
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Мои загруженные работы</CardTitle>
          <CardDescription>Все ваши работы на модерации и опубликованные</CardDescription>
        </CardHeader>
        <CardContent>
          {worksLoading ? (
            <div className="text-center py-8">
              <Icon name="Loader2" size={48} className="mx-auto mb-4 opacity-50 animate-spin" />
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : userWorks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="FileUp" size={48} className="mx-auto mb-4 opacity-50" />
              <p>У вас пока нет загруженных работ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userWorks.map((work) => (
                <div key={work.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{work.title}</h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary">{work.work_type}</Badge>
                      <Badge variant="outline">{work.subject}</Badge>
                      {getStatusBadge(work.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Загружено: {new Date(work.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-lg">{work.price_points} баллов</p>
                    {work.status === 'approved' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Продано: {work.purchase_count || 0} раз
                      </p>
                    )}
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