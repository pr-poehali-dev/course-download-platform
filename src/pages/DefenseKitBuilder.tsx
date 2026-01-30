import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import funcUrls from '../../backend/func2url.json';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function DefenseKitBuilder() {
  const [searchParams] = useSearchParams();
  const workId = searchParams.get('workId');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    relevance: '',
    goal: '',
    tasks: ['', '', ''],
    conclusions: ['', '', ''],
    university: '',
    faculty: '',
    author: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Загружаем данные работы, если передан workId
  useEffect(() => {
    const loadWorkData = async () => {
      if (!workId) return;
      
      try {
        const response = await fetch(`${funcUrls.works}?id=${workId}`);
        const data = await response.json();
        
        if (data.works && data.works.length > 0) {
          const work = data.works[0];
          // Предзаполняем заголовок работы
          setFormData(prev => ({
            ...prev,
            title: work.title || ''
          }));
          
          toast({
            title: 'Данные загружены',
            description: 'Название работы автоматически заполнено'
          });
        }
      } catch (error) {
        console.error('Error loading work data:', error);
      }
    };
    
    loadWorkData();
  }, [workId, toast]);
  
  const addTask = () => {
    setFormData({
      ...formData,
      tasks: [...formData.tasks, '']
    });
  };
  
  const removeTask = (index: number) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter((_, i) => i !== index)
    });
  };
  
  const updateTask = (index: number, value: string) => {
    const newTasks = [...formData.tasks];
    newTasks[index] = value;
    setFormData({ ...formData, tasks: newTasks });
  };
  
  const addConclusion = () => {
    setFormData({
      ...formData,
      conclusions: [...formData.conclusions, '']
    });
  };
  
  const removeConclusion = (index: number) => {
    setFormData({
      ...formData,
      conclusions: formData.conclusions.filter((_, i) => i !== index)
    });
  };
  
  const updateConclusion = (index: number, value: string) => {
    const newConclusions = [...formData.conclusions];
    newConclusions[index] = value;
    setFormData({ ...formData, conclusions: newConclusions });
  };
  
  const handleGenerate = async () => {
    const user = await authService.verify();
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт для создания пакета защиты',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }
    
    const requiredFields = [
      formData.title,
      formData.relevance,
      formData.goal,
      formData.university,
      formData.author
    ];
    
    const filledTasks = formData.tasks.filter(t => t.trim());
    const filledConclusions = formData.conclusions.filter(c => c.trim());
    
    if (requiredFields.some(f => !f.trim()) || filledTasks.length === 0 || filledConclusions.length === 0) {
      toast({
        title: 'Заполните все поля',
        description: 'Все обязательные поля должны быть заполнены',
        variant: 'destructive'
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await fetch(funcUrls['defense-kit'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tasks: filledTasks,
          conclusions: filledConclusions,
          workId: workId,
          userId: user.id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка генерации');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `defense_kit_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Пакет готов!',
        description: 'Файлы для защиты успешно созданы'
      });
      
      // ✅ Возвращаемся к работе после успешной генерации
      if (workId) {
        setTimeout(() => {
          navigate(`/work/${workId}`);
        }, 2000);
      }
      
    } catch (error) {
      toast({
        title: 'Ошибка генерации',
        description: error instanceof Error ? error.message : 'Попробуйте позже',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Breadcrumbs />
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Icon name="GraduationCap" size={32} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Конструктор защиты</h1>
                <p className="text-gray-600">Создайте полный пакет для успешной защиты работы</p>
              </div>
            </div>
            
            <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>Вы получите:</strong> Презентацию (PPTX) • Речь для защиты (DOCX) • Шпаргалку (TXT)
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Тема работы *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Маркетинг в социальных сетях"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="relevance">Актуальность (2-3 предложения) *</Label>
                <Textarea
                  id="relevance"
                  value={formData.relevance}
                  onChange={(e) => setFormData({ ...formData, relevance: e.target.value })}
                  placeholder="Социальные сети стали основным каналом коммуникации с потребителями..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="goal">Цель работы *</Label>
                <Input
                  id="goal"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  placeholder="Исследовать влияние маркетинга в социальных сетях..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Задачи работы * (минимум 3)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTask}
                  >
                    <Icon name="Plus" size={16} className="mr-1" />
                    Добавить задачу
                  </Button>
                </div>
                {formData.tasks.map((task, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={task}
                      onChange={(e) => updateTask(index, e.target.value)}
                      placeholder={`Задача ${index + 1}`}
                    />
                    {formData.tasks.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTask(index)}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Выводы * (минимум 3)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addConclusion}
                  >
                    <Icon name="Plus" size={16} className="mr-1" />
                    Добавить вывод
                  </Button>
                </div>
                {formData.conclusions.map((conclusion, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={conclusion}
                      onChange={(e) => updateConclusion(index, e.target.value)}
                      placeholder={`Вывод ${index + 1}`}
                    />
                    {formData.conclusions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeConclusion(index)}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="university">ВУЗ *</Label>
                  <Input
                    id="university"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    placeholder="МГУ"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="faculty">Факультет</Label>
                  <Input
                    id="faculty"
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    placeholder="Экономический факультет"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="author">ФИО автора *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Иванов Иван Иванович"
                  className="mt-1"
                />
              </div>
              
              <div className="pt-6 border-t">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                      Создаю пакет...
                    </>
                  ) : (
                    <>
                      <Icon name="Download" size={20} className="mr-2" />
                      Создать пакет для защиты
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Генерация займёт 5-10 секунд
                </p>
                {workId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate(`/work/${workId}`)}
                  >
                    <Icon name="ArrowLeft" size={20} className="mr-2" />
                    Вернуться к работе
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}