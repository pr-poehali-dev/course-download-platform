import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

export default function BestSellers() {
  const navigate = useNavigate();
  const [hitWorks, setHitWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHits = async () => {
      try {
        const response = await fetch(func2url.works);
        const data = await response.json();
        
        if (data.works) {
          const hits = data.works
            .filter((w: any) => {
              const rating = parseFloat(w.rating) || 0;
              return rating >= 4.8;
            })
            .slice(0, 6)
            .map((w: any) => ({
              id: String(w.id),
              title: w.title,
              workType: w.work_type || 'Техническая работа',
              subject: w.subject || 'Общая инженерия',
              price: w.price_points || w.price || 600,
              rating: parseFloat(w.rating) || 4.8,
              previewUrl: w.preview_image_url || null
            }));
          
          setHitWorks(hits);
        }
      } catch (error) {
        console.error('Failed to load hits:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHits();
  }, []);

  if (loading || hitWorks.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
            <Icon name="Flame" size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Хиты продаж</h2>
            <p className="text-gray-600 text-sm">Работы с высшими оценками</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hitWorks.map((work) => (
            <div
              key={work.id}
              onClick={() => navigate(`/work/${work.id}`)}
              className="bg-white rounded-lg border-2 border-orange-200 hover:border-orange-400 transition-all cursor-pointer group overflow-hidden hover:shadow-xl"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                <img
                  src={work.previewUrl || "https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/e0139de0-3660-402a-8d29-d07f5dac95b3.jpg"}
                  alt={work.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = "https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/e0139de0-3660-402a-8d29-d07f5dac95b3.jpg";
                  }}
                />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
                    <Icon name="Flame" size={14} className="mr-1" />
                    ХИТ
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge className="bg-white/90 text-gray-700 text-xs px-2 py-1">
                    {work.workType}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-3 group-hover:text-orange-600 transition-colors">
                  {work.title}
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {work.subject}
                  </Badge>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Icon name="Star" size={14} fill="currentColor" />
                    <span className="text-sm font-bold">{work.rating}</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-primary">
                  {work.price} ₽
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
