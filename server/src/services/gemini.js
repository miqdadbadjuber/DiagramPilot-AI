"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateArchitecture = void 0;
const genai_1 = require("@google/genai");
const env_1 = require("../config/env");
const system_1 = require("../prompts/system");
const schema_1 = require("../prompts/schema");
const logger_1 = require("../lib/logger");
const ai = new genai_1.GoogleGenAI({ apiKey: env_1.env.GEMINI_API_KEY });
const generateArchitecture = async (messages) => {
    try {
        const formattedMessages = messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: formattedMessages,
            config: {
                systemInstruction: system_1.systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema_1.responseSchema,
            }
        });
        if (!response.text) {
            throw new Error("No response text from Gemini");
        }
        // Clean up potential markdown formatting around JSON
        let cleanText = response.text.trim();
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        }
        else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }
        return JSON.parse(cleanText);
    }
    catch (error) {
        logger_1.logger.error("Gemini API Error", error);
        throw error;
    }
};
exports.generateArchitecture = generateArchitecture;
