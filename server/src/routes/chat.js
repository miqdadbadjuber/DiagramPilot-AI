"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const zod_1 = require("zod");
const logger_1 = require("../lib/logger");
const gemini_1 = require("../services/gemini");
const router = (0, express_1.Router)();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 15,
    message: { success: false, error: "Too many requests, please try again later." }
});
const userQuotas = new Map();
router.get("/quota", (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const used = userQuotas.get(ip) || 0;
    const remaining = Math.max(0, 5 - used);
    const percentage = (remaining / 5) * 100;
    res.json({ success: true, quota: { remaining, limit: 5, percentage } });
});
const chatRequestSchema = zod_1.z.object({
    messages: zod_1.z
        .array(zod_1.z.object({
        role: zod_1.z.enum(["user", "model", "assistant"]),
        content: zod_1.z.string().min(1, "Message content must not be empty.").max(8000, "Message content is too long (max 8000 characters)."),
    }))
        .min(1, "At least one message is required.")
        .max(50, "Too many messages in payload (max 50)."),
});
const activeRequests = new Set();
router.post("/", limiter, async (req, res) => {
    try {
        const parsed = chatRequestSchema.safeParse(req.body);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0];
            logger_1.logger.warn("Validation failed", { issues: parsed.error.issues });
            return res.status(400).json({
                success: false,
                error: `Validation error: ${firstError.message} (path: ${firstError.path.join(".")})`,
            });
        }
        const { messages } = parsed.data;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        if (activeRequests.has(ip)) {
            return res.status(429).json({
                success: false,
                error: "Please wait for your previous request to finish.",
            });
        }
        activeRequests.add(ip);
        try {
            const used = userQuotas.get(ip) || 0;
            const allowDiagram = used < 5;
            logger_1.logger.info("Incoming chat request", { messagesCount: messages.length, ip, usedQuota: used, allowDiagram });
            const result = await (0, gemini_1.generateArchitecture)(messages, allowDiagram);
            // If a diagram was actually generated, reduce quota
            if (result.mermaid && result.mermaid.trim().length > 0) {
                if (!allowDiagram) {
                    // Fallback if AI ignores instruction
                    result.mermaid = "";
                    result.explanation = "⚠️ **Quota Limit Exceeded**\n\nMaaf, Anda telah mencapai batas maksimal pembuatan diagram (5/5). Anda masih dapat menggunakan fitur chat AI secara gratis, namun pembuatan diagram visual telah diblokir.\n\n" + result.explanation;
                }
                else {
                    userQuotas.set(ip, used + 1);
                }
            }
            else if (!allowDiagram) {
                // If no diagram generated because of limit, prepend a small note (optional)
                // But maybe better to just let the chat flow.
            }
            res.json({ success: true, data: result, quotaUpdated: true });
        }
        finally {
            activeRequests.delete(ip);
        }
    }
    catch (error) {
        logger_1.logger.error("Chat request failed", { message: error.message, stack: error.stack });
        let errorMessage = "An unexpected error occurred.";
        let statusCode = 500;
        if (error.message) {
            if (error.message.includes("API_KEY_INVALID")) {
                errorMessage = "Invalid API Key configured.";
                statusCode = 401;
            }
            else if (error.message.includes("Quota") || error.message.includes("429")) {
                errorMessage = "Gemini API rate limit exceeded. Please try again later.";
                statusCode = 429;
            }
            else if (error.message.includes("timeout") || error.message.includes("ECONNRESET")) {
                errorMessage = "Request to Gemini API timed out.";
                statusCode = 504;
            }
            else if (error.name === "SyntaxError") {
                errorMessage = "Failed to parse AI response. Invalid JSON format.";
                statusCode = 502;
            }
            else if (error.message === "No response text from Gemini") {
                errorMessage = "Received empty response from AI.";
                statusCode = 502;
            }
        }
        res.status(statusCode).json({ success: false, error: errorMessage });
    }
});
exports.default = router;
