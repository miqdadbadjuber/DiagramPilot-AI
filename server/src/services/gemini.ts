import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
import { systemInstruction } from "../prompts/system";
import { responseSchema } from "../prompts/schema";
import { logger } from "../lib/logger";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export const generateArchitecture = async (messages: { role: string, content: string }[]) => {
  try {
    const formattedMessages = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedMessages,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    // Clean up potential markdown formatting around JSON
    let cleanText = response.text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    return JSON.parse(cleanText);
  } catch (error) {
    logger.error("Gemini API Error", error);
    throw error;
  }
};
