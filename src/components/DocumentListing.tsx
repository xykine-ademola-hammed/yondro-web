import React, { type MouseEvent } from "react";
import type { Document } from "./UploadDocument";

interface DocumentListingProps {
  documents: Document[];
  currentUserId?: number;
  mode?: "view" | "edit" | "preview" | "new" | "in_progress";
  onDelete?: (index: number) => void;
  onDownload?: (doc: Document, e: MouseEvent<HTMLButtonElement>) => void;
}

const fallbackDownload = (doc: Document, e: MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  const url = doc.url || doc.previewUrl;
  if (!url) return;
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.name || "document";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const DocumentListing: React.FC<DocumentListingProps> = ({
  documents,
  currentUserId,
  mode = "edit",
  onDelete,
  onDownload,
}) => {
  if (!documents?.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
        <p className="text-sm text-gray-500">No documents available.</p>
      </div>
    );
  }

  const canEdit = (doc: Document) =>
    mode !== "view" && !!currentUserId && doc.createdBy === currentUserId;

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {documents.map((doc, index) => (
        <li
          key={doc.id ?? `${doc.name}-${index}`}
          className="group rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm transition hover:shadow"
        >
          {/* Left: file icon + name */}
          <div className="min-w-0 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-gray-400 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16c0 1.1.9 2 2 2h12a2 2 0 002-2V8l-6-6zM14 3.5L18.5 8H14V3.5z" />
            </svg>
            <span
              className="truncate text-sm font-medium text-gray-800"
              title={doc.name}
            >
              {doc.name}
            </span>
          </div>

          {/* Right: action icons */}
          <div className="flex justify-end items-center gap-1">
            {(doc.file || doc.url) && (
              <button
                type="button"
                onClick={(e) =>
                  onDownload ? onDownload(doc, e) : fallbackDownload(doc, e)
                }
                className="inline-flex items-center justify-center rounded-full p-2 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Download ${doc.name}`}
                title="Download"
              >
                {/* Download icon */}
                <svg
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 3a1 1 0 011 1v8.59l2.3-2.3a1 1 0 111.4 1.42l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.42L11 12.6V4a1 1 0 011-1z" />
                  <path d="M5 20a2 2 0 01-2-2v-2a1 1 0 112 0v2h14v-2a1 1 0 112 0v2a2 2 0 01-2 2H5z" />
                </svg>
              </button>
            )}

            {canEdit(doc) && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(index)}
                className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Delete ${doc.name}`}
                title="Delete"
              >
                {/* Trash icon */}
                <svg
                  className="h-5 w-5 text-gray-700"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M9 3a1 1 0 00-1 1v1H5a1 1 0 100 2h14a1 1 0 100-2h-3V4a1 1 0 00-1-1H9zM7 9a1 1 0 012 0v8a1 1 0 11-2 0V9zm4 0a1 1 0 012 0v8a1 1 0 11-2 0V9zm4 0a1 1 0 012 0v8a1 1 0 11-2 0V9z" />
                </svg>
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default DocumentListing;
