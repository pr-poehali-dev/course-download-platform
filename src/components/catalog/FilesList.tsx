import Icon from '@/components/ui/icon';

interface FileItem {
  name: string;
  type: string;
  size: number;
}

interface FilesListProps {
  files: FileItem[];
  maxFiles?: number;
}

const FILE_TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  word: { icon: 'FileText', color: 'text-blue-600 bg-blue-50', label: 'Word' },
  pdf: { icon: 'FileText', color: 'text-red-600 bg-red-50', label: 'PDF' },
  cad: { icon: 'Box', color: 'text-purple-600 bg-purple-50', label: 'CAD' },
  excel: { icon: 'Table', color: 'text-green-600 bg-green-50', label: 'Excel' },
  powerpoint: { icon: 'Presentation', color: 'text-orange-600 bg-orange-50', label: 'PowerPoint' },
  image: { icon: 'Image', color: 'text-pink-600 bg-pink-50', label: 'Изображение' },
  archive: { icon: 'Archive', color: 'text-gray-600 bg-gray-50', label: 'Архив' },
  text: { icon: 'FileText', color: 'text-gray-600 bg-gray-50', label: 'Текст' },
  unknown: { icon: 'File', color: 'text-gray-500 bg-gray-50', label: 'Файл' }
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export default function FilesList({ files, maxFiles = 5 }: FilesListProps) {
  if (!files || files.length === 0) return null;

  const displayFiles = files.slice(0, maxFiles);
  const remainingCount = files.length - maxFiles;

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        Состав архива
      </div>
      <div className="space-y-1.5">
        {displayFiles.map((file, idx) => {
          const config = FILE_TYPE_CONFIG[file.type] || FILE_TYPE_CONFIG.unknown;
          return (
            <div
              key={idx}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50/50 transition-colors"
            >
              <div className={`p-1.5 rounded-md ${config.color} shrink-0`}>
                <Icon name={config.icon as any} size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-900 truncate">
                  {file.name}
                </div>
                <div className="text-[10px] text-gray-500">
                  {config.label} • {formatFileSize(file.size)}
                </div>
              </div>
            </div>
          );
        })}
        {remainingCount > 0 && (
          <div className="text-[10px] text-gray-500 px-2 py-1">
            + еще {remainingCount} {remainingCount === 1 ? 'файл' : remainingCount < 5 ? 'файла' : 'файлов'}
          </div>
        )}
      </div>
    </div>
  );
}
