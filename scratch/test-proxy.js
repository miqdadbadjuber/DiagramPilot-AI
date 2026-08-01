const http = require('http');

async function testProxy() {
  console.log("--- TESTING VITE PROXY ---");
  
  const req = http.request('http://localhost:5173/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response:`, data);
      
      try {
        const json = JSON.parse(data);
        if (json.error === "Invalid payload: 'messages' array is required.") {
          console.log("Proxy works perfectly! Hit the Express backend.");
        } else {
          console.log("Unexpected JSON response.", json);
        }
      } catch (e) {
        console.log("Failed to parse JSON. Proxy might be returning HTML or nothing.");
      }
      process.exit(0);
    });
  });
  
  req.on('error', (err) => {
    console.error("Request failed:", err.message);
    process.exit(1);
  });
  
  req.write(JSON.stringify({}));
  req.end();
}

setTimeout(testProxy, 5000); // Wait for both servers to start
