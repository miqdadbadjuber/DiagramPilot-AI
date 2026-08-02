import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { logger } from "../lib/logger";
import { generateArchitecture } from "../services/gemini";

const router = Router();

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 15,
  message: { success: false, error: "Too many requests, please try again later." }
});

const userQuotas = new Map<string, number>();

router.get("/quota", (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const used = userQuotas.get(ip) || 0;
  const remaining = Math.max(0, 5 - used);
  const percentage = (remaining / 5) * 100;
  res.json({ success: true, quota: { remaining, limit: 5, percentage } });
});

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "model", "assistant"]),
        content: z.string().min(1, "Message content must not be empty.").max(8000, "Message content is too long (max 8000 characters)."),
      })
    )
    .min(1, "At least one message is required.")
    .max(50, "Too many messages in payload (max 50)."),
});

router.post("/", limiter, async (req, res) => {
  try {
    const parsed = chatRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      logger.warn("Validation failed", { issues: parsed.error.issues });
      return res.status(400).json({
        success: false,
        error: `Validation error: ${firstError.message} (path: ${firstError.path.join(".")})`,
      });
    }

    const { messages } = parsed.data;
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const used = userQuotas.get(ip) || 0;

    logger.info("Incoming chat request", { messagesCount: messages.length, ip, usedQuota: used });
    
    // Check quota before asking Gemini, but only block if they're trying to generate a diagram?
    // Since we don't know yet, we allow the chat but if they are out of quota, we can tell the system prompt.
    // Let's just generate the response.
    const result = await generateArchitecture(messages);
    
    // If a diagram was actually generated, reduce quota
    if (result.mermaid && result.mermaid.trim().length > 0) {
      if (used >= 5) {
        // They asked for a diagram but are out of quota.
        return res.json({ 
          success: true, 
          data: {
            explanation: "⚠️ **Quota Limit Exceeded**\n\nMaaf, Anda telah mencapai batas maksimal pembuatan diagram (5/5). Anda masih dapat menggunakan fitur chat AI secara gratis, namun pembuatan diagram visual telah diblokir.",
            mermaid: "",
            architectureScore: 0,
            strengths: [],
            weaknesses: [],
            recommendation: "Mohon tingkatkan paket akun Anda (Segera Hadir)."
          } 
        });
      }
      // Deduct quota
      userQuotas.set(ip, used + 1);
    }
    
    res.json({ success: true, data: result, quotaUpdated: true });
  } catch (error: any) {
    logger.error("Chat request failed", { message: error.message, stack: error.stack });
    
    let errorMessage = "An unexpected error occurred.";
    let statusCode = 500;

    if (error.message) {
      if (error.message.includes("API_KEY_INVALID")) {
        errorMessage = "Invalid API Key configured.";
        statusCode = 401;
      } else if (error.message.includes("Quota") || error.message.includes("429")) {
        errorMessage = "Gemini API rate limit exceeded. Please try again later.";
        statusCode = 429;
      } else if (error.message.includes("timeout") || error.message.includes("ECONNRESET")) {
        errorMessage = "Request to Gemini API timed out.";
        statusCode = 504;
      } else if (error.name === "SyntaxError") {
        errorMessage = "Failed to parse AI response. Invalid JSON format.";
        statusCode = 502;
      } else if (error.message === "No response text from Gemini") {
        errorMessage = "Received empty response from AI.";
        statusCode = 502;
      }
    }

    res.status(statusCode).json({ success: false, error: errorMessage });
  }
});

export default router;
