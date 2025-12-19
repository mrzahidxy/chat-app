import type { Conversation } from "../../types";

interface ConversationsProps {
  conversation: Conversation;
  title: string;
  subtitle?: string;
  isActive: boolean;
  onSelect: () => void;
}

const Conversations = ({
  conversation,
  title,
  subtitle,
  isActive,
  onSelect,
}: ConversationsProps) => {
  const formattedDate = conversation?.updatedAt
    ? new Date(conversation.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition focus-visible:outline focus-visible:outline-1 focus-visible:outline-blue-500 ${
        isActive
          ? "border-blue-200 bg-blue-50 shadow-sm"
          : "border-slate-200 bg-slate-50 hover:border-blue-200"
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-sm font-medium text-slate-800">
          {title}
        </span>
        <span className="whitespace-nowrap text-xs text-slate-500">
          {formattedDate}
        </span>
      </div>
      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{subtitle}</p>
    </button>
  );
};

export default Conversations;
