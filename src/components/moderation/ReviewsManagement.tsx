import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ReviewsManagementProps {
  generatingReviews: boolean;
  reviewsResult: any;
  onGenerateReviews: () => void;
  onCleanupDuplicates: () => void;
}

export default function ReviewsManagement({
  generatingReviews,
  reviewsResult,
  onGenerateReviews,
  onCleanupDuplicates
}: ReviewsManagementProps) {
  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Icon name="Sparkles" size={20} />
          Управление отзывами
        </CardTitle>
        <CardDescription>
          Автоматическая генерация и очистка отзывов
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button
            onClick={onGenerateReviews}
            disabled={generatingReviews}
            variant="outline"
            className="w-full"
          >
            {generatingReviews ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                <Icon name="Sparkles" size={16} className="mr-2" />
                Сгенерировать отзывы для всех работ
              </>
            )}
          </Button>

          <Button
            onClick={onCleanupDuplicates}
            disabled={generatingReviews}
            variant="outline"
            className="w-full"
          >
            <Icon name="Trash2" size={16} className="mr-2" />
            Очистить дубликаты отзывов
          </Button>
        </div>

        {reviewsResult && (
          <div className="p-4 bg-white rounded-lg border space-y-2">
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle" size={16} className="text-green-600" />
              <span className="font-semibold">Результаты генерации</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Обработано работ</div>
                <div className="font-semibold text-lg">{reviewsResult.processed_works}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Создано отзывов</div>
                <div className="font-semibold text-lg text-green-600">
                  {reviewsResult.total_reviews_created}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Пропущено работ</div>
                <div className="font-semibold text-lg text-gray-500">
                  {reviewsResult.skipped_works}
                </div>
              </div>
              {reviewsResult.deleted_duplicates !== undefined && (
                <div>
                  <div className="text-muted-foreground">Удалено дубликатов</div>
                  <div className="font-semibold text-lg text-red-600">
                    {reviewsResult.deleted_duplicates}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-3 bg-blue-100/50 rounded text-sm text-blue-800">
          <Icon name="Info" size={14} className="inline mr-1" />
          Генерация создает 3 случайных отзыва для каждой работы без отзывов
        </div>
      </CardContent>
    </Card>
  );
}
