import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  viewsCount: number;
  createdAt: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const BLOG_API = func2url.blog;
  const USER_DATA_API = func2url['user-data'];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/');
      return;
    }

    try {
      const response = await fetch(`${USER_DATA_API}?action=get-user&userId=${userId}`);
      const data = await response.json();

      if (data.success && data.user.role === 'admin') {
        setUser(data.user);
        loadAllPosts();
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Auth failed:', error);
      navigate('/');
    }
  };

  const loadAllPosts = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${BLOG_API}?action=list&status=all`, {
        headers: {
          'X-User-Id': userId || ''
        }
      });
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: number, title: string) => {
    if (!confirm(`Удалить пост "${title}"?`)) {
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${BLOG_API}?action=delete&id=${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': userId || ''
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Пост удален!');
        loadAllPosts();
      } else {
        alert('Ошибка: ' + (data.error || 'Не удалось удалить'));
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Ошибка удаления');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container max-w-6xl mx-auto px-4 py-12 mt-16">
          <div className="text-center py-24">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container max-w-6xl mx-auto px-4 py-12 mt-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Управление постами блога</h1>
          <Button onClick={() => navigate('/blog')}>
            <Icon name="Eye" size={18} className="mr-2" />
            Смотреть блог
          </Button>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Постов пока нет</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="Eye" size={14} />
                          {post.viewsCount} просмотров
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Calendar" size={14} />
                          {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      >
                        <Icon name="ExternalLink" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePost(post.id, post.title)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
