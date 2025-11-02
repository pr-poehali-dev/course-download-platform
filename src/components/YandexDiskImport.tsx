import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import ImportResults from './yandex-import/ImportResults';
import ImportProgress from './yandex-import/ImportProgress';
import ImportActions from './yandex-import/ImportActions';
import { useImportLogic } from './yandex-import/useImportLogic';

export default function YandexDiskImport() {
  const {
    publicKey,
    setPublicKey,
    importing,
    progress,
    result,
    cleaning,
    generatingPreviews,
    previewProgress,
    syncingStorage,
    handleImport,
    handleClearAll,
    handleGeneratePreviews,
    handleCleanupDuplicates,
    handleSyncStorage
  } = useImportLogic();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="CloudDownload" size={24} className="text-primary" />
          </div>
          <div>
            <CardTitle>Импорт с Яндекс.Диска</CardTitle>
            <CardDescription>
              Автоматическая загрузка работ из папки
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="public-key">Публичная ссылка на папку</Label>
          <Input
            id="public-key"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder="https://disk.yandex.ru/d/..."
            disabled={importing}
          />
          <p className="text-sm text-muted-foreground">
            Система автоматически обработает DOCX файлы и изображения чертежей
          </p>
        </div>

        <ImportProgress
          importing={importing}
          progress={progress}
          generatingPreviews={generatingPreviews}
          previewProgress={previewProgress}
        />

        {result && <ImportResults result={result} />}

        <ImportActions
          importing={importing}
          cleaning={cleaning}
          generatingPreviews={generatingPreviews}
          syncingStorage={syncingStorage}
          publicKey={publicKey}
          onImport={handleImport}
          onCleanupDuplicates={handleCleanupDuplicates}
          onClearAll={handleClearAll}
          onGeneratePreviews={handleGeneratePreviews}
          onSyncStorage={handleSyncStorage}
          previewProgress={previewProgress}
        />
      </CardContent>
    </Card>
  );
}
