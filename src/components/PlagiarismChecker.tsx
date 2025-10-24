import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

const ANTIPLAGIARISM_API = 'https://functions.poehali.dev/68d8e4a2-9a96-42de-9cd8-c78af4723da4';

interface PlagiarismResult {
  check_id: number | null;
  file_hash: string;
  uniqueness_percent: number;
  similar_works: Array<{
    work_id: number;
    title: string;
    similarity: number;
  }>;
  status: 'approved' | 'warning' | 'rejected';
  message: string;
}

interface PlagiarismCheckerProps {
  textContent: string;
  workId?: number;
  userId?: number;
  onCheckComplete?: (result: PlagiarismResult) => void;
}

export default function PlagiarismChecker({ 
  textContent, 
  workId, 
  userId,
  onCheckComplete 
}: PlagiarismCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);

  const checkPlagiarism = async () => {
    if (!textContent || textContent.length < 100) {
      toast({
        title: 'Ошибка',
        description: 'Текст слишком короткий для проверки (минимум 100 символов)',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);

    try {
      const response = await fetch(ANTIPLAGIARISM_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_content: textContent,
          work_id: workId,
          user_id: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка проверки');
      }

      setResult(data);
      
      if (onCheckComplete) {
        onCheckComplete(data);
      }

      if (data.status === 'rejected') {
        toast({
          title: 'Низкая уникальность',
          description: 'Работа содержит слишком много заимствований',
          variant: 'destructive',
        });
      } else if (data.status === 'warning') {
        toast({
          title: 'Средняя уникальность',
          description: 'Рекомендуется доработать работу',
        });
      } else {
        toast({
          title: 'Отличная уникальность!',
          description: 'Работа готова к публикации',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка проверки',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Shield" size={24} className="text-primary" />
          Проверка на плагиат
        </CardTitle>
        <CardDescription>
          Проверьте уникальность работы перед публикацией
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result ? (
          <Button 
            onClick={checkPlagiarism} 
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Проверяем...
              </>
            ) : (
              <>
                <Icon name="Search" size={18} className="mr-2" />
                Проверить уникальность
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Уникальность</span>
                <Badge variant={getStatusBadgeVariant(result.status)}>
                  {result.uniqueness_percent.toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={result.uniqueness_percent} 
                className={getStatusColor(result.status)}
              />
            </div>

            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm">{result.message}</p>
            </div>

            {result.similar_works.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Icon name="AlertCircle" size={16} />
                  Похожие работы
                </h4>
                <div className="space-y-2">
                  {result.similar_works.map((work, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <span className="text-sm">{work.title}</span>
                      <Badge variant="outline">
                        {work.similarity.toFixed(1)}% совпадение
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={() => {
                setResult(null);
                checkPlagiarism();
              }}
              variant="outline"
              className="w-full"
            >
              <Icon name="RotateCw" size={18} className="mr-2" />
              Проверить снова
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
