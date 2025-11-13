import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SEO from '@/components/SEO';
import func2url from '../../backend/func2url.json';
import ReactMarkdown from 'react-markdown';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt: string;
  coverImageUrl: string;
  status: string;
  viewsCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPage() {
  const { slug } = useParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  const BLOG_API = func2url.blog;

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    } else {
      loadPosts();
    }
  }, [slug]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BLOG_API}?action=list&status=published`);
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

  const loadPost = async (postSlug: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${BLOG_API}?action=get&slug=${postSlug}`);
      const data = await response.json();

      if (data.success) {
        setCurrentPost(data.post);
      }
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="text-center py-24">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Загрузка...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (currentPost) {
    return (
      <>
        <SEO
          title={currentPost.title}
          description={currentPost.excerpt}
          keywords="блог, новости, обновления платформы, статьи"
        />
        <div className="min-h-screen bg-white">
          <Navigation />
          
          <article className="container max-w-4xl mx-auto px-4 py-12">
            <Link to="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад к блогу
            </Link>

            {currentPost.coverImageUrl && (
              <img
                src={currentPost.coverImageUrl}
                alt={currentPost.title}
                className="w-full h-[400px] object-cover rounded-2xl mb-8"
              />
            )}

            <div className="flex items-center gap-4 mb-6">
              <Badge>Tech Forma</Badge>
              <div className="flex items-center text-sm text-muted-foreground gap-4">
                <div className="flex items-center gap-1">
                  <Icon name="Calendar" size={16} />
                  {formatDate(currentPost.publishedAt || currentPost.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Eye" size={16} />
                  {currentPost.viewsCount} просмотров
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-6">{currentPost.title}</h1>

            <div className="prose prose-lg max-w-none">
              <ReactMarkdown>{currentPost.content || ''}</ReactMarkdown>
            </div>
          </article>

          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Блог"
        description="Новости платформы Tech Forma, полезные статьи и обновления"
        keywords="блог, новости, обновления платформы, статьи для студентов"
      />
      <div className="min-h-screen bg-white">
        <Navigation />

        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">Блог Tech Forma</h1>
            <p className="text-xl text-muted-foreground">
              Новости платформы, полезные статьи и обновления
            </p>
          </div>

          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-24 text-center">
                <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Пока нет опубликованных постов</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    {post.coverImageUrl && (
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">Tech Forma</Badge>
                        <div className="flex items-center text-sm text-muted-foreground gap-1">
                          <Icon name="Eye" size={14} />
                          {post.viewsCount}
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <Icon name="Calendar" size={14} />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
