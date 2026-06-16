import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMutationMethod, getQueryMethod } from "../common/api-methods";
import { useAuth } from "../GlobalContexts/AuthContext";
import { Loader2 } from "lucide-react";
import ChatComponentModal from "../common/ChatComponentModal";

interface Message {
  id: number;
  entityId?: number;
  content: string;
  createdAt: string;
  senderFirstName?: string;
  senderLastName?: string;
  senderPhotoUrl?: string | null;
  name: string;
}

const MyMessagesList: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [openChatModal, setOpenChatModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const { mutateAsync: markAsRead } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod(
        "PUT",
        `api/messages/mark-as-read/${body.id}`,
        body,
        true
      ),
    onSuccess: (_data) => {
      refetchMyMessages();
    },
    onError: (err) => console.error("Failed to fetch workflow requests:", err),
  });

  const {
    data: myMessages,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: refetchMyMessages,
  } = useQuery({
    queryKey: ["my-messages"],
    queryFn: () =>
      getQueryMethod(`api/messages/my-messages?page=${page}&limit=${10}`),
    enabled: !!user?.id,
  });

  // Merge pages into one list
  useEffect(() => {
    if (!myMessages) return;

    setAllMessages((prev) => {
      if (page === 1) {
        // First page – replace list
        return myMessages.items;
      }

      // Append new page, avoiding duplicates by id or entityId
      const existingIds = new Set(prev.map((m) => m.id));
      const newOnes = myMessages.items.filter(
        (m: Message) => !existingIds.has(m.id)
      );

      return [...prev, ...newOnes];
    });
  }, [myMessages, page]);

  const handleShowMore = () => {
    if (!myMessages) return;
    if (page < myMessages.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handleRefresh = () => {
    // Reset to first page and re-fetch
    setPage(1);
    setAllMessages([]);
    refetchMyMessages();
  };

  const isEmpty = !isLoading && allMessages.length === 0;
  const canShowMore = myMessages && page < myMessages.totalPages;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-end mb-4">
        <button
          type="button"
          onClick={handleRefresh}
          className="text-xs px-3 py-1 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-3 mb-3 rounded-md bg-red-50 text-red-700 text-sm">
          {(error as Error)?.message || "Failed to load messages."}
        </div>
      )}

      {/* List */}
      <div className="space-y-3 flex-1 overflow-auto">
        {isLoading && allMessages.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-slate-500 text-sm gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading messages...
          </div>
        ) : isEmpty ? (
          <div className="flex items-center justify-center py-10 text-slate-400 text-sm">
            No messages yet.
          </div>
        ) : (
          allMessages.map((msg) => (
            <div
              onClick={() => {
                markAsRead(msg);
                setSelectedMessage(msg);
                setOpenChatModal(true);
              }}
              key={msg.id}
              className=" items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mt-1">
                <div>{msg.name}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {msg.senderFirstName && msg.senderLastName
                      ? `${msg.senderFirstName} ${msg.senderLastName}`
                      : "Unknown Sender"}
                  </p>
                  <p className="text-xs text-slate-400 whitespace-nowrap ml-2">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-slate-700 line-clamp-2">
                  {msg.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer: Show More */}
      <div className="mt-4 flex justify-center">
        {canShowMore && (
          <button
            type="button"
            onClick={handleShowMore}
            disabled={isFetching}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isFetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Show More"
            )}
          </button>
        )}
        {!canShowMore && !isLoading && allMessages.length > 0 && (
          <p className="text-xs text-slate-400">
            You&apos;ve reached the end of your messages.
          </p>
        )}
      </div>

      {openChatModal && (
        <ChatComponentModal
          isOpen={openChatModal}
          onClose={() => setOpenChatModal(false)}
          entityId={selectedMessage?.entityId}
          currentUserId={user?.id}
          title={selectedMessage?.name}
          isSending={false}
          onSend={() => {}}
        />
      )}
    </div>
  );
};

export default MyMessagesList;
