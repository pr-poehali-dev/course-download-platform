import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { BLOG_POSTS } from '@/data/blogPosts';
import BlogNavigation from '@/components/blog/BlogNavigation';
import BlogHeader from '@/components/blog/BlogHeader';
import BlogContentRenderer from '@/components/blog/BlogContentRenderer';
import BlogFooter from '@/components/blog/BlogFooter';

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = BLOG_POSTS[id as keyof typeof BLOG_POSTS];

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Статья не найдена</h1>
          <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogNavigation onBackClick={() => navigate('/')} />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <Icon name="ArrowLeft" size={18} className="mr-2" />
          Назад к блогу
        </Button>

        <article>
          <BlogHeader 
            title={post.title}
            category={post.category}
            date={post.date}
            readTime={post.readTime}
          />

          <BlogContentRenderer content={post.content} />
        </article>

        <div className="mt-12 pt-8 border-t">
          <Button onClick={() => navigate('/')} size="lg">
            <Icon name="Home" size={18} className="mr-2" />
            На главную страницу
          </Button>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
