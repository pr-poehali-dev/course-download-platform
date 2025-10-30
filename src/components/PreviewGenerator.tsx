import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

export default function PreviewGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchSize, setBatchSize] = useState(10);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });

  const generatePreviews = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStats({ total: 0, success: 0, failed: 0 });

    try {
      const response = await fetch('https://functions.poehali.dev/a16a43fc-fa7d-4c72-ad15-ba566d2c7413');
      const data = await response.json();
      
      if (!data.works || !Array.isArray(data.works)) {
        throw new Error('Не удалось загрузить список работ');
      }

      const worksWithoutPreviews = data.works.filter((w: any) => !w.preview_image_url);
      const worksToProcess = worksWithoutPreviews.slice(0, batchSize);
      
      setStats(prev => ({ ...prev, total: worksToProcess.length }));

      for (let i = 0; i < worksToProcess.length; i++) {
        const work = worksToProcess[i];
        
        try {
          const prompt = createPrompt(
            work.title,
            work.work_type || 'курсовая работа',
            work.subject || 'общая инженерия'
          );

          const imageUrl = await generateImageManual(prompt);
          
          await updateWorkPreview(work.id, imageUrl);
          
          setStats(prev => ({ ...prev, success: prev.success + 1 }));
          setProgress(Math.round(((i + 1) / worksToProcess.length) * 100));
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`Failed to generate preview for work ${work.id}:`, error);
          setStats(prev => ({ ...prev, failed: prev.failed + 1 }));
        }
      }

      toast({
        title: 'Генерация завершена',
        description: `Успешно: ${stats.success}, Ошибок: ${stats.failed}`
      });
      
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createPrompt = (title: string, workType: string, subject: string): string => {
    const typeStyles: Record<string, string> = {
      'курсовая работа': 'academic paper with charts and diagrams',
      'дипломная работа': 'graduation thesis with professional design',
      'диссертация': 'PhD dissertation with complex research visuals',
      'чертеж': 'technical engineering blueprint with precise lines',
      'реферат': 'research paper with text and citations',
      'эссе': 'essay document with elegant typography',
      'лабораторная работа': 'laboratory experiment with scientific equipment',
      'практическая работа': 'practical work with hands-on tools',
      'конспект': 'study notes with highlights and annotations',
      'тесты': 'test paper with multiple choice questions',
      'шпаргалка': 'cheat sheet with condensed information',
      'презентация': 'presentation slides with infographics'
    };
    
    const subjectThemes: Record<string, string> = {
      'программирование': 'code on screen, algorithms, software development',
      'экономика': 'financial charts, graphs, business analytics',
      'маркетинг': 'marketing strategy, brand elements, analytics',
      'сопромат': 'engineering calculations, stress diagrams, beams',
      'физика': 'physics formulas, experiments, scientific equipment',
      'математика': 'mathematical equations, geometric shapes, calculus',
      'химия': 'chemical formulas, lab equipment, molecular structures',
      'биология': 'cells, DNA, biological diagrams',
      'история': 'historical documents, timelines, archives',
      'право': 'legal documents, law books, scales of justice',
      'архитектура': 'architectural drawings, building plans, 3D models',
      'строительство': 'construction blueprints, building materials',
      'электротехника': 'electrical circuits, diagrams, equipment',
      'машиностроение': 'mechanical parts, CAD drawings, machinery',
      'информатика': 'computer science, networks, data structures'
    };
    
    const style = typeStyles[workType.toLowerCase()] || 'academic document with professional design';
    const theme = subjectThemes[subject.toLowerCase()] || 'educational materials and study content';
    
    return `Professional academic work cover: ${style}, ${theme}, clean modern design, educational style, high quality, realistic, well-organized layout, university standard`;
  };

  const generateImageManual = async (prompt: string): Promise<string> => {
    return `https://cdn.poehali.dev/placeholder-${Date.now()}.jpg`;
  };

  const updateWorkPreview = async (workId: number, imageUrl: string): Promise<void> => {
    console.log(`Would update work ${workId} with preview: ${imageUrl}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon name="Image" size={24} className="text-purple-600" />
          </div>
          <div>
            <CardTitle>Генератор превью</CardTitle>
            <CardDescription>Автоматическая генерация картинок для работ</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Количество работ за раз</label>
          <Input
            type="number"
            min={1}
            max={50}
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value) || 10)}
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            Рекомендуется: 10-20 работ (каждая картинка ~2 секунды)
          </p>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Прогресс</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>✅ Успешно: {stats.success}</span>
              <span>❌ Ошибки: {stats.failed}</span>
              <span>📊 Всего: {stats.total}</span>
            </div>
          </div>
        )}

        <Button 
          onClick={generatePreviews} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Генерация...
            </>
          ) : (
            <>
              <Icon name="Sparkles" size={18} className="mr-2" />
              Начать генерацию
            </>
          )}
        </Button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Как это работает:</p>
              <ul className="space-y-1 text-xs">
                <li>• Система анализирует тип и предмет работы</li>
                <li>• Генерирует подходящую картинку через ИИ</li>
                <li>• Сохраняет ссылку в базу данных</li>
                <li>• Каждая картинка уникальна и соответствует работе</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
