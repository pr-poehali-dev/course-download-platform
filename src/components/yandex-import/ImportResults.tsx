import Icon from '@/components/ui/icon';

interface ImportResult {
  success: boolean;
  imported: number;
  errors: number;
  details: {
    imported: Array<{
      filename: string;
      work_id: number;
      title: string;
    }>;
    errors: Array<{
      filename: string;
      error: string;
    }>;
  };
}

interface ImportResultsProps {
  result: ImportResult;
}

export default function ImportResults({ result }: ImportResultsProps) {
  return (
    <div className="space-y-4 p-4 bg-muted rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-green-500/10 rounded">
          <div className="text-2xl font-bold text-green-600">{result.imported}</div>
          <div className="text-sm text-muted-foreground">Импортировано</div>
        </div>
        <div className="text-center p-3 bg-red-500/10 rounded">
          <div className="text-2xl font-bold text-red-600">{result.errors}</div>
          <div className="text-sm text-muted-foreground">Ошибок</div>
        </div>
      </div>

      {result.details.imported.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Загруженные работы:</h4>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {result.details.imported.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-background rounded">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
                <span className="flex-1">{item.title}</span>
                <span className="text-muted-foreground">ID: {item.work_id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.details.errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Ошибки:</h4>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {result.details.errors.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-background rounded">
                <Icon name="XCircle" size={16} className="text-red-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{item.filename}</div>
                  <div className="text-muted-foreground text-xs">{item.error}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
