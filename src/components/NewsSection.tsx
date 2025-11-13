import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
}

interface NewsSectionProps {
  isAdmin?: boolean;
}

export default function NewsSection({ isAdmin = false }: NewsSectionProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  useEffect(() => {
    // Загрузка новостей из localStorage
    const stored = localStorage.getItem('platform_news');
    if (stored) {
      setNews(JSON.parse(stored));
    }
  }, []);

  const saveNews = (updatedNews: NewsItem[]) => {
    localStorage.setItem('platform_news', JSON.stringify(updatedNews));
    setNews(updatedNews);
  };

  const handleAddNews = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните заголовок и текст новости',
        variant: 'destructive',
      });
      return;
    }

    const newsItem: NewsItem = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      date: new Date().toLocaleDateString('ru-RU'),
      isImportant,
    };

    saveNews([newsItem, ...news]);
    setNewTitle('');
    setNewContent('');
    setIsImportant(false);
    setIsEditing(false);

    toast({
      title: 'Новость добавлена',
      description: 'Пользователи увидят её на главной странице',
    });
  };

  const handleDeleteNews = (id: string) => {
    saveNews(news.filter(item => item.id !== id));
    toast({
      title: 'Новость удалена',
    });
  };

  if (news.length === 0 && !isAdmin) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 glass-card border-blue-200">
            <Icon name="Newspaper" size={14} className="mr-1" />
            Новости платформы
          </Badge>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Что нового?
          </h2>
          <p className="text-lg text-slate-600">
            Следите за обновлениями и важными событиями
          </p>
        </div>

        {isAdmin && (
          <Card className="mb-8 border-2 border-blue-500/30 bg-blue-50/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Settings" size={20} className="text-blue-600" />
                Управление новостями (только для админа)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить новость
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Заголовок</label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Например: Обновление платформы"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Текст новости</label>
                    <Textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Опишите изменения или важную информацию..."
                      rows={4}
                      maxLength={500}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="important"
                      checked={isImportant}
                      onChange={(e) => setIsImportant(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="important" className="text-sm">
                      Важная новость (выделить красным)
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddNews} className="flex-1">
                      <Icon name="Check" size={18} className="mr-2" />
                      Опубликовать
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setNewTitle('');
                        setNewContent('');
                        setIsImportant(false);
                      }}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {news.map((item) => (
            <Card
              key={item.id}
              className={`hover:shadow-lg transition-all ${
                item.isImportant ? 'border-2 border-red-500/50 bg-red-50/30' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {item.isImportant && (
                        <Badge className="bg-red-500">
                          <Icon name="AlertCircle" size={12} className="mr-1" />
                          Важно
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNews(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{item.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
