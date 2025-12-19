import { formatUserLabel } from "../../utils/userLabel";

interface OnlineUserProps {
  userId: string;
  name?: string | null;
  onStartConversation: () => void;
  isBusy?: boolean;
}

const OnlineUser = ({
  userId,
  name,
  onStartConversation,
  isBusy = false,
}: OnlineUserProps) => {
  const displayName = formatUserLabel(userId, name || undefined);

  return (
    <button
      onClick={onStartConversation}
      disabled={isBusy}
      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-sm transition hover:border-blue-200 hover:bg-blue-50/60 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">
          {isBusy ? "Connecting..." : displayName}
        </p>
        <p className="truncate text-xs text-slate-500">{userId}</p>
      </div>
      <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-inner shadow-white" />
    </button>
  );
};

export default OnlineUser;
