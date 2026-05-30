import dotenv from "dotenv";

dotenv.config();

export const PORT = Number(process.env.PORT) || 8084;
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
export const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chat-app";
