"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("../lib/logger");
const gemini_1 = require("../services/gemini");
const router = (0, express_1.Router)();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 15,
    message: { success: false, error: "Too many requests, please try again later." }
});
router.post("/", limiter, async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ success: false, error: "Invalid payload: 'messages' array is required." });
        }
        logger_1.logger.info("Incoming chat request", { messagesCount: messages.length });
        const result = await (0, gemini_1.generateArchitecture)(messages);
        res.json({ success: true, data: result });
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
