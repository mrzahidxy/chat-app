import type { Server, Socket } from "socket.io";

type OnlineUserEntry = { socketId: string; username?: string };

type JoinPayload =
  | string
  | {
      userId?: string;
      id?: string;
      username?: string;
    };

type SendMessagePayload = {
  conversationId: string;
  senderId: string;
  receiverId: string;
  text?: string;
  imageUrl?: string;
};

const registerSocketHandlers = (io: Server) => {
  const onlineUsers = new Map<string, OnlineUserEntry>();

  const emitOnlineUsers = () => {
    const online = Array.from(onlineUsers.entries()).map(
      ([userId, { username }]) => ({
        id: userId,
        username,
      })
    );
    io.emit("users:online", online);
  };

  io.on("connection", (socket: Socket) => {
    socket.on("join", (payload: JoinPayload) => {
      const userId =
        typeof payload === "string" ? payload : payload?.userId || payload?.id;
      const username =
        typeof payload === "object" && payload?.username
          ? payload.username
          : undefined;

      if (!userId) {
        return;
      }

      onlineUsers.set(userId, { socketId: socket.id, username });
      emitOnlineUsers();
    });

    socket.on("sendMessage", (payload: SendMessagePayload) => {
      const { conversationId, senderId, receiverId, text, imageUrl } = payload;
      if (!senderId || !receiverId || (!text && !imageUrl)) {
        return;
      }

      const receiverSocketId = onlineUsers.get(receiverId)?.socketId;

      if (!receiverSocketId) {
        return;
      }

      io.to(receiverSocketId).emit("receiveMessage", {
        conversationId,
        senderId,
        text,
        imageUrl,
      });
    });

    socket.on("disconnect", () => {
      for (const [userId, entry] of onlineUsers.entries()) {
        if (entry.socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      emitOnlineUsers();
    });
  });
};

export default registerSocketHandlers;
