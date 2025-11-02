import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ImportActionsProps {
  importing: boolean;
  cleaning: boolean;
  generatingPreviews: boolean;
  syncingStorage: boolean;
  publicKey: string;
  onImport: () => void;
  onCleanupDuplicates: () => void;
  onClearAll: () => void;
  onGeneratePreviews: () => void;
  onSyncStorage: () => void;
  previewProgress: number;
}

export default function ImportActions({
  importing,
  cleaning,
  generatingPreviews,
  syncingStorage,
  publicKey,
  onImport,
  onCleanupDuplicates,
  onClearAll,
  onGeneratePreviews,
  onSyncStorage,
  previewProgress
}: ImportActionsProps) {
  const isAnyActionActive = importing || cleaning || generatingPreviews || syncingStorage;

  return (
    <>
      <div className="space-y-3">
        <div className="flex gap-3">
          <Button 
            onClick={onSyncStorage} 
            disabled={isAnyActionActive}
            className="flex-1"
            variant="default"
          >
            {syncingStorage ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Синхронизация...
              </>
            ) : (
              <>
                <Icon name="CloudDownload" size={18} className="mr-2" />
                Синхронизация Cloud Storage
              </>
            )}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          <Icon name="Info" size={16} className="inline mr-2" />
          Синхронизация загрузит все работы из бакета kyra/works/, создаст превью и обновит каталог
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={onImport} 
            disabled={importing || !publicKey || cleaning || generatingPreviews || syncingStorage}
            className="flex-1"
            variant="outline"
          >
            {importing ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Импорт...
              </>
            ) : (
              <>
                <Icon name="Download" size={18} className="mr-2" />
                Импорт с Яндекс.Диска
              </>
            )}
          </Button>
          
          <Button 
            onClick={onCleanupDuplicates}
            disabled={isAnyActionActive}
            variant="outline"
          >
            {cleaning ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Удаление...
              </>
            ) : (
              <>
                <Icon name="Trash2" size={18} className="mr-2" />
                Удалить дубликаты
              </>
            )}
          </Button>

          <Button 
            onClick={onClearAll}
            disabled={isAnyActionActive}
            variant="destructive"
          >
            {cleaning ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Очистка...
              </>
            ) : (
              <>
                <Icon name="Trash" size={18} className="mr-2" />
                Очистить базу
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="border-t pt-6">
        <Button 
          onClick={onGeneratePreviews}
          disabled={importing || cleaning || generatingPreviews || !publicKey}
          className="w-full"
          variant="secondary"
        >
          {generatingPreviews ? (
            <>
              <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
              Генерация превью... {previewProgress}%
            </>
          ) : (
            <>
              <Icon name="Image" size={18} className="mr-2" />
              Сгенерировать превью из PDF
            </>
          )}
        </Button>
      </div>

      <div className="bg-blue-500/10 p-4 rounded-lg space-y-2">
        <div className="flex items-start gap-2">
          <Icon name="Info" size={18} className="text-blue-600 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-semibold">Что будет импортировано:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>DOCX файлы — извлечение текста и генерация описания через AI</li>
              <li>JPG/PNG изображения — чертежи с превью в карточках</li>
              <li>Автоматическое определение типа работы и предмета</li>
              <li>Установка цены в баллах по алгоритму</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
