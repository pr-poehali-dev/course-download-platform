import { Progress } from '@/components/ui/progress';

interface ImportProgressProps {
  importing: boolean;
  progress: number;
  generatingPreviews: boolean;
  previewProgress: number;
}

export default function ImportProgress({
  importing,
  progress,
  generatingPreviews,
  previewProgress
}: ImportProgressProps) {
  return (
    <>
      {importing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Импорт файлов...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {generatingPreviews && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Генерация превью...</span>
            <span>{previewProgress}%</span>
          </div>
          <Progress value={previewProgress} />
        </div>
      )}
    </>
  );
}
