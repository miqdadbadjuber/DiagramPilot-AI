"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    GEMINI_API_KEY: zod_1.z.string().min(1, "GEMINI_API_KEY is required"),
    PORT: zod_1.z.string().default("3000"),
    CLIENT_URL: zod_1.z.string().optional(),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error("❌ Invalid Environment Variables:", _env.error.format());
    process.exit(1);
}
exports.env = _env.data;
