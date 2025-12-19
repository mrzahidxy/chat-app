import { Router, type Request, type Response } from "express";
import type { Types } from "mongoose";
import Conversation, { type IConversation } from "../models/conversation";
import auth from "../middleware/auth";

interface CreateConversationBody {
  participantId?: string;
}

type AuthedRequest<
  P = unknown,
  ResBody = unknown,
  ReqBody = unknown
> = Request<P, ResBody, ReqBody> & { userId?: string };

const router = Router();

router.post(
  "/",
  auth,
  async (
    req: AuthedRequest<unknown, IConversation | { message: string }, CreateConversationBody>,
    res: Response<IConversation | { message: string }>
  ) => {
    try {
      const participantId =
        typeof req.body.participantId === "string"
          ? req.body.participantId.trim()
          : "";

      if (!participantId) {
        return res.status(400).json({ message: "participantId is required." });
      }

      if (participantId === req.userId) {
        return res
          .status(400)
          .json({ message: "Cannot create a conversation with yourself." });
      }

      const userId = req.userId as string;
      const members: Array<string | Types.ObjectId> = [userId, participantId];

      const existingConversation = await Conversation.findOne({
        members: { $all: members },
      }).populate("members", "username email");

      if (existingConversation) {
        return res.status(200).json(existingConversation);
      }

      const newConversation = await Conversation.create({ members });
      const populatedConversation = await Conversation.findById(
        newConversation._id
      ).populate("members", "username email");

      return res.status(201).json(populatedConversation as IConversation);
    } catch (error) {
      return res.status(500).json({ message: "Failed to create conversation." });
    }
  }
);

router.get("/", auth, async (req: AuthedRequest, res: Response) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.userId] },
    })
      .sort("-updatedAt")
      .populate("members", "username email");

    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load conversations." });
  }
});

router.get(
  "/:conversationId",
  auth,
  async (req: AuthedRequest<{ conversationId: string }>, res: Response) => {
    try {
      const conversation = await Conversation.findOne({
        _id: req.params.conversationId,
        members: { $in: [req.userId] },
      }).populate("members", "username email");

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found." });
      }

      return res.status(200).json(conversation);
    } catch (error) {
      return res.status(500).json({ message: "Failed to load conversation." });
    }
  }
);

export default router;
