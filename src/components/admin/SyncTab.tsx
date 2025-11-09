import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import YandexDiskImport from '@/components/YandexDiskImport';
import PreviewGenerator from '@/components/PreviewGenerator';
import ArchiveImagesChecker from '@/components/ArchiveImagesChecker';
import MultiPreviewExtractor from '@/components/MultiPreviewExtractor';
import DocPreviewGenerator from '@/components/admin/DocPreviewGenerator';
import func2url from '../../../backend/func2url.json';

export default function SyncTab() {
  const handleFullSync = async () => {
    if (!confirm('Синхронизировать каталог из Cloud Storage? Это обновит все работы и создаст превью.')) {
      return;
    }
    
    try {
      const response = await fetch(func2url['full-yandex-sync'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Синхронизация завершена!',
          description: `Синхронизировано работ: ${data.synced} из ${data.total_works}`
        });
      } else {
        throw new Error(data.error || 'Ошибка синхронизации');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка синхронизации',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="CloudDownload" size={24} />
            Синхронизация Cloud Storage
          </CardTitle>
          <CardDescription>
            Автоматическая синхронизация всех работ из бакета kyra/works/ с созданием превью и описаний
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleFullSync}
            className="w-full"
            size="lg"
          >
            <Icon name="CloudDownload" size={20} className="mr-2" />
            Запустить полную синхронизацию
          </Button>
        </CardContent>
      </Card>
      
      <DocPreviewGenerator />
      <MultiPreviewExtractor />
      <ArchiveImagesChecker />
      <YandexDiskImport />
      <PreviewGenerator />
    </div>
  );
}