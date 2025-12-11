import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface MentorCheckTabProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  checkRequirements: string;
  onCheckRequirementsChange: (value: string) => void;
  checkLoading: boolean;
  checkReport: string;
  onCheck: () => void;
  requirements: string;
}

export default function MentorCheckTab({
  file,
  onFileSelect,
  checkRequirements,
  onCheckRequirementsChange,
  checkLoading,
  checkReport,
  onCheck,
  requirements
}: MentorCheckTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Загрузка работы</CardTitle>
          <CardDescription>
            Загрузи PDF или DOCX файл своей работы для проверки
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Файл работы
            </Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                 onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
              />
              {file ? (
                <div className="space-y-2">
                  <Icon name="FileText" size={32} className="mx-auto text-primary" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} МБ
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileSelect(null);
                    }}
                  >
                    Выбрать другой файл
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Icon name="Upload" size={32} className="mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Нажми или перетащи файл сюда
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF или DOCX, до 10 МБ
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="check-requirements" className="text-sm font-medium mb-2 block">
              Требования для проверки (опционально)
            </Label>
            <Textarea
              id="check-requirements"
              value={checkRequirements}
              onChange={(e) => onCheckRequirementsChange(e.target.value)}
              placeholder={requirements || "Укажи требования вуза: объём, структура, ГОСТы..."}
              rows={6}
            />
          </div>

          <Button
            onClick={onCheck}
            disabled={!file || checkLoading}
            className="w-full"
            size="lg"
          >
            {checkLoading ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Анализирую...
              </>
            ) : (
              <>
                <Icon name="FileCheck" size={18} className="mr-2" />
                Проверить работу
              </>
            )}
          </Button>

          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              <Icon name="CheckCircle" size={12} className="mr-1" />
              Анализ структуры
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              Поиск ошибок
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Icon name="TrendingUp" size={12} className="mr-1" />
              Рекомендации
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Результаты проверки</CardTitle>
          <CardDescription>
            Детальный анализ работы и рекомендации по улучшению
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checkReport ? (
            <div className="prose prose-sm max-w-none">
              <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed">
                {checkReport}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="FileSearch" size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                Загрузи файл и нажми "Проверить работу",<br />
                чтобы получить детальный анализ
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
