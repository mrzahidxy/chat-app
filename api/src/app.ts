import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import { CLIENT_URL } from "./config";

import authRoutes from "./routes/auth";
import conversationRoutes from "./routes/conversation";
import messageRoutes from "./routes/message";
import uploadRoutes from "./routes/upload";

const app: Application = express();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

export default app;
