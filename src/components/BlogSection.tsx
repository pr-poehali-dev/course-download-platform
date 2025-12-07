import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { seoArticles } from '@/data/seoArticles';

export default function BlogSection() {
  const navigate = useNavigate();
  
  const latestArticles = seoArticles
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  return (
    <section id="blog" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Блог и советы</h2>
          <p className="text-lg text-muted-foreground">
            Полезные статьи для успешной учебы
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestArticles.map((article) => {
            const formattedDate = new Date(article.publishedAt).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
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
                  <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
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
      </div>
    </section>
  );
}