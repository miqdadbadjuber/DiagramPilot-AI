const http = require('http');

async function testAIFlow() {
  console.log("--- RUNNING REAL AI FLOW TEST VIA VITE PROXY ---");
  
  const makeRequest = (messages) => {
    return new Promise((resolve, reject) => {
      const req = http.request('http://localhost:5173/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      });
      req.on('error', reject);
      req.write(JSON.stringify({ messages }));
      req.end();
    });
  };

  const prompts = [
    "Buat arsitektur e-commerce",
    "Ubah menjadi microservices",
    "Tambahkan Redis",
    "Ganti database menjadi PostgreSQL",
    "Review kelemahan arsitektur"
  ];
  
  const history = [];

  try {
    for (let i = 0; i < prompts.length; i++) {
      console.log(`\n[Test ${i+1}] Prompt: "${prompts[i]}"`);
      history.push({ role: 'user', content: prompts[i] });
      
      const res = await makeRequest(history);
      console.log(`Status: ${res.status}`);
      
      if (res.status === 200) {
        const data = res.body.data;
        console.log(`Success! Data received:`);
        console.log(`- Architecture Score: ${data.architectureScore}`);
        console.log(`- Explanation snippet: ${data.explanation.substring(0, 50)}...`);
        console.log(`- Mermaid snippet: ${data.mermaid ? data.mermaid.substring(0, 50).replace(/\n/g, ' ') : "NULL"}`);
        
        // Save assistant response to history
        const modelReply = `**Architecture Score: ${data.architectureScore}/100**\n\n${data.explanation}`;
        history.push({ role: 'model', content: modelReply });
      } else {
        console.log(`Error Response:`, res.body);
        throw new Error("Request failed with status " + res.status);
      }
    }
    
    console.log("\n--- ALL TESTS COMPLETED SUCCESSFULLY ---");
  } catch (err) {
    console.error("Test failed:", err.message);
    process.exit(1);
  }
}

setTimeout(testAIFlow, 5000); // Wait for dev servers to be fully ready
