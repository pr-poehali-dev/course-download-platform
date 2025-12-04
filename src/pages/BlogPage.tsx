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
import { seoArticles, SEOArticle } from '@/data/seoArticles';
import Breadcrumbs from '@/components/Breadcrumbs';

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
  const [currentSEOArticle, setCurrentSEOArticle] = useState<SEOArticle | null>(null);
  const [loading, setLoading] = useState(true);

  const BLOG_API = func2url.blog;

  useEffect(() => {
    if (slug) {
      const seoArticle = seoArticles.find(a => a.slug === slug);
      if (seoArticle) {
        setCurrentSEOArticle(seoArticle);
        setLoading(false);
      } else {
        loadPost(slug);
      }
    } else {
      loadPosts();
    }
  }, [slug]);

  const loadPosts = async () => {
    setLoading(true);
    
    const seoPostsMapped = seoArticles.map(article => ({
      id: parseInt(article.id),
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      coverImageUrl: article.coverImage,
      status: 'published',
      viewsCount: 0,
      publishedAt: article.publishedAt,
      createdAt: article.publishedAt,
      updatedAt: article.publishedAt
    }));
    
    console.log('[BLOG DEBUG] 1. SEO Articles:', seoPostsMapped.length, seoPostsMapped);
    
    try {
      const response = await fetch(`${BLOG_API}?action=list&status=published`);
      const data = await response.json();
      
      console.log('[BLOG DEBUG] 2. API Response:', data);

      if (data.success && Array.isArray(data.posts)) {
        const combinedPosts = [...seoPostsMapped, ...data.posts];
        console.log('[BLOG DEBUG] 3. Combined posts:', combinedPosts.length, combinedPosts);
        
        const uniquePosts = combinedPosts.filter((post, index, self) => 
          index === self.findIndex((p) => p.slug === post.slug)
        );
        
        console.log('[BLOG DEBUG] 4. Unique posts:', uniquePosts.length, uniquePosts);
        console.log('[BLOG DEBUG] 5. Calling setPosts with:', uniquePosts);
        setPosts(uniquePosts);
        console.log('[BLOG DEBUG] 6. setPosts called');
      } else {
        console.log('[BLOG DEBUG] 3. Using only SEO posts (API failed)');
        setPosts(seoPostsMapped);
      }
    } catch (error) {
      console.error('[BLOG DEBUG] ERROR:', error);
      setPosts(seoPostsMapped);
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

  if (currentSEOArticle) {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': currentSEOArticle.title,
      'description': currentSEOArticle.excerpt,
      'datePublished': currentSEOArticle.publishedAt,
      'author': {
        '@type': 'Organization',
        'name': 'Tech Forma'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Tech Forma',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/cd6426cd-a3e2-4cbb-b4ba-7087c677687b.jpg'
        }
      },
      'image': currentSEOArticle.coverImage,
      'keywords': currentSEOArticle.keywords.join(', ')
    };

    return (
      <>
        <SEO
          title={currentSEOArticle.title}
          description={currentSEOArticle.excerpt}
          keywords={currentSEOArticle.keywords.join(', ')}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="min-h-screen bg-white">
          <Navigation />
          
          <article className="container max-w-4xl mx-auto px-4 py-12 mt-16">
            <Breadcrumbs items={[
              { label: 'Главная', path: '/' },
              { label: 'Блог', path: '/blog' },
              { label: currentSEOArticle.title, path: `/blog/${currentSEOArticle.slug}` }
            ]} />
            
            <Link to="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад к блогу
            </Link>

            {currentSEOArticle.coverImage && (
              <img
                src={currentSEOArticle.coverImage}
                alt={currentSEOArticle.title}
                className="w-full h-[400px] object-cover rounded-2xl mb-8"
              />
            )}

            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <Badge className="bg-primary text-white">{currentSEOArticle.category}</Badge>
              <div className="flex items-center text-sm text-muted-foreground gap-4">
                <div className="flex items-center gap-1">
                  <Icon name="Calendar" size={16} />
                  {formatDate(currentSEOArticle.publishedAt)}
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-6">{currentSEOArticle.title}</h1>

            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-primary prose-ul:my-4 prose-li:my-2 prose-table:border-collapse prose-table:w-full prose-th:border prose-th:p-3 prose-th:bg-gray-100 prose-td:border prose-td:p-3">
              <ReactMarkdown>{currentSEOArticle.content}</ReactMarkdown>
            </div>

            <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="text-xl font-bold mb-3">💡 Готовы купить курсовую работу?</h3>
              <p className="text-muted-foreground mb-4">
                На Tech Forma более 500 готовых работ от 200₽. Мгновенное скачивание, гарантия качества!
              </p>
              <a
                href="/catalog"
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                <Icon name="BookOpen" size={18} className="mr-2" />
                Смотреть каталог работ
              </a>
            </div>
          </article>

          <Footer />
        </div>
      </>
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
          
          <article className="container max-w-4xl mx-auto px-4 py-12 mt-16">
            <Breadcrumbs items={[
              { label: 'Главная', path: '/' },
              { label: 'Блог', path: '/blog' },
              { label: currentPost.title, path: `/blog/${currentPost.slug}` }
            ]} />
            
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
        description="Статьи об инженерных программах, обучение работе с чертежами, 3D-моделированию, CAD-системам"
        keywords="блог, инженерные статьи, уроки cad, работа с чертежами, 3d моделирование, гайды для инженеров"
      />
      <div className="min-h-screen bg-white">
        <Navigation />

        <div className="container max-w-7xl mx-auto px-4 py-12 mt-16">
          <Breadcrumbs items={[
            { label: 'Главная', path: '/' },
            { label: 'Блог', path: '/blog' }
          ]} />
          
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">Блог Tech Forma — полезные статьи для инженеров</h1>
            <p className="text-xl text-muted-foreground">
              Уроки по CAD-системам, работе с чертежами, 3D-моделированию, примеры оформления технической документации
            </p>
          </div>

          {(() => {
            console.log('[BLOG DEBUG] 7. Render phase - posts.length:', posts.length, 'posts:', posts);
            return posts.length === 0 ? (
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
            );
          })()}
        </div>

        <Footer />
      </div>
    </>
  );
}