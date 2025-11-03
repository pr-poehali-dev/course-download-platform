import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import func2url from '../../backend/func2url.json';

interface ImageInfo {
  path: string;
  size: number;
  is_jpeg: boolean;
}

interface WorkResult {
  id: number;
  title: string;
  images: ImageInfo[];
  has_jpeg: boolean;
  error?: string;
}

interface CheckResult {
  success: boolean;
  total_checked: number;
  works_with_images: number;
  total_images: number;
  works_with_jpeg: number;
  results: WorkResult[];
}

export default function ArchiveImagesChecker() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const checkImages = async () => {
    setChecking(true);
    setResult(null);

    try {
      const response = await fetch(`${func2url.works}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки работ');
      }

      const data = await response.json();
      
      const worksWithoutPreview = data.works
        ?.filter((w: any) => !w.preview_url && w.download_url)
        .slice(0, 10) || [];

      const results: WorkResult[] = [];
      let totalImages = 0;
      let worksWithImages = 0;
      let jpegCount = 0;

      for (const work of worksWithoutPreview) {
        const workResult: WorkResult = {
          id: work.id,
          title: work.title,
          images: [],
          has_jpeg: false
        };

        try {
          const archiveResponse = await fetch(work.download_url);
          
          if (!archiveResponse.ok) {
            workResult.error = `HTTP ${archiveResponse.status}`;
            results.push(workResult);
            continue;
          }

          const blob = await archiveResponse.blob();
          const JSZip = (await import('jszip')).default;
          const zip = await JSZip.loadAsync(blob);

          const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
          
          Object.keys(zip.files).forEach(filename => {
            const lowerFilename = filename.toLowerCase();
            if (imageExtensions.some(ext => lowerFilename.endsWith(ext))) {
              const isJpeg = lowerFilename.endsWith('.jpg') || lowerFilename.endsWith('.jpeg');
              const file = zip.files[filename];
              
              workResult.images.push({
                path: filename,
                size: file._data?.uncompressedSize || 0,
                is_jpeg: isJpeg
              });

              if (isJpeg) {
                workResult.has_jpeg = true;
              }
            }
          });

          if (workResult.images.length > 0) {
            worksWithImages++;
            totalImages += workResult.images.length;
            if (workResult.has_jpeg) {
              jpegCount++;
            }
          }

        } catch (error: any) {
          workResult.error = error.message;
        }

        results.push(workResult);
      }

      setResult({
        success: true,
        total_checked: results.length,
        works_with_images: worksWithImages,
        total_images: totalImages,
        works_with_jpeg: jpegCount,
        results
      });

      toast({
        title: 'Проверка завершена',
        description: `Проверено: ${results.length} работ, найдено изображений: ${totalImages}`
      });

    } catch (error: any) {
      toast({
        title: 'Ошибка проверки',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Image" size={24} />
          Проверка изображений в архивах
        </CardTitle>
        <CardDescription>
          Проверяет первые 10 работ без превью на наличие PNG/JPG/JPEG файлов в архивах
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={checkImages}
          disabled={checking}
          className="w-full"
          size="lg"
        >
          {checking ? (
            <>
              <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
              Проверяю архивы...
            </>
          ) : (
            <>
              <Icon name="Search" size={20} className="mr-2" />
              Проверить 10 архивов
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="text-2xl font-bold">{result.total_checked}</div>
                <div className="text-sm text-muted-foreground">Проверено</div>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.works_with_images}
                </div>
                <div className="text-sm text-muted-foreground">С картинками</div>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {result.total_images}
                </div>
                <div className="text-sm text-muted-foreground">Всего изображений</div>
              </div>
              <div className="bg-orange-500/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {result.works_with_jpeg}
                </div>
                <div className="text-sm text-muted-foreground">С JPEG</div>
              </div>
            </div>

            <div className="space-y-3">
              {result.results.map((work) => (
                <div 
                  key={work.id} 
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        #{work.id} {work.title}
                      </div>
                      {work.error && (
                        <div className="text-sm text-destructive flex items-center gap-1 mt-1">
                          <Icon name="AlertCircle" size={14} />
                          {work.error}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {work.images.length > 0 && (
                        <div className="px-2 py-1 bg-primary/10 rounded text-sm font-medium">
                          {work.images.length} 🖼️
                        </div>
                      )}
                      {work.has_jpeg && (
                        <div className="px-2 py-1 bg-orange-500/20 rounded text-sm font-medium text-orange-600">
                          JPEG
                        </div>
                      )}
                    </div>
                  </div>

                  {work.images.length > 0 && (
                    <div className="space-y-1 pl-4 border-l-2 border-primary/20">
                      {work.images.map((img, idx) => (
                        <div 
                          key={idx}
                          className="text-sm flex items-center gap-2"
                        >
                          {img.is_jpeg ? (
                            <Icon name="FileImage" size={14} className="text-orange-500" />
                          ) : (
                            <Icon name="Image" size={14} className="text-primary" />
                          )}
                          <span className="text-muted-foreground truncate">
                            {img.path}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            ({(img.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
