import { CheckCircle, X } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function SuccessModal({ isOpen, onClose, message }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6">
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 active:bg-gray-100 rounded-lg transition-colors touch-none"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-green-100 mb-3 sm:mb-4">
            <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Success!
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">{message}</p>
          <button
            onClick={onClose}
            className="mt-4 sm:mt-6 w-full bg-green-600 hover:bg-green-700 active:bg-green-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base touch-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
