import { createServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";

import app from "./app";
import registerSocketHandlers from "./sockets";
import { CLIENT_URL, PORT, MONGO_URI } from "./config";
import { configureCloudinary } from "./config/cloudinary";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  });

configureCloudinary();

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
