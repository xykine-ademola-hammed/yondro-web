import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FaEdit, FaTrashAlt, FaEye, FaPaperclip } from "react-icons/fa";

export type FileLike = File | string | undefined;

type FileUploadProps = {
  label?: string;
  value: FileLike; // File object or remote URL
  onChange: (file: File | null) => void; // set new file or clear (null)
  disabled?: boolean;
  accept?: string; // e.g. ".pdf,.doc,.docx,.xls,.xlsx"
  hint?: string; // helper text under the control
  error?: string | boolean; // string shows message; boolean just styles red
  className?: string; // outer container class
};

function getFileURL(value: FileLike): string | undefined {
  if (!value) return;
  if (typeof value === "string") return value;
  return URL.createObjectURL(value); // revoked in effect below
}

function getFileName(value: FileLike): string | undefined {
  if (!value) return;
  return typeof value === "string"
    ? value.split("/").pop() || value
    : value.name;
}

function getFileSize(value: FileLike): string | undefined {
  if (value && typeof value !== "string") {
    const bytes = value.size ?? 0;
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.min(
      units.length - 1,
      Math.floor(Math.log(bytes || 1) / Math.log(1024))
    );
    const val = bytes / Math.pow(1024, i);
    return `${val < 10 ? val.toFixed(1) : Math.round(val)} ${units[i]}`;
  }
}

export default function FileUpload({
  label = "Attachment",
  value,
  onChange,
  disabled = false,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg",
  hint,
  error,
  className = "",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const controlId = useId();

  const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined);

  // Build a stable view URL & clean up object URLs for local Files
  const viewUrl = useMemo(() => getFileURL(value), [value]);
  useEffect(() => {
    if (value instanceof File) {
      const u = URL.createObjectURL(value);
      setObjectUrl(u);
      return () => URL.revokeObjectURL(u);
    } else {
      setObjectUrl(undefined);
    }
  }, [value]);

  const hasError = Boolean(error);
  const fileName = getFileName(value);
  const fileSize = getFileSize(value);

  const openPicker = () => !disabled && inputRef.current?.click();

  const baseBorder = hasError
    ? "border-red-500"
    : "border-gray-200 dark:border-gray-700";
  const baseRing = hasError
    ? "focus:ring-red-500/30"
    : "focus:ring-indigo-500/30";

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      <label
        htmlFor={controlId}
        className="block mb-1.5 text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        {label}
      </label>

      {/* Container */}
      <div
        className={[
          "flex items-center justify-between gap-3 px-3 py-2 rounded-xl border bg-white dark:bg-gray-900",
          "transition-shadow focus-within:outline-none focus-within:ring-4",
          baseBorder,
          baseRing,
          disabled ? "opacity-70 cursor-not-allowed" : "cursor-default",
        ].join(" ")}
      >
        {/* Left: status + name */}
        <div className="min-w-0 flex items-center gap-3">
          <div
            className={[
              "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
              value
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
            ].join(" ")}
          >
            {value ? "Uploaded" : "No file"}
          </div>

          <div className="min-w-0">
            {value ? (
              <>
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {fileName || "File"}
                </p>
                {fileSize && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {fileSize}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Attach a file to get started
              </p>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Hidden input */}
          <input
            id={controlId}
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled}
            onChange={(e) => onChange(e.target.files?.[0] || null)}
          />

          {/* View */}
          {value && (objectUrl || viewUrl) && (
            <a
              href={objectUrl || viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View"
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <FaEye aria-hidden />
              <span className="sr-only">View file</span>
            </a>
          )}

          {/* Replace / Attach */}
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-indigo-50 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60"
            title={value ? "Replace file" : "Attach file"}
          >
            {value ? <FaEdit aria-hidden /> : <FaPaperclip aria-hidden />}
            <span className="text-sm">{value ? "Replace" : "Attach"}</span>
          </button>

          {/* Delete */}
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-60"
              title="Remove file"
            >
              <FaTrashAlt aria-hidden />
              <span className="sr-only">Remove file</span>
            </button>
          )}
        </div>
      </div>

      {/* Hint / Error */}
      {hint && !hasError && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
      {hasError && (
        <p className="mt-1.5 text-xs text-red-600">
          {typeof error === "string" ? error : "Please attach a valid file."}
        </p>
      )}
    </div>
  );
}
