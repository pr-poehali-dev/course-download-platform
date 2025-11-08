import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { recentlyViewedStorage } from '@/utils/recentlyViewed';

export default function RecentlyViewed() {
  const navigate = useNavigate();
  const [recentWorks, setRecentWorks] = useState<any[]>([]);

  useEffect(() => {
    const works = recentlyViewedStorage.get();
    setRecentWorks(works);
  }, []);

  if (recentWorks.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Icon name="History" size={28} className="text-blue-600" />
          <h2 className="text-2xl md:text-3xl font-bold">Недавно просмотренные</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {recentWorks.map((work) => (
            <div
              key={work.id}
              onClick={() => navigate(`/work/${work.id}`)}
              className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all cursor-pointer group overflow-hidden"
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
                <div className="absolute top-2 right-2">
                  <Badge className="bg-white/90 text-gray-700 text-xs px-2 py-1">
                    {work.workType}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                  {work.title}
                </h3>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {work.subject}
                  </Badge>
                  <div className="text-sm font-bold text-primary">
                    {work.price} ₽
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
