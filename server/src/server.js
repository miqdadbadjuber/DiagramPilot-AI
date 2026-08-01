"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const logger_1 = require("./lib/logger");
const chat_1 = __importDefault(require("./routes/chat"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/chat", chat_1.default);
app.listen(env_1.env.PORT, () => {
    logger_1.logger.info(`Server is running on port ${env_1.env.PORT}`);
});
