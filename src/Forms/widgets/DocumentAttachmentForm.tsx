import React, {
  useEffect,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from "react";

export interface Document {
  id?: string | number;
  name: string;
  file?: File | null;
  previewUrl?: string | null;
  url?: string | null;
}

interface DocumentAttachmentFormProps {
  onSubmit: (documents: Document[]) => void;
  mode: "new" | "edit" | "view";
  initialDocuments?: Document[];
}

const DocumentAttachmentForm: React.FC<DocumentAttachmentFormProps> = ({
  onSubmit,
  mode,
  initialDocuments = [],
}) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);

  const updateName = (index: number, value: string) => {
    const newDocs = [...documents];
    newDocs[index].name = value;
    setDocuments(newDocs);
  };

  const updateFile = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDocs = [...documents];
      if (newDocs[index].previewUrl) {
        URL.revokeObjectURL(newDocs[index].previewUrl);
      }
      newDocs[index].file = file;
      newDocs[index].previewUrl = URL.createObjectURL(file);
      setDocuments(newDocs);
    }
  };

  const removeDocument = (index: number) => {
    const newDocs = [...documents];
    const doc = newDocs.splice(index, 1)[0];
    if (doc.previewUrl) {
      URL.revokeObjectURL(doc.previewUrl);
    }
    setDocuments(newDocs);
  };

  const downloadDocument = (
    doc: Document,
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    let url = doc.url || doc.previewUrl;
    if (!url) return;

    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name || "document";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Do not revoke previewUrl here to keep it available during session
  };

  const addDocument = () => {
    setDocuments([...documents, { name: "", file: null }]);
  };

  useEffect(() => {
    const validDocuments = documents.filter(
      (doc) => doc.name.trim() && (doc.file || doc.url)
    );
    onSubmit(validDocuments);
  }, [documents]);

  if (mode === "view") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        {documents.map((doc, index) => (
          <div
            key={doc.id || index}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
          >
            <p className="text-sm font-medium text-gray-700 mb-2">{doc.name}</p>
            <div className="text-sm text-gray-500 mb-3">
              {doc.url && <span>Existing document</span>}
              {doc.file && <span>Attached: {doc.file.name}</span>}
            </div>
            <button
              type="button"
              onClick={(e) => downloadDocument(doc, e)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={[
        "w-full rounded-xl bg-white",
        "shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-gray-300",
        "transition-all duration-200",
        "p-2",
      ].join(" ")}
    >
      <div className="flex justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <button
          type="button"
          onClick={addDocument}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add More Documents
        </button>
      </div>
      {documents.map((doc, index) => (
        <div
          key={doc.id || index}
          className="flex gap-4 items-center bg-white border border-gray-200 rounded-lg shadow-sm p-1"
        >
          <input
            type="text"
            disabled={!!doc.id}
            value={doc.name}
            onChange={(e) => updateName(index, e.target.value)}
            placeholder="Enter document name"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {!doc.url && (
            <input
              type="file"
              onChange={(e) => updateFile(index, e)}
              className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                doc.file ? "hidden" : ""
              }`}
            />
          )}
          <div className="flex space-x-2">
            {(doc.file || doc.url) && (
              <button
                type="button"
                onClick={(e) => downloadDocument(doc, e)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Download
              </button>
            )}
            <button
              type="button"
              onClick={() => removeDocument(index)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentAttachmentForm;
