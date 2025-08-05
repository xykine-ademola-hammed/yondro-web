import React, { createContext, useContext, useState, useCallback } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
}

interface ToastContextProps {
  toasts: Toast[];
  showToast: (message: string, type: "success" | "error" | "warning") => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "warning" = "success") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    },
    []
  );

  const getToastStyles = (type: "success" | "error" | "warning") => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-yellow-500 text-black";
      default:
        return "bg-black text-white";
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast }}>
      {children}
      <div className="fixed top-5 right-5 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded shadow-lg animate-fade-in-out ${getToastStyles(
              toast.type
            )}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
