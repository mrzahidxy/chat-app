import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import Conversations from "../../components/messenger/Conversations";
import MessageBubble from "../../components/messenger/Message";
import OnlineUser from "../../components/messenger/OnlineUser";
import ImageUpload from "../../components/messenger/ImageUpload";
import { AuthContext } from "../../context/AuthProvider";
import messengerServices from "../../services/messengerServices";
import { formatUserLabel } from "../../utils/userLabel";
import { API_BASE_URL, SOCKET_URL } from "../../config/env";
import type {
  Conversation,
  ConversationMember,
  Message as MessageType,
} from "../../types";

type OnlineUserEntry = { id: string; username?: string | null };

const extractMemberId = (
  member?: ConversationMember | string | null
): string | null => {
  if (!member) return null;
  if (typeof member === "string") return member;
  return member._id || null;
};

const formatParticipantLabel = (
  member?: ConversationMember | string | null
): string => {
  if (!member) return "Unknown user";
  const name = typeof member === "object" ? member.username : undefined;
  const id = extractMemberId(member);
  return formatUserLabel(id, name || undefined);
};

const buildConversationTitle = (
  conversation: Conversation | undefined,
  currentUserId: string | null
): string => {
  if (!conversation) return "Select a conversation";
  const others =
    conversation.members?.filter((member) => {
      const id = extractMemberId(member);
      return id && id !== currentUserId;
    }) || [];
  if (!others.length) return "Direct message";
  return others.map((member) => formatParticipantLabel(member)).join(", ");
};

const buildConversationSubtitle = (
  conversation: Conversation | undefined
): string => {
  if (!conversation) return "";
  if (conversation.members?.length > 2) {
    return `${conversation.members.length} participants`;
  }
  return "Direct message";
};

type SendMessagePayload = {
  text?: string;
  imageUrl?: string;
};

type SocketMessagePayload = {
  _id?: string;
  conversationId: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  createdAt?: string;
};

const Messenger = () => {
  const { currentUser, dispatch } = useContext(AuthContext);
  const userId = currentUser?._id ?? null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserEntry[]>([]);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const activeConversationRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((item) => item._id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  const participantNameMap = useMemo(() => {
    const map = new Map<string, string>();
    conversations.forEach((conversation) => {
      conversation.members?.forEach((member) => {
        const id = extractMemberId(member);
        if (
          id &&
          typeof member === "object" &&
          member.username &&
          !map.has(id)
        ) {
          map.set(id, member.username);
        }
      });
    });
    return map;
  }, [conversations]);

  useEffect(() => {
    activeConversationRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId && conversations.length) {
      setSelectedConversationId(conversations[0]._id);
    }
  }, [conversations, selectedConversationId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;
    socket.emit("join", { userId, username: currentUser?.username });

    socket.on("users:online", (online: Array<OnlineUserEntry | string> = []) => {
      const normalized = online
        .map((entry) => {
          if (typeof entry === "string") {
            return { id: entry, username: null };
          }
          return {
            id: entry.id || (entry as { userId?: string }).userId || "",
            username: entry.username || null,
          };
        })
        .filter((entry) => entry.id && entry.id !== userId);
      setOnlineUsers(normalized);
    });

    socket.on("receiveMessage", (payload: SocketMessagePayload) => {
      const normalizedMessage: MessageType = {
        _id: payload._id || `socket-${Date.now()}`,
        conversationId: payload.conversationId,
        sender: payload.senderId,
        text: payload.text,
        imageUrl: payload.imageUrl,
        createdAt: payload.createdAt || new Date().toISOString(),
      };

      if (activeConversationRef.current === payload.conversationId) {
        setMessages((prev) => [...prev, normalizedMessage]);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, currentUser?.username]);

  const loadConversations = useCallback(async () => {
    if (!userId) {
      return;
    }

    setConversationsLoading(true);
    try {
      const res = await messengerServices.fetchConversations();
      setConversations(res.data || []);
    } catch {
      setStatusMessage("Unable to load conversations right now.");
    } finally {
      setConversationsLoading(false);
    }
  }, [userId]);

  const loadMessages = useCallback(async (conversationId: string | null) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);
    try {
      const res = await messengerServices.fetchMessages(conversationId);
      setMessages(res.data || []);
    } catch {
      setStatusMessage("Unable to load messages.");
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    loadMessages(selectedConversationId);
  }, [selectedConversationId, loadMessages]);

  const findConversationWithUser = useCallback(
    (targetId: string) =>
      conversations.find((conversation) => {
        if (!conversation.members?.length) return false;
        const memberIds = conversation.members
          .map((member) => extractMemberId(member))
          .filter(Boolean);
        return memberIds.includes(userId) && memberIds.includes(targetId);
      }) || null,
    [conversations, userId]
  );

  const selectOrCreateConversation = useCallback(
    async (targetUserId: string) => {
      const trimmedId = targetUserId?.trim();
      if (!trimmedId || !userId) {
        return;
      }
      if (trimmedId === userId) {
        setStatusMessage("You cannot start a conversation with yourself.");
        return;
      }

      setStatusMessage("");

      const existing = findConversationWithUser(trimmedId);
      if (existing?._id) {
        setSelectedConversationId(existing._id);
        return;
      }

      setBusyUserId(trimmedId);

      try {
        const res = await messengerServices.createConversation(trimmedId);
        const newConversation = res.data;

        setConversations((prev) => {
          const exists = prev.some((item) => item._id === newConversation._id);
          if (exists) {
            return prev.map((item) =>
              item._id === newConversation._id ? newConversation : item
            );
          }
          return [newConversation, ...prev];
        });

        setSelectedConversationId(newConversation._id);
      } catch (error) {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          "Unable to start a conversation with that user.";
        setStatusMessage(message);
      } finally {
        setBusyUserId(null);
      }
    },
    [findConversationWithUser, userId]
  );

  const sendMessagePayload = async ({ text, imageUrl }: SendMessagePayload) => {
    if (!activeConversation || !userId) return;
    const receiverMember = activeConversation.members.find((member) => {
      const id = extractMemberId(member);
      return id && id !== userId;
    });
    const receiverId = extractMemberId(receiverMember);

    const payload = {
      conversationId: activeConversation._id,
      ...(text ? { text } : {}),
      ...(imageUrl ? { imageUrl } : {}),
    };

    const res = await messengerServices.sendMessage(payload);
    setMessages((prev) => [...prev, res.data]);

    if (receiverId && socketRef.current) {
      socketRef.current.emit("sendMessage", {
        conversationId: activeConversation._id,
        senderId: userId,
        receiverId,
        text: text || "",
        imageUrl: imageUrl || null,
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || !userId) {
      return;
    }

    const text = messageInput.trim();
    setStatusMessage("");

    try {
      await sendMessagePayload({ text });
      setMessageInput("");
    } catch {
      setStatusMessage("Unable to send message. Please try again.");
    }
  };

  const handleUploadImage = async (file: File | null) => {
    if (!file || !activeConversation || !userId) return;
    setUploading(true);
    setStatusMessage("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await messengerServices.uploadImage(formData);
      const imageUrl = res.data.image?.url;
      if (imageUrl) {
        await sendMessagePayload({ imageUrl });
      }
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Unable to upload image.";
      setStatusMessage(message);
      throw new Error(message);
    } finally {
      setUploading(false);
    }
  };

  const renderOnlineUsers = useCallback(
    (emptyMessage: string) => {
      if (!onlineUsers.length) {
        return <div className="text-sm text-gray-500">{emptyMessage}</div>;
      }

      return onlineUsers.map((user) => {
        const id = user.id;
        const name = user.username;
        return (
          <OnlineUser
            key={id}
            userId={id}
            name={name || participantNameMap.get(id)}
            isBusy={busyUserId === id}
            onStartConversation={() => selectOrCreateConversation(id)}
          />
        );
      });
    },
    [onlineUsers, participantNameMap, busyUserId, selectOrCreateConversation]
  );

  const conversationLabel = buildConversationTitle(activeConversation, userId);

  return (
    <>
      <div className="min-h-screen bg-[#f8fafc]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-0.5 sm:py-1 md:px-5 lg:max-w-7xl">
          <main className="grid flex-1 min-h-[calc(100vh-12px)] grid-cols-1 items-stretch gap-3 lg:gap-5 md:grid-cols-[320px_1fr] lg:grid-cols-[340px_1fr_240px]">
            <section className="flex h-full min-h-[440px] flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:h-[calc(100vh-54px)] md:overflow-hidden">
              <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3 py-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-blue-500">
                    Kotha Messenger
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {currentUser?.username}
                  </p>
                </div>
                <button
                  className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
                  onClick={() => dispatch({ type: "LOGOUT" })}
                >
                  Logout
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Conversations
                  </p>
                  <p className="text-sm text-slate-500">
                    {conversations.length || 0} active
                  </p>
                </div>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                {conversationsLoading ? (
                  <div className="text-sm text-slate-500">
                    Loading conversations...
                  </div>
                ) : conversations.length ? (
                  conversations.map((item) => {
                    const title = buildConversationTitle(item, userId);
                    const subtitle = buildConversationSubtitle(item);
                    return (
                      <Conversations
                        key={item._id}
                        conversation={item}
                        title={title}
                        subtitle={subtitle}
                        isActive={item._id === selectedConversationId}
                        onSelect={() => {
                          setSelectedConversationId(item._id);
                          setStatusMessage("");
                        }}
                      />
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-500">
                    No conversations yet. Start one from your online friends.
                  </div>
                )}
              </div>
              <div className="space-y-3 lg:hidden">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Online Users
                </p>
                <div className="space-y-3">
                  {renderOnlineUsers("No friends online right now.")}
                </div>
              </div>
            </section>

            <section className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:h-[calc(100vh-54px)] md:overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Chatting with
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {conversationLabel}
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto py-4 pr-1">
                {messagesLoading ? (
                  <div className="text-center text-sm text-slate-500">
                    Loading messages...
                  </div>
                ) : messages.length ? (
                  messages.map((message) => (
                    <MessageBubble
                      key={message._id || `${message.sender}-${message.createdAt}`}
                      message={message}
                      own={message.sender === userId}
                    />
                  ))
                ) : (
                  <div className="text-center text-sm text-slate-500">
                    Select a conversation to start chatting.
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="mt-auto space-y-3 border-t border-slate-100 pt-3">
                {statusMessage && (
                  <div className="rounded border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {statusMessage}
                  </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <textarea
                    className="h-24 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-400 focus:outline-none"
                    placeholder={
                      activeConversation
                        ? "Type a message..."
                        : "Select a conversation to start chatting"
                    }
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={!activeConversation}
                  />
                  <button
                    className="flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                    onClick={handleSendMessage}
                    disabled={!activeConversation || !messageInput.trim()}
                  >
                    Send
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="text-xs font-semibold text-blue-600 underline-offset-2 hover:underline"
                    disabled={!activeConversation}
                  >
                    Attach image
                  </button>
                </div>
              </div>
            </section>

            <aside className="hidden h-full flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:flex md:h-[calc(100vh-54px)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Online Users
              </p>
              <div className="space-y-3 overflow-y-auto">
                {renderOnlineUsers("No friends online right now.")}
              </div>
            </aside>
          </main>
        </div>
      </div>
      <UploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      >
        <ImageUpload onUpload={handleUploadImage} isUploading={uploading} />
      </UploadModal>
    </>
  );
};

export default Messenger;

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const UploadModal = ({ open, onClose, children }: UploadModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between border-b pb-2">
          <p className="text-sm font-semibold text-slate-800">Attach image</p>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Close
          </button>
        </div>
        <div className="pt-3">{children}</div>
      </div>
    </div>
  );
};
