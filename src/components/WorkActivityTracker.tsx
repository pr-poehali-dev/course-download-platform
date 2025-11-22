import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

interface WorkActivityProps {
  workId: number;
  onView?: boolean;
  showLabels?: boolean;
}

export default function WorkActivityTracker({
  workId,
  onView = false,
  showLabels = true
}: WorkActivityProps) {
  const [views, setViews] = useState(0);
  const [downloads, setDownloads] = useState(0);
  const [reviews, setReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [workId]);

  useEffect(() => {
    if (onView && !loading) {
      trackActivity('view');
    }
  }, [workId, onView, loading]);

  const loadStats = async () => {
    try {
      const response = await fetch(`${func2url['work-stats']}?work_id=${workId}`);
      if (response.ok) {
        const data = await response.json();
        setViews(data.views || 0);
        setDownloads(data.downloads || 0);
        setReviews(data.reviews || 0);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackActivity = async (activityType: 'view' | 'download' | 'review') => {
    try {
      const response = await fetch(func2url['work-stats'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          work_id: workId,
          action: activityType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setViews(data.views || 0);
        setDownloads(data.downloads || 0);
        setReviews(data.reviews || 0);
      }
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon name="Eye" size={16} className="text-blue-600" />
        <span className="font-medium">{views}</span>
        {showLabels && <span className="hidden sm:inline">просмотров</span>}
      </div>
      
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon name="Download" size={16} className="text-green-600" />
        <span className="font-medium">{downloads}</span>
        {showLabels && <span className="hidden sm:inline">скачиваний</span>}
      </div>
      
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon name="MessageSquare" size={16} className="text-purple-600" />
        <span className="font-medium">{reviews}</span>
        {showLabels && <span className="hidden sm:inline">отзывов</span>}
      </div>
    </div>
  );
}