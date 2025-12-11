import Icon from '@/components/ui/icon';

interface CatalogLoadingStateProps {
  loading: boolean;
  loadingProgress: number;
  isEmpty: boolean;
}

export default function CatalogLoadingState({ loading, loadingProgress, isEmpty }: CatalogLoadingStateProps) {
  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
        <p className="text-gray-600 mb-3 text-lg">Загрузка каталога...</p>
        <div className="max-w-md mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{loadingProgress}%</p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-center py-20">
        <Icon name="Search" className="mx-auto text-gray-300 mb-4" size={64} />
        <p className="text-xl text-gray-600">Работы не найдены</p>
        <p className="text-gray-500 mt-2">Попробуйте изменить параметры поиска</p>
      </div>
    );
  }

  return null;
}
