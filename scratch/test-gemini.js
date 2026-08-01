const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

async function testGemini() {
  console.log("Testing Gemini API with key:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say "hello world"',
    });
    console.log("SUCCESS:", response.text);
  } catch (err) {
    console.error("FAILED:");
    console.error(err.message);
  }
}

testGemini();
