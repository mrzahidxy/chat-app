import type { AxiosResponse } from "axios";
import { privateRequest } from "../utils/requestMethod";
import type { Conversation, Message } from "../types";
import type { UploadImageResponse } from "../types/api";

export interface SendMessageRequest {
  conversationId: string;
  text?: string;
  imageUrl?: string;
}

const fetchConversations = (): Promise<AxiosResponse<Conversation[]>> =>
  privateRequest.get<Conversation[]>("/conversations");

const fetchMessages = (
  conversationId: string
): Promise<AxiosResponse<Message[]>> =>
  privateRequest.get<Message[]>(`/messages/${conversationId}`);

const sendMessage = (
  payload: SendMessageRequest
): Promise<AxiosResponse<Message>> =>
  privateRequest.post<Message>("/messages", payload);

const uploadImage = (
  formData: FormData
): Promise<AxiosResponse<UploadImageResponse>> =>
  privateRequest.post<UploadImageResponse>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

const createConversation = (
  participantId: string
): Promise<AxiosResponse<Conversation>> =>
  privateRequest.post<Conversation>("/conversations", { participantId });

const messengerServices = {
  fetchConversations,
  fetchMessages,
  sendMessage,
  createConversation,
  uploadImage,
};

export default messengerServices;
