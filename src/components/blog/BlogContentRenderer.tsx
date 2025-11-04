import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface BlogContentItem {
  type: string;
  text?: string;
  items?: string[] | Array<{ label: string; value: string }>;
}

interface BlogContentRendererProps {
  content: BlogContentItem[];
}

export default function BlogContentRenderer({ content }: BlogContentRendererProps) {
  const renderContent = (item: BlogContentItem, index: number) => {
    switch (item.type) {
      case 'intro':
        return (
          <p key={index} className="text-lg text-muted-foreground leading-relaxed mb-8 bg-primary/5 p-6 rounded-lg border-l-4 border-primary">
            {item.text}
          </p>
        );
      
      case 'heading':
        return <h2 key={index} className="text-3xl font-bold mt-12 mb-6">{item.text}</h2>;
      
      case 'paragraph':
        return <p key={index} className="text-base leading-relaxed mb-4">{item.text}</p>;
      
      case 'list':
        return (
          <ul key={index} className="space-y-3 mb-6 ml-6">
            {(item.items as string[])?.map((listItem: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-1" />
                <span>{listItem}</span>
              </li>
            ))}
          </ul>
        );
      
      case 'numbered-list':
        return (
          <ol key={index} className="space-y-3 mb-6 ml-6 list-decimal list-inside">
            {(item.items as string[])?.map((listItem: string, i: number) => (
              <li key={i} className="leading-relaxed">{listItem}</li>
            ))}
          </ol>
        );
      
      case 'checklist':
        return (
          <ul key={index} className="space-y-3 mb-6">
            {(item.items as string[])?.map((listItem: string, i: number) => (
              <li key={i} className="flex items-start gap-3 bg-secondary/30 p-3 rounded-lg">
                <Icon name="CheckSquare" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <span>{listItem}</span>
              </li>
            ))}
          </ul>
        );
      
      case 'tip':
        return (
          <Card key={index} className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4 flex items-start gap-3">
              <Icon name="Lightbulb" size={24} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Совет</p>
                <p className="text-blue-800">{item.text}</p>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'warning':
        return (
          <Card key={index} className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-2">
                <Icon name="AlertTriangle" size={24} className="text-yellow-600 flex-shrink-0" />
                <p className="font-semibold text-yellow-900">Важно</p>
              </div>
              <ul className="space-y-2 ml-9">
                {(item.items as string[])?.map((warningItem: string, i: number) => (
                  <li key={i} className="text-yellow-800">{warningItem}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      
      case 'parameters':
        return (
          <div key={index} className="mb-6 border rounded-lg overflow-hidden">
            {(item.items as Array<{ label: string; value: string }>)?.map((param, i: number) => (
              <div key={i} className="flex border-b last:border-b-0">
                <div className="w-1/3 bg-secondary p-3 font-semibold">{param.label}</div>
                <div className="w-2/3 p-3">{param.value}</div>
              </div>
            ))}
          </div>
        );
      
      case 'example':
        return (
          <div key={index} className="mb-6 p-4 bg-gray-100 rounded-lg border-l-4 border-gray-400 font-mono text-sm">
            {item.text}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="prose prose-lg max-w-none">
      {content.map((item, index) => renderContent(item, index))}
    </div>
  );
}
