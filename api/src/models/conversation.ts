import {
  Schema,
  model,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export interface IConversation extends Document {
  members: Array<Types.ObjectId | string>;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    members: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
      validate: {
        validator: (members: Array<Types.ObjectId | string>) =>
          Array.isArray(members) && members.length > 0,
        message: "At least one participant is required.",
      },
    },
  },
  { timestamps: true }
);

const Conversation: Model<IConversation> = model<IConversation>(
  "Conversation",
  ConversationSchema
);

export default Conversation;
