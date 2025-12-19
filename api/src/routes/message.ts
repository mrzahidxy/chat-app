import { Router, type Request, type Response } from "express";
import Message, { type IMessage } from "../models/message";
import Conversation from "../models/conversation";
import auth from "../middleware/auth";

const router = Router();

interface SendMessageBody {
  conversationId?: string;
  text?: string;
  imageUrl?: string;
}

type AuthedRequest<
  P = unknown,
  ResBody = unknown,
  ReqBody = unknown
> = Request<P, ResBody, ReqBody> & { userId?: string };

const findConversationForUser = (conversationId: string, userId?: string | null) =>
  Conversation.findOne({
    _id: conversationId,
    members: { $in: [userId] },
  });

router.post(
  "/",
  auth,
  async (
    req: AuthedRequest<unknown, IMessage | { message: string }, SendMessageBody>,
    res: Response<IMessage | { message: string }>
  ) => {
    try {
      const { conversationId, text, imageUrl } = req.body;

      if (!conversationId || (!text && !imageUrl)) {
        return res.status(400).json({
          message: "conversationId and a message (text or image) are required.",
        });
      }

      const conversation = await findConversationForUser(
        conversationId,
        req.userId
      );

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found." });
      }

      const newMessage = await Message.create({
        conversationId,
        sender: req.userId,
        text,
        imageUrl,
      });

      return res.status(201).json(newMessage);
    } catch (error) {
      return res.status(500).json({ message: "Failed to send message." });
    }
  }
);

router.get(
  "/:conversationId",
  auth,
  async (
    req: AuthedRequest<{ conversationId: string }>,
    res: Response<IMessage[] | { message: string }>
  ) => {
    try {
      const conversation = await findConversationForUser(
        req.params.conversationId,
        req.userId
      );

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found." });
      }

      const messages = await Message.find({
        conversationId: req.params.conversationId,
      }).sort("createdAt");

      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json({ message: "Failed to load messages." });
    }
  }
);

export default router;
