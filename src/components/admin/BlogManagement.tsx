import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import func2url from '../../../backend/func2url.json';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImageUrl: string;
  status: 'draft' | 'published' | 'archived';
  viewsCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImageUrl: '',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  const BLOG_API = func2url.blog;

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      
      const response = await fetch(`${BLOG_API}?action=list&status=all`, {
        headers: {
          'X-User-Id': String(user.id)
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить посты',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      coverImageUrl: '',
      status: 'draft'
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      coverImageUrl: post.coverImageUrl,
      status: post.status
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);

    try {
      if (editingPost) {
        const response = await fetch(`${BLOG_API}?action=update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': String(user.id)
          },
          body: JSON.stringify({
            id: editingPost.id,
            ...formData
          })
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: 'Успешно',
            description: 'Пост обновлён'
          });
          loadPosts();
          setIsDialogOpen(false);
        }
      } else {
        const response = await fetch(`${BLOG_API}?action=create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': String(user.id)
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: 'Успешно',
            description: 'Пост создан'
          });
          loadPosts();
          setIsDialogOpen(false);
        }
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить пост',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить пост?')) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);

    try {
      const response = await fetch(`${BLOG_API}?action=delete&id=${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': String(user.id)
        }
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Пост удалён'
        });
        loadPosts();
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить пост',
        variant: 'destructive'
      });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление блогом</h2>
          <p className="text-muted-foreground">Создавайте и редактируйте посты</p>
        </div>
        <Button onClick={handleCreate}>
          <Icon name="Plus" size={18} className="mr-2" />
          Создать пост
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Загрузка...</div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{post.title}</CardTitle>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status === 'published' ? 'Опубликован' : 
                         post.status === 'draft' ? 'Черновик' : 'Архив'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Slug: {post.slug} • Просмотры: {post.viewsCount}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(post.id)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
              </CardContent>
            </Card>
          ))}

          {posts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Нет постов. Создайте первый пост!
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Редактировать пост' : 'Создать пост'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о посте блога
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData({
                    ...formData,
                    title,
                    slug: generateSlug(title)
                  });
                }}
                placeholder="Введите заголовок"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL (slug)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="url-posta"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Краткое описание</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Краткое описание поста"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Содержание (Markdown)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="# Заголовок&#10;&#10;Текст поста в формате Markdown"
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">Ссылка на обложку</Label>
              <Input
                id="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'draft' | 'published' | 'archived') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Черновик</SelectItem>
                  <SelectItem value="published">Опубликован</SelectItem>
                  <SelectItem value="archived">Архив</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                <Icon name="Save" size={18} className="mr-2" />
                Сохранить
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
