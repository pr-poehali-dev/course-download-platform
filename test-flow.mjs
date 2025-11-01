async function testPurchaseFlow() {
  // Шаг 1: Покупка
  const purchaseResponse = await fetch('https://functions.poehali.dev/d28d5c1f-4c28-4563-86f1-15a959cd7f0a', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': '2'
    },
    body: JSON.stringify({ workId: 2576, userId: 2, price: 150 })
  });

  const purchaseData = await purchaseResponse.json();
  
  console.log('Шаг 1:', purchaseResponse.status, purchaseData.success, purchaseData.error || 'null');

  // Шаг 2: Скачивание (только если покупка успешна)
  if (purchaseResponse.status === 200 && purchaseData.success) {
    const downloadResponse = await fetch('https://functions.poehali.dev/5898b2f2-c4d9-4ff7-bd15-9600829fed08?workId=2576&publicKey=https://disk.yandex.ru/d/8J9vk2t_fe3cpA', {
      headers: {
        'X-User-Id': '2'
      }
    });

    const contentType = downloadResponse.headers.get('content-type');
    const body = await downloadResponse.text();
    
    console.log('Шаг 2:', downloadResponse.status, contentType, body.length);
  }
}

testPurchaseFlow().catch(console.error);
