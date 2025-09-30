import { useRef } from "react";
import { FaEdit, FaTrashAlt, FaEye, FaPaperclip } from "react-icons/fa";

type FormResponses = {
  deliveryUrl?: File | string;
  invoiceUrl?: File | string;
  awardLetter?: File | string;
  // other fields if needed...
};

// Helper for getting file URL for viewing
function getFileURL(value: File | string | undefined): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") {
    return value; // Assume remote URL
  } else if (value instanceof File) {
    return URL.createObjectURL(value);
  }
}

function FileUploadRow({
  label,
  fieldId,
  value,
  disabled,
  borderRed,
  handleFileChange,
}: {
  label: string;
  fieldId: keyof FormResponses;
  value: File | string | undefined;
  disabled: boolean;
  borderRed: boolean;
  handleFileChange: (fid: keyof FormResponses, file: File | null) => void;
}) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const viewUrl = getFileURL(value);

  const handleAttachClick = () => {
    if (!disabled) hiddenInputRef.current?.click();
  };

  return (
    <div
      className={`mb-4 ${
        borderRed ? "border-red-500" : "border-gray-300"
      } p-1 rounded-md border`}
    >
      <div className="">
        <span className="text-sm font-semibold">{label}</span>
      </div>

      <div className="">
        {!value ? (
          <div className="flex items-center gap-4 w-full">
            {/* Hidden native file input */}
            <input
              type="file"
              ref={hiddenInputRef}
              style={{ display: "none" }}
              disabled={disabled}
              onChange={(e) =>
                handleFileChange(fieldId, e.target.files?.[0] || null)
              }
            />
            {/* Custom button */}
            <button
              type="button"
              onClick={handleAttachClick}
              disabled={disabled}
              className={`flex items-center px-3 py-1 bg-gray-100 border ${
                borderRed ? "border-red-500" : "border-gray-300"
              } rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60`}
            >
              <FaPaperclip className="mr-2" />
              Attach a File
            </button>
          </div>
        ) : (
          <div className="flex w-full items-center gap-4">
            <span className="font-medium text-xs text-green-700 border p-1 rounded-md bg-green-100 px-2">
              Uploaded
            </span>
            {viewUrl && (
              <a
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View"
                className="text-blue-500 hover:text-blue-700"
              >
                <FaEye />
              </a>
            )}
            <button
              type="button"
              title="Edit"
              className="text-yellow-500 hover:text-yellow-700"
              onClick={() => hiddenInputRef.current?.click()}
              disabled={disabled}
            >
              <FaEdit />
            </button>
            <button
              type="button"
              title="Delete"
              className="text-red-500 hover:text-red-700"
              onClick={() => handleFileChange(fieldId, null)}
              disabled={disabled}
            >
              <FaTrashAlt />
            </button>
            {/* Hidden input for re-upload */}
            <input
              type="file"
              ref={hiddenInputRef}
              style={{ display: "none" }}
              disabled={disabled}
              onChange={(e) =>
                handleFileChange(fieldId, e.target.files?.[0] || null)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUploadRow;
