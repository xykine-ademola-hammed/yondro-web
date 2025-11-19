import { useEffect, useState } from "react";
import type { WorkflowRequest } from "../../common/types";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export interface CommentItem {
  comment: string;
  commentor: {
    name: string;
  };
  isPriority: boolean;
  timestamp?: string; // Optional for future enhancement
}

export default function CommentsPreview({
  request,
  parentRequest,
}: {
  request: WorkflowRequest | undefined;
  parentRequest: WorkflowRequest | undefined;
}) {
  const [priorityComments, setPriorityComments] = useState<CommentItem[]>([]);
  const [otherComments, setOtherComments] = useState<CommentItem[]>([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!request) {
      setPriorityComments([]);
      setOtherComments([]);
      return;
    }

    const stageInstances = request.stages ?? [];
    const workflowStages = request.workflow?.stages ?? [];

    const parentStageInstances = parentRequest?.stages ?? [];
    const parentWorkflowStages = parentRequest?.workflow?.stages ?? [];

    const priorityIds = new Set(
      [...workflowStages, ...parentWorkflowStages]
        .filter((stage) => stage.isPriorityComment)
        .map((s) => s.id)
    );

    const priority: CommentItem[] = [];
    const others: CommentItem[] = [];

    [...stageInstances, ...parentStageInstances].forEach((inst) => {
      if (!inst.comment?.trim()) return; // Skip empty comments

      const fullName =
        `${inst.assignedTo?.firstName ?? ""} ${
          inst.assignedTo?.lastName ?? ""
        }`.trim() || "Anonymous";

      const commentObj: CommentItem = {
        comment: inst.comment,
        commentor: {
          name: fullName,
        },
        isPriority: priorityIds.has(inst.stageId),
      };

      if (commentObj.isPriority) {
        priority.push(commentObj);
      } else {
        others.push(commentObj);
      }
    });

    setPriorityComments(priority);
    setOtherComments(others);
  }, [request, parentRequest]);

  const hasComments = priorityComments.length > 0 || otherComments.length > 0;

  if (!hasComments) {
    return null; // Hide component if no comments
  }

  const totalOtherCount = otherComments.length;
  const visibleOtherComments = showMore ? otherComments : [];

  const toggleShowMore = () => setShowMore((prev) => !prev);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6"
      aria-label="Workflow comments preview"
    >
      {/* Priority Comments Section */}
      {priorityComments.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Important comment(s)
            </span>
          </div>
          <div className="space-y-4">
            {priorityComments.map((item, index) => (
              <article
                key={item.comment + index}
                className="group flex gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-sm uppercase">
                  {getInitials(item.commentor.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                    {item.commentor.name}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {item.comment}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Other Comments Section */}
      {otherComments.length > 0 && (
        <div>
          {visibleOtherComments.length > 0 ? (
            <div className="space-y-4 mb-4">
              {visibleOtherComments.map((item, index) => (
                <article
                  key={item.comment + index}
                  className="flex gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors duration-150"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-medium text-xs uppercase">
                    {getInitials(item.commentor.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                      {item.commentor.name}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {item.comment}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          <button
            onClick={toggleShowMore}
            className={`flex items-center gap-1 text-sm font-medium transition-all duration-200 ${
              showMore
                ? "text-gray-600 hover:text-gray-800"
                : "text-indigo-600 hover:text-indigo-800"
            }`}
            aria-expanded={showMore}
            aria-controls="other-comments"
          >
            {showMore ? (
              <>
                Hide comments
                <ChevronUpIcon className="w-4 h-4" />
              </>
            ) : (
              <>
                See +{totalOtherCount} comments
                <ChevronDownIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
