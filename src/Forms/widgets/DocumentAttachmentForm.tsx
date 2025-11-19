import React, { useEffect, useState, type MouseEvent } from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";
import type { Document } from "../../components/UploadDocument";
import UploadDocument from "../../components/UploadDocument";
import DocumentListing from "../../components/DocumentListing";

interface DocumentAttachmentFormProps {
  onSubmit: (documents: Document[]) => void;
  mode?: "edit" | "preview" | "new" | "in_progress" | "view";
  initialDocuments?: Document[];
}

const DocumentAttachmentForm: React.FC<DocumentAttachmentFormProps> = ({
  onSubmit,
  mode = "edit",
  initialDocuments = [],
}) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);

  // Revoke any preview URLs when unmounting or when a doc is removed
  useEffect(() => {
    return () => {
      documents.forEach(
        (d) => d.previewUrl && URL.revokeObjectURL(d.previewUrl)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Only pass valid docs: require name + (file or url)
    const validDocuments = documents.filter(
      (doc) => doc.name?.trim() && (doc.file || doc.url)
    );
    onSubmit(validDocuments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents]);

  const addDoc = (doc: Document) => {
    setDocuments((prev) => [...prev, { ...doc }]);
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => {
      const clone = [...prev];
      const removed = clone.splice(index, 1)[0];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return clone;
    });
  };

  const downloadDocument = (
    doc: Document,
    e: MouseEvent<HTMLButtonElement>
  ) => {
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

  if (mode === "view") {
    return (
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900">Documents</h3>
        <DocumentListing
          documents={documents}
          mode="view"
          currentUserId={user?.id}
          onDownload={downloadDocument}
        />
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl bg-white p-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Documents</h3>

        {/* Upload trigger opens modal with 2 inputs (name + file) */}
        <UploadDocument onAdd={addDoc} />
      </div>

      <DocumentListing
        documents={documents}
        currentUserId={user?.id}
        mode={mode}
        onDelete={removeDocument}
        onDownload={downloadDocument}
      />
    </div>
  );
};

export default DocumentAttachmentForm;
