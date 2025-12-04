import React from "react";

type Receiver = {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
};

interface MessageComposerProps {
  receiverList: Receiver[];
  selectedReceiverEmail: string;
  messageText: string;
  sending?: boolean;

  onClose: () => void;
  onSend: () => void;
  onReceiverChange: (email: string) => void;
  onMessageChange: (text: string) => void;

  /** Optional UI tweaks */
  subjectLabel?: string;
  showReceiverSelector?: boolean;
  showBorderTop?: boolean;
  sendLabel?: string;
  closeLabel?: string;
  error?: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  receiverList,
  selectedReceiverEmail,
  messageText,
  showReceiverSelector = true,
  sending = false,
  onClose,
  onSend,
  onReceiverChange,
  onMessageChange,
  showBorderTop = true,
  sendLabel = "Send",
  closeLabel = "Close",
  error = "",
}) => {
  const containerBorderClass = showBorderTop ? "border-t border-slate-200" : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sending && messageText.trim()) {
      onSend();
    }
  };

  return (
    <div className={containerBorderClass}>
      <div className="px-1 py-1 flex flex-col gap-2 sm:flex-row sm:items-end">
        {error}
        <div className="flex-1 w-full space-y-2">
          {/* Receiver select */}
          {showReceiverSelector && (
            <select
              name="selectedReceiverEmail"
              value={selectedReceiverEmail}
              onChange={(e) => onReceiverChange(e.target.value)}
              className="w-full my-1 rounded-sm border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select receiver...</option>

              {receiverList.map((receiver) => (
                <option key={receiver.id} value={receiver.email}>
                  {receiver.firstName} {receiver.lastName} • {receiver.email}
                </option>
              ))}
            </select>
          )}

          {/* Message textarea */}
          <textarea
            value={messageText}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={2}
            placeholder="Type your message..."
            className="text-sm w-full rounded-sm border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-slate-50/60"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-1 py-1 text-xs sm:text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {closeLabel}
          </button>
          <button
            onClick={handleSubmit}
            type="submit"
            disabled={sending || !messageText.trim() || !selectedReceiverEmail}
            className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <>
                <span className="mr-2 inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              sendLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageComposer;
