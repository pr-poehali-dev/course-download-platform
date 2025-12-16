import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import { seoArticles } from '@/data/seoArticles';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/icon';
import { useEffect, useState } from 'react';
import { trackEvent, metrikaEvents } from '@/utils/metrika';
import { useScrollTracking } from '@/hooks/useScrollTracking';
import func2url from '../../backend/func2url.json';

const FALLBACK_IMAGE = 'https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/fdbb85f7-a4f9-4892-8be2-64334820b0f3.jpg';

interface BlogPostData {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImageUrl: string;
  publishedAt: string;
}

export default function BlogPost() {
  useScrollTracking();
  
  const { slug } = useParams<{ slug: string }>();
  const [imageError, setImageError] = useState(false);
  const [blogPost, setBlogPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const staticArticle = seoArticles.find(a => a.slug === slug);
  
  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const loadBlogPost = async () => {
    try {
      const response = await fetch(`${func2url.blog}?action=get&slug=${slug}`);
      const data = await response.json();
      
      if (data.success && data.post) {
        setBlogPost(data.post);
        trackEvent(metrikaEvents.BLOG_ARTICLE_VIEW, { 
          slug: data.post.slug, 
          title: data.post.title
        });
      }
    } catch (error) {
      console.error('Failed to load blog post:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (staticArticle) {
      trackEvent(metrikaEvents.BLOG_ARTICLE_VIEW, { 
        slug: staticArticle.slug, 
        title: staticArticle.title,
        category: staticArticle.category 
      });
    }
  }, [staticArticle]);
  
  const article = blogPost ? {
    title: blogPost.title,
    slug: blogPost.slug,
    content: blogPost.content,
    excerpt: blogPost.excerpt,
    coverImage: blogPost.coverImageUrl,
    publishedAt: blogPost.publishedAt,
    keywords: []
  } : staticArticle;

  const handleImageError = () => {
    setImageError(true);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Icon name="Loader2" size={48} className="animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (!article) {
    return <Navigate to="/404" replace />;
  }

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <Helmet>
        <title>{article.title} | Tech Forma</title>
        <meta name="description" content={article.excerpt} />
        <link rel="canonical" href={`https://techforma.pro/blog/${article.slug}`} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={article.coverImage} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://techforma.pro/blog/${article.slug}`} />
        <meta property="article:published_time" content={article.publishedAt} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <a 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <Icon name="ArrowLeft" size={16} />
            Вернуться на главную
          </a>

          <article className="bg-card rounded-xl shadow-lg overflow-hidden">
            <div className="relative h-64 md:h-96 overflow-hidden bg-muted">
              <img 
                src={imageError ? FALLBACK_IMAGE : article.coverImage} 
                alt={article.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
              {staticArticle && (
                <div className="absolute top-4 left-4">
                  <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {staticArticle.category}
                  </span>
                </div>
              )}
            </div>

            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
                <Icon name="Calendar" size={16} />
                <time dateTime={article.publishedAt}>{formattedDate}</time>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {article.title}
              </h1>

              <div className="prose prose-slate dark:prose-invert max-w-none blog-content">
                {blogPost ? (
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                ) : (
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                      li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
                      a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />
                      ),
                    }}
                  >
                    {article.content}
                  </ReactMarkdown>
                )}
              </div>

              {article.keywords && article.keywords.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold mb-3">Ключевые слова:</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.keywords.map((keyword, index) => (
                        <span 
                        key={index}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}