"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseSchema = void 0;
const genai_1 = require("@google/genai");
exports.responseSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        explanation: {
            type: genai_1.Type.STRING,
            description: "Detailed natural language explanation of the architecture."
        },
        mermaid: {
            type: genai_1.Type.STRING,
            description: "Raw Mermaid.js syntax. Each statement MUST be on a separate line using newline characters. Do NOT put all statements on one line. Do NOT wrap in markdown backticks."
        },
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
