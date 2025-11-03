import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import PreviewCarousel from '@/components/PreviewCarousel';

interface Work {
  id: string;
  folderName: string;
  title: string;
  workType: string;
  subject: string;
  description: string;
  composition: string;
  universities: string | null;
  price: number;
  rating: number;
  previewUrl: string | null;
  previewUrls?: string[];
  purchaseCount?: number;
  isHit?: boolean;
  isNew?: boolean;
  discount?: number;
  pageCount?: number;
  fileCount?: number;
}

interface QuickViewModalProps {
  work: Work | null;
  open: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ work, open, onClose }: QuickViewModalProps) {
  if (!work) return null;

  const finalPrice = work.discount 
    ? work.price * (1 - work.discount / 100) 
    : work.price;

  const handleBuyClick = () => {
    window.location.href = `/work/${work.id}`;
  };

  const hasPreview = work.previewUrls && work.previewUrls.length > 0;

  const compositionItems = work.composition.split(',').map(item => item.trim());

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <DialogTitle className="flex-1 text-xl">{work.title.charAt(0).toUpperCase() + work.title.slice(1)}</DialogTitle>
            <div className="flex gap-2">
              {work.isNew && (
                <Badge className="bg-green-500 text-white">
                  <Icon name="Sparkles" size={12} className="mr-1" />
                  Новинка
                </Badge>
              )}
              {work.isHit && (
                <Badge className="bg-orange-500 text-white">
                  <Icon name="Flame" size={12} className="mr-1" />
                  Хит
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div>
            {hasPreview ? (
              <div className="rounded-xl overflow-hidden border shadow-lg">
                <PreviewCarousel previews={work.previewUrls!} />
              </div>
            ) : (
              <div className="h-80 rounded-xl overflow-hidden border relative">
                <img 
                  src="https://cdn.poehali.dev/projects/ec3b8f42-ccbd-48be-bf66-8de3931d3384/files/e0139de0-3660-402a-8d29-d07f5dac95b3.jpg"
                  alt={work.workType}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center pb-8">
                  <p className="text-lg text-white font-bold drop-shadow-lg">{work.workType}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="space-y-4">
              <div>
                {work.rating > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon 
                          key={star} 
                          name="Star" 
                          size={16} 
                          className={star <= work.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{work.rating.toFixed(1)}</span>
                  </div>
                )}
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {work.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Icon name="BookOpen" size={20} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-blue-600 font-semibold uppercase mb-1">Предмет</div>
                    <div className="text-sm text-gray-900 capitalize">{work.subject}</div>
                  </div>
                </div>

                {work.universities && (
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Icon name="Building2" size={20} className="text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-purple-600 font-semibold uppercase mb-1">Организация</div>
                      <div className="text-sm text-gray-900">{work.universities}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Icon name="Package" size={20} className="text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs text-green-600 font-semibold uppercase mb-2">Состав работы</div>
                    <div className="space-y-1">
                      {compositionItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-900">
                          <Icon name="Check" size={14} className="text-green-600 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {(work.pageCount || work.fileCount) && (
                  <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                    {work.pageCount && (
                      <div className="flex items-center gap-2">
                        <Icon name="FileText" size={18} className="text-gray-600" />
                        <div>
                          <div className="text-xs text-gray-500">Страниц</div>
                          <div className="text-sm font-semibold text-gray-900">{work.pageCount}</div>
                        </div>
                      </div>
                    )}
                    {work.fileCount && (
                      <div className="flex items-center gap-2">
                        <Icon name="Files" size={18} className="text-gray-600" />
                        <div>
                          <div className="text-xs text-gray-500">Файлов</div>
                          <div className="text-sm font-semibold text-gray-900">{work.fileCount}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    {work.discount ? (
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400 line-through">{work.price} б.</span>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-green-600">{Math.round(finalPrice)} б.</span>
                          <Badge className="bg-red-500 text-white">−{work.discount}%</Badge>
                        </div>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">{work.price} б.</span>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleBuyClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
                >
                  <Icon name="ShoppingCart" size={20} className="mr-2" />
                  Купить сейчас
                </Button>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Icon name="ShieldCheck" size={14} className="text-green-600" />
                    <span>Гарантия возврата в течение 7 дней</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Download" size={14} className="text-blue-600" />
                    <span>Мгновенное скачивание после оплаты</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Lock" size={14} className="text-purple-600" />
                    <span>Безопасная оплата</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}