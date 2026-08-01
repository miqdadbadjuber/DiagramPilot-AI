"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseSchema = void 0;
const genai_1 = require("@google/genai");
exports.responseSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        explanation: { type: genai_1.Type.STRING },
        mermaid: { type: genai_1.Type.STRING },
        architectureScore: { type: genai_1.Type.NUMBER },
        strengths: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        weaknesses: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        recommendation: { type: genai_1.Type.STRING },
    },
    required: [
        "explanation",
        "mermaid",
        "architectureScore",
        "strengths",
        "weaknesses",
        "recommendation",
    ],
};
