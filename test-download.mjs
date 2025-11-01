async function testDownload() {
  const response = await fetch('https://functions.poehali.dev/5898b2f2-c4d9-4ff7-bd15-9600829fed08?workId=2576&publicKey=https://disk.yandex.ru/d/8J9vk2t_fe3cpA', {
    headers: {
      'X-User-Id': '2'
    }
  });

  const text = await response.text();
  
  console.log(response.status);
  console.log(text.substring(0, 100));
  
  if (!response.ok) {
    try {
      const json = JSON.parse(text);
      if (json.error) console.log(json.error);
    } catch (e) {}
  }
}

testDownload().catch(err => console.log(err.message));
