export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
}

export const sendEmailNotification = async (notification: EmailNotification): Promise<boolean> => {
  console.log('Email notification (mock):', notification);
  return true;
};

export const notifyNewWorkAvailable = async (userEmail: string, workTitle: string, category: string) => {
  return sendEmailNotification({
    to: userEmail,
    subject: `Новая работа в категории ${category}`,
    body: `Доступна новая работа: ${workTitle}`
  });
};

export const notifyPurchaseSuccess = async (userEmail: string, workTitle: string) => {
  return sendEmailNotification({
    to: userEmail,
    subject: 'Покупка успешно завершена',
    body: `Вы приобрели работу: ${workTitle}. Она доступна в личном кабинете.`
  });
};

export const notifyReferralBonus = async (userEmail: string, bonus: number) => {
  return sendEmailNotification({
    to: userEmail,
    subject: 'Реферальный бонус',
    body: `Вам начислено ${bonus} баллов за приглашенного друга!`
  });
};

export const notifyPromoActivated = async (userEmail: string, code: string, bonus: number) => {
  return sendEmailNotification({
    to: userEmail,
    subject: 'Промокод активирован',
    body: `Промокод ${code} активирован! Вам начислено ${bonus} баллов.`
  });
};
