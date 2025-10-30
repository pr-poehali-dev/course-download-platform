// Quick endpoint test script
async function testEndpoints() {
  console.log('Testing Backend Endpoints\n');
  
  // Test 1: GET works list
  console.log('1. Testing GET /works endpoint...');
  try {
    const response1 = await fetch('https://functions.poehali.dev/a16a43fc-fa7d-4c72-ad15-ba566d2c7413');
    console.log(`Status: ${response1.status}`);
    const data1 = await response1.json();
    console.log(`Response: ${JSON.stringify(data1).substring(0, 200)}...\n`);
  } catch (error) {
    console.log(`Error: ${error.message}\n`);
  }
  
  // Test 2: GET categories
  console.log('2. Testing GET /categories endpoint...');
  try {
    const response2 = await fetch('https://functions.poehali.dev/fe9c2ac7-b4dc-4649-a10d-c4c20015ae82');
    console.log(`Status: ${response2.status}`);
    const data2 = await response2.json();
    console.log(`Response: ${JSON.stringify(data2).substring(0, 200)}...\n`);
  } catch (error) {
    console.log(`Error: ${error.message}\n`);
  }
  
  // Test 3: POST auth verify
  console.log('3. Testing POST /auth verify endpoint...');
  try {
    const response3 = await fetch('https://functions.poehali.dev/48e96862-17ab-4f46-a6b8-f123b2e32e46', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'verify' })
    });
    console.log(`Status: ${response3.status}`);
    const data3 = await response3.json();
    console.log(`Response: ${JSON.stringify(data3, null, 2)}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

testEndpoints();
