import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import chatRouter from "./routes/chat";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRouter);

app.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT}`);
});
