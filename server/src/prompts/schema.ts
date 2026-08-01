import { Type, Schema } from "@google/genai";

export const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    explanation: { 
      type: Type.STRING,
      description: "Detailed natural language explanation of the architecture."
    },
    mermaid: { 
      type: Type.STRING,
      description: "Raw Mermaid.js syntax. Each statement MUST be on a separate line using newline characters. Do NOT put all statements on one line. Do NOT wrap in markdown backticks."
    },
    architectureScore: { type: Type.NUMBER },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommendation: { type: Type.STRING },
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
