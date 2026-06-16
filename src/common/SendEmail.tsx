import { useMutation } from "@tanstack/react-query";
import { MailOpen } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { getMutationMethod } from "./api-methods";
import { useToast } from "../GlobalContexts/ToastContext";

export type EmailReceiver = {
  email: string;
  firstName: string;
  lastName: string;
  id: number;
};

interface SendEmailOptions {
  defaultSubject: string | null;
  entityId?: number | string;
  entityType?: string;
  incomingReceiver?: EmailReceiver[];
  buttonLabel?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onClose: () => void;
}

export function SendEmailModal({
  defaultSubject,
  entityId,
  entityType,
  onClose,
  onSuccess,
  onError,
}: SendEmailOptions) {
  const [subject, setSubject] = useState(`RE: ${defaultSubject}`);
  const [message, setMessage] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [receiverList, setReceiverList] = useState<EmailReceiver[]>([]);

  const allEmails = useMemo(
    () => receiverList.map((r) => r.email),
    [receiverList]
  );

  const toggleEmailSelection = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const toggleSelectAll = () => {
    setSelectedEmails((prev) =>
      prev.length === allEmails.length ? [] : allEmails
    );
  };

  const resetForm = () => {
    setSubject("");
    setMessage("");
    setSelectedEmails([]);
    setError(null);
  };

  const { mutateAsync: sendMessage } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod("POST", `api/messages`, body, true),
    onSuccess: (_data) => {
      showToast("Message sent successfully", "success");
    },
    onError: (err) => console.error("Failed to fetch workflow requests:", err),
  });

  const { mutateAsync: fetchRequestReceivers } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod("POST", `api/employees/receivers`, body, true),
    onSuccess: (data) => {
      setReceiverList(data.map((d: any) => d.assignedTo));
    },
    onError: (err) => console.error("Failed to fetch workflow requests:", err),
  });

  useEffect(() => {
    if (entityId) {
      if (entityType === "REQUEST") {
        fetchRequestReceivers({
          entityId,
          entityType,
        });
      }
    }
  }, [entityId, entityType]);

  const handleSubmit = async () => {
    setError(null);

    if (!subject?.trim()) {
      setError("Subject is required.");
      return;
    }

    if (selectedEmails.length === 0) {
      setError("Please select at least one recipient.");
      return;
    }

    if (!message.trim()) {
      setError("Message body is required.");
      return;
    }

    try {
      setIsSending(true);

      await sendMessage({
        receipientIds: receiverList
          .filter((rec) => selectedEmails.includes(rec.email))
          .map((receiver) => receiver.id),
        receipientEmails: selectedEmails,
        subject,
        entityId,
        entityType,
        message,
      });

      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send email. Please try again.");
      if (onError) onError(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
              <MailOpen />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">
              Compose Message
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-4 text-sm">
          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              <i className="ri-error-warning-line mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject */}
          {/* <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Subject
            </label>
            <input
              type="text"
              value={subject ?? ""}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div> */}

          {/* To: multi-select */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-600">
                To
              </label>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-[11px] font-medium text-indigo-600 hover:underline"
              >
                {selectedEmails.length === allEmails.length
                  ? "Clear all"
                  : "Select all"}
              </button>
            </div>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 px-3 py-2">
              {receiverList.length === 0 && (
                <p className="text-xs text-slate-400">No recipients found.</p>
              )}
              {receiverList.map((receiver) => {
                const checked = selectedEmails.includes(receiver.email);
                return (
                  <label
                    key={receiver.email}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-xs hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={checked}
                      onChange={() => toggleEmailSelection(receiver.email)}
                    />
                    <span className="flex-1">
                      <span className="font-medium text-slate-800">
                        {receiver.firstName}
                        {receiver.lastName}
                      </span>
                      <span className="ml-1 text-[11px] text-slate-500">
                        {"<"}
                        {receiver.email}
                        {">"}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Type your message here..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            disabled={isSending}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSending}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSending ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <i className="ri-send-plane-line text-sm" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
