import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

interface WorkActivityProps {
  workId: number;
  initialViews?: number;
  initialDownloads?: number;
  initialReviews?: number;
  onView?: boolean;
  showLabels?: boolean;
}

export default function WorkActivityTracker({
  workId,
  initialViews = 0,
  initialDownloads = 0,
  initialReviews = 0,
  onView = false,
  showLabels = true
}: WorkActivityProps) {
  const [views, setViews] = useState(initialViews);
  const [downloads, setDownloads] = useState(initialDownloads);
  const [reviews, setReviews] = useState(initialReviews);

  useEffect(() => {
    if (onView) {
      trackActivity('view');
    }
  }, [workId, onView]);

  const trackActivity = async (activityType: 'view' | 'download' | 'review') => {
    try {
      const response = await fetch(func2url.works, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workId,
          activityType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setViews(data.views || 0);
        setDownloads(data.downloads || 0);
        setReviews(data.reviewsCount || 0);
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
