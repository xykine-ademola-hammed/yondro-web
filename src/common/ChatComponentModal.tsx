import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { getMutationMethod } from "./api-methods";
import type { EmailReceiver } from "./SendEmail";
import MessageComposer from "./MessageComposer";

export interface ChatSender {
  id: number | string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface ChatMessage {
  id: number | string;
  body: string;
  sender: ChatSender;
  createdAt?: string | Date;
}

interface ChatComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: number;
  entityId?: number;
  onSend: () => Promise<void> | void;
  title?: string;
  isSending?: boolean;
  entityType?: string;
}

const ChatComponentModal: React.FC<ChatComponentModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  entityId,
  entityType = "REQUEST",
  onSend,
  title = "Conversation",
}) => {
  const [messageText, setMessageText] = useState("");
  const [selectedReceiverEmail, setSelectedReceiverEmail] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<
    number | undefined
  >(undefined);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [receiverList, setReceiverList] = useState<EmailReceiver[]>([]);
  const [error, setError] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  console.log(isSending);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const { mutateAsync: fetchMessages } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod("POST", `api/messages/by-entity-id`, body, true),
    onSuccess: (data) => {
      setMessages(data.item);
    },
    onError: (err) => console.error("Failed to fetch workflow requests:", err),
  });

  const { mutateAsync: sendMessage } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod("POST", `api/messages`, body, true),
    onSuccess: (_data) => {},
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

  useEffect(() => {
    if (entityId) fetchMessages({ entityId });
  }, [entityId]);

  if (!isOpen) return null;

  const formatTime = (value?: string | Date) => {
    if (!value) return "";
    const d = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleDoneSendingMessage = (refreshMessage = true) => {
    setMessageText("");
    setSelectedReceiverEmail("");
    setIsReplying(false);
    setIsSending(false);
    if (refreshMessage) fetchMessages({ entityId });
    onSend();
    if (!isReplying) {
      onClose();
    }
  };

  const handleSendMessage = async () => {
    setError("");

    if (!selectedReceiverEmail) {
      setError("Please select at least one recipient.");
      return;
    }

    if (!messageText.trim()) {
      setError("Message body is required.");
      return;
    }

    try {
      setIsSending(true);

      const selectedReceiver = receiverList.find(
        (rec) => selectedReceiverEmail === rec.email
      );

      const payload: any = {
        receipientIds: [selectedReceiver?.id],
        receipientEmails: [selectedReceiverEmail],
        subject: title,
        entityId,
        entityType,
        message: messageText,
      };

      if (isReplying) {
        payload["parentMessageId"] = selectedMessageId;
      }

      await sendMessage(payload);

      handleDoneSendingMessage();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-3"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 tracking-wide">
              {title}
            </h2>
            <p className="text-xs text-slate-500">
              {messages.length} message{messages.length === 1 ? "" : "s"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Close conversation"
          >
            <span className="text-lg leading-none">&times;</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 bg-slate-50/60">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No messages yet. Start the conversation below.
            </div>
          )}

          <div className="space-y-3">
            {messages.map((msg, _index) => {
              const isMe = String(msg.sender.id) === String(currentUserId);

              return (
                <div
                  key={msg.id}
                  className={`flex w-full ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm border text-xs sm:text-sm
                      ${
                        isMe
                          ? "bg-indigo-600 text-white border-indigo-500 rounded-tr-sm"
                          : "bg-white text-slate-900 border-slate-200 rounded-tl-sm"
                      }`}
                  >
                    {/* Sender / Meta */}
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span
                        className={`font-semibold text-[11px] uppercase tracking-wide ${
                          isMe ? "text-indigo-100" : "text-slate-500"
                        }`}
                      >
                        {isMe
                          ? "You"
                          : `${msg.sender.firstName} ${msg.sender.lastName}` ||
                            "Unknown"}
                      </span>
                      <span
                        className={`text-[10px] ${
                          isMe ? "text-indigo-100/70" : "text-slate-400"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>

                    {/* Body */}
                    <p className="whitespace-pre-wrap leading-snug">
                      {msg.body}
                    </p>

                    {!isMe && (
                      <>
                        {!(
                          isReplying &&
                          selectedReceiverEmail === msg.sender.email
                        ) && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsReplying(true);
                              setSelectedReceiverEmail(msg.sender.email ?? "");
                              setSelectedMessageId(Number(msg.id));
                            }}
                            className="px-2 py-1 text-xs sm:text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            Reply
                          </button>
                        )}

                        {isReplying &&
                          selectedReceiverEmail === msg.sender.email &&
                          selectedMessageId === msg.id && (
                            <MessageComposer
                              showReceiverSelector={false}
                              receiverList={receiverList}
                              selectedReceiverEmail={selectedReceiverEmail}
                              onReceiverChange={(email) =>
                                setSelectedReceiverEmail(email)
                              }
                              messageText={messageText}
                              onMessageChange={(message) =>
                                setMessageText(message)
                              }
                              // sending
                              onClose={() => {
                                handleDoneSendingMessage(false);
                              }}
                              onSend={() => {
                                handleSendMessage();
                              }}
                            />
                          )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Composer */}
        {!isReplying && (
          <MessageComposer
            receiverList={receiverList}
            selectedReceiverEmail={selectedReceiverEmail}
            onReceiverChange={(email) => setSelectedReceiverEmail(email)}
            messageText={messageText}
            onMessageChange={(message) => setMessageText(message)}
            // sending
            onClose={() => handleDoneSendingMessage(false)}
            onSend={() => {
              handleSendMessage();
            }}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

export default ChatComponentModal;
