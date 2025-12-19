import {
  Schema,
  model,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  sender: Types.ObjectId;
  text?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

const Message: Model<IMessage> = model<IMessage>("Message", MessageSchema);

export default Message;
