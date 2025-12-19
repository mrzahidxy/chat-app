export interface ConversationMember {
  _id: string;
  username?: string;
  email?: string;
}

export interface Conversation {
  _id: string;
  members: ConversationMember[];
  createdAt?: string;
  updatedAt?: string;
}
