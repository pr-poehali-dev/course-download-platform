import { toast as originalToast } from '@/components/ui/use-toast';

export const toast = (props: Parameters<typeof originalToast>[0]) => {
  const result = originalToast(props);
  
  if (!props.duration && props.duration !== 0) {
    setTimeout(() => {
      result.dismiss();
    }, 5000);
  }
  
  return result;
};
