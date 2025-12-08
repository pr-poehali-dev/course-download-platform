import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { seoArticles } from '@/data/seoArticles';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function BlogListPage() {
  const navigate = useNavigate();
  
  const sortedArticles = seoArticles
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <>
      <Helmet>
        <title>Блог Tech Forma — Полезные статьи для студентов</title>
        <meta name="description" content="Блог с полезными статьями для студентов: выбор курсовых работ, инженерные чертежи, технические расчеты, советы по учебе и защите проектов." />
        <meta name="keywords" content="блог для студентов, курсовые работы, инженерные чертежи, технические статьи, советы студентам" />
        <meta property="og:title" content="Блог Tech Forma — Полезные статьи для студентов" />
        <meta property="og:description" content="Блог с полезными статьями для студентов: выбор курсовых работ, инженерные чертежи, технические расчеты, советы по учебе и защите проектов." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Блог Tech Forma
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Полезные статьи для студентов: советы по выбору работ, инженерные чертежи, технические расчеты и многое другое
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedArticles.map((article) => {
              const formattedDate = new Date(article.publishedAt).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              });
              
              return (
                <Card 
                  key={article.id} 
                  className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer overflow-hidden group"
                  onClick={() => navigate(`/blog/${article.slug}`)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={article.coverImage} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{article.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        {formattedDate}
                      </span>
                      <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Читать
                        <Icon name="ArrowRight" size={16} />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
