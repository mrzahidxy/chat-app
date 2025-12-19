export interface Message {
  _id: string;
  conversationId: string;
  sender: string;
  text?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
