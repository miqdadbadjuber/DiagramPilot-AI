const http = require('http');

async function runTests() {
  console.log("--- RUNNING FUNCTIONAL VERIFICATION ---");
  
  const makeRequest = (payload) => {
    return new Promise((resolve, reject) => {
      const req = http.request('http://localhost:3005/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      });
      req.on('error', reject);
      req.write(JSON.stringify(payload));
      req.end();
    });
  };

  try {
    // Test 1: Invalid Payload (No messages array)
    console.log("\\n1. Testing Invalid Payload (Missing 'messages')");
    let res = await makeRequest({});
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, res.body);
    if (res.status !== 400) throw new Error("Expected 400");

    // Test 2: Invalid API Key (Dummy key should trigger 500 or 401 depending on the genai sdk behavior)
    console.log("\\n2. Testing Invalid API Key (Using dummy key in .env)");
    res = await makeRequest({ messages: [{ role: 'user', content: 'Hello' }] });
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, res.body);
    // The google genai SDK usually throws 400 API_KEY_INVALID which our code maps to 401.
    
    // Test 3: Rate Limiting (Spam requests)
    console.log("\\n3. Testing Rate Limiter (Spamming > 15 requests)");
    for(let i=0; i<16; i++) {
      res = await makeRequest({ messages: [{ role: 'user', content: 'Spam' }] });
    }
    console.log(`16th Request Status: ${res.status}`);
    console.log(`16th Request Response:`, res.body);
    if (res.status !== 429) throw new Error("Expected 429 Too Many Requests");

    console.log("\\n--- TESTS COMPLETED ---");
  } catch (err) {
    console.error("Test failed:", err.message);
    process.exit(1);
  }
}

setTimeout(runTests, 2000); // Wait for server to boot
