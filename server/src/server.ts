import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import chatRouter from "./routes/chat";

const app = express();

const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
if (env.CLIENT_URL) {
  allowedOrigins.push(env.CLIENT_URL);
}
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "1mb" }));

app.use("/api/chat", chatRouter);

app.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT}`);
});
