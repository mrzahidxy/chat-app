import type { Message as MessageType } from "../../types";

interface MessageProps {
  message: MessageType;
  own: boolean;
}

const Message = ({ message, own }: MessageProps) => {
  const createdAt = message?.createdAt ? new Date(message.createdAt) : null;
  const formattedDateTime =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Just now";

  return (
    <div className={`flex pt-1 ${own ? "justify-end" : "justify-start"}`}>
      <div className="flex max-w-[85%] flex-col gap-1">
        {message?.imageUrl ? (
          <div
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
              own ? "border-blue-100" : "border-slate-200"
            }`}
          >
            <img
              src={message.imageUrl}
              alt="sent attachment"
              className="max-h-64 w-full max-w-[280px] object-cover"
            />
            {message?.text ? (
              <p className="px-3 py-1.5 text-sm text-slate-700">
                {message.text}
              </p>
            ) : null}
          </div>
        ) : (
          <span
            className={`rounded-2xl px-3 py-1.5 text-sm leading-snug shadow ${
              own
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-800 border border-slate-200"
            }`}
          >
            {message?.text}
          </span>
        )}
        <span
          className={`text-xs ${
            own ? "text-right text-blue-500/80" : "text-slate-400"
          }`}
        >
          {formattedDateTime}
        </span>
      </div>
    </div>
  );
};

export default Message;
