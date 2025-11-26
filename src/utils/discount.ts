export function getUserDiscount(balance: number): number {
  if (balance >= 1500) return 15;
  if (balance >= 600) return 10;
  if (balance >= 100) return 5;
  return 0;
}

export const DISCOUNT_TIERS = [
  { threshold: 100, discount: 5 },
  { threshold: 600, discount: 10 },
  { threshold: 1500, discount: 15 },
];
