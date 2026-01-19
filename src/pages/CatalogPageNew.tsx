import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';

export default function CatalogPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setLoading(false);
    setWorks([]);
  }, []);

  return (
    <>
      <Helmet>
        <title>Каталог — Tech Forma</title>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8 mt-20">
          <h1 className="text-4xl font-bold mb-8">Каталог инженерных материалов</h1>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Icon name="Loader2" size={48} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Загрузка каталога...</p>
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </>
  );
}
