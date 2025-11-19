import React, { useEffect, useState, type ChangeEvent } from "react";
import { useAuth } from "../GlobalContexts/AuthContext";

export interface Document {
  id?: string | number;
  name: string;
  file?: File | null;
  previewUrl?: string | null;
  url?: string | null;
  createdBy?: number;
}

interface UploadDocumentProps {
  onAdd: (doc: Document) => void;
  buttonLabel?: string;
}

const Backdrop: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="fixed inset-0 bg-black/30 z-40"
    role="presentation"
    onClick={onClose}
  />
);

const Modal: React.FC<{
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}> = ({ title, children, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    aria-modal="true"
    role="dialog"
  >
    <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          ✕
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

const UploadDocument: React.FC<UploadDocumentProps> = ({
  onAdd,
  buttonLabel = "Add document",
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<{ name?: string; file?: string }>({});

  // Revoke preview URLs if we ever create one locally here (we don't persist it across reopens)
  useEffect(() => {
    return () => {
      // nothing to revoke here; parent holds previewUrl
    };
  }, []);

  const reset = () => {
    setName("");
    setFile(null);
    setErr({});
  };

  const handleOpen = () => {
    reset();
    setOpen(true);
  };

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) setErr((pr) => ({ ...pr, file: undefined }));
  };

  const validate = () => {
    const next: { name?: string; file?: string } = {};
    if (!name.trim()) next.name = "Document name is required.";
    if (!file) next.file = "Please choose a file to upload.";
    setErr(next);
    return Object.keys(next).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;

    const previewUrl = file ? URL.createObjectURL(file) : undefined;

    onAdd({
      name: name.trim(),
      file,
      previewUrl,
      createdBy: user?.id,
    });

    handleClose();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
      >
        {buttonLabel}
      </button>

      {open && (
        <>
          <Backdrop onClose={handleClose} />
          <Modal title="Add Document" onClose={handleClose}>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="doc-name"
                  className="block text-xs font-medium text-gray-700"
                >
                  Document Name
                </label>
                <input
                  id="doc-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim())
                      setErr((pr) => ({ ...pr, name: undefined }));
                  }}
                  placeholder="Enter document name"
                  className={[
                    "mt-1 w-full p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                    err.name
                      ? "border border-red-500"
                      : "border border-gray-300",
                  ].join(" ")}
                  aria-invalid={err.name ? "true" : "false"}
                />
                {err.name && (
                  <p className="mt-1 text-xs text-red-600">{err.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="doc-file"
                  className="block text-xs font-medium text-gray-700"
                >
                  File
                </label>
                <input
                  id="doc-file"
                  type="file"
                  onChange={onFileChange}
                  className={[
                    "mt-1 w-full p-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm",
                    "border-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100",
                    err.file ? "ring-2 ring-red-500" : "",
                  ].join(" ")}
                  aria-invalid={err.file ? "true" : "false"}
                />
                {err.file && (
                  <p className="mt-1 text-xs text-red-600">{err.file}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </>
  );
};

export default UploadDocument;
