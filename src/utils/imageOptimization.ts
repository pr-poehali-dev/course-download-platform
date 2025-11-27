/**
 * Утилита для оптимизации изображений:
 * - Конвертация в WebP формат
 * - Сжатие с сохранением качества
 * - Генерация превью разных размеров
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1, default 0.85
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Оптимизирует изображение с помощью Canvas API
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'webp'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;

    img.onload = () => {
      try {
        let { width, height } = img;

        // Рассчитываем новые размеры с сохранением пропорций
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Создаём canvas для отрисовки
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Отрисовываем изображение с сглаживанием
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Конвертируем в blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          `image/${format}`,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    reader.readAsDataURL(file);
  });
}

/**
 * Создаёт несколько размеров изображения (для responsive)
 */
export async function generateResponsiveImages(
  file: File,
  sizes: number[] = [320, 640, 1024, 1920]
): Promise<{ width: number; blob: Blob }[]> {
  const results: { width: number; blob: Blob }[] = [];

  for (const size of sizes) {
    try {
      const blob = await optimizeImage(file, {
        maxWidth: size,
        maxHeight: size,
        quality: 0.85,
        format: 'webp'
      });
      results.push({ width: size, blob });
    } catch (error) {
      console.error(`Failed to generate ${size}px image:`, error);
    }
  }

  return results;
}

/**
 * Конвертирует blob в base64 для отправки на сервер
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Оптимизирует изображение и возвращает base64
 */
export async function optimizeAndEncodeImage(
  file: File,
  options?: ImageOptimizationOptions
): Promise<{ base64: string; size: number; format: string }> {
  const optimizedBlob = await optimizeImage(file, options);
  const base64 = await blobToBase64(optimizedBlob);

  return {
    base64,
    size: optimizedBlob.size,
    format: optimizedBlob.type
  };
}

/**
 * Проверяет, поддерживается ли формат WebP браузером
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
}

/**
 * Получает размеры изображения без загрузки полного файла
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    reader.readAsDataURL(file);
  });
}

/**
 * Валидирует размер и формат изображения
 */
export async function validateImage(
  file: File,
  options: {
    maxSize?: number; // в байтах
    allowedFormats?: string[];
    minWidth?: number;
    minHeight?: number;
  } = {}
): Promise<{ valid: boolean; error?: string }> {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    minWidth = 100,
    minHeight = 100
  } = options;

  // Проверка формата
  if (!allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `Неподдерживаемый формат. Разрешены: ${allowedFormats.join(', ')}`
    };
  }

  // Проверка размера файла
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `Файл слишком большой. Максимум: ${maxSizeMB} МБ`
    };
  }

  // Проверка размеров изображения
  try {
    const { width, height } = await getImageDimensions(file);

    if (width < minWidth || height < minHeight) {
      return {
        valid: false,
        error: `Изображение слишком маленькое. Минимум: ${minWidth}x${minHeight}px`
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Не удалось прочитать изображение'
    };
  }

  return { valid: true };
}
