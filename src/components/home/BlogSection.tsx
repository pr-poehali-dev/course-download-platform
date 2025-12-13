import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { seoArticles } from '@/data/seoArticles';
import { trackEvent, metrikaEvents } from '@/utils/metrika';

export default function BlogSection() {
  const latestArticles = seoArticles.slice(0, 3);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30 border-b border-border">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground section-title-line">
            Полезные статьи для инженеров
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Актуальные материалы о технологиях, BIM, 3D-печати и ИИ в проектировании
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {latestArticles.map((article) => (
            <Link
              key={article.id}
              to={`/blog/${article.slug}`}
              className="group"
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-primary text-white shadow-lg">
                      {article.category}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <Icon name="Calendar" size={14} />
                    {formatDate(article.publishedAt)}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                    Читать далее
                    <Icon 
                      name="ArrowRight" 
                      size={18} 
                      className="ml-1 group-hover:translate-x-1 transition-transform" 
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold shadow-lg"
            onClick={() => trackEvent(metrikaEvents.CTA_CLICK, { button: 'blog_all_articles' })}
          >
            <Icon name="BookOpen" size={20} />
            Все статьи блога
          </Link>
        </div>
      </div>
    </section>
  );
}