import Offer from './Offer';
import SEO from '@/components/SEO';

export default function OfferPage() {
  return (
    <>
      <SEO 
        title="Публичная оферта"
        description="Договор публичной оферты Tech Forma. Условия покупки и использования материалов на платформе."
        canonical="https://techforma.pro/offer"
      />
      <Offer />
    </>
  );
}