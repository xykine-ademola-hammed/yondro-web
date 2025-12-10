import { X, Building2, Landmark } from "lucide-react";
import { PAYMENT_OPTIONS, type PaymentOption } from "./PaymentTypes";

interface PaymentOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: PaymentOption) => void;
  totalAmount: number;
}

export function PaymentOptionsModal({
  isOpen,
  onClose,
  onSelectOption,
  totalAmount,
}: PaymentOptionsModalProps) {
  if (!isOpen) return null;

  const tsaOptions = PAYMENT_OPTIONS.filter((opt) => opt.category === "TSA");
  const gifmisOptions = PAYMENT_OPTIONS.filter(
    (opt) => opt.category === "GIFMIS"
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Select Payment Option
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 break-all">
              Total: ₦
              {totalAmount.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 active:bg-gray-100 rounded-lg transition-colors flex-shrink-0 touch-none"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                TSA (Treasury Single Account)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {tsaOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSelectOption(option)}
                  className="p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 active:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 active:border-blue-400 rounded-lg transition-all text-left group touch-none"
                >
                  <p className="font-semibold text-gray-900 group-hover:text-blue-700 group-active:text-blue-700 transition-colors text-sm sm:text-base">
                    {option.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {option.subGroup}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                GIFMIS
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {gifmisOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSelectOption(option)}
                  className="p-3 sm:p-4 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-400 active:border-emerald-400 rounded-lg transition-all text-left group touch-none"
                >
                  <p className="font-semibold text-gray-900 group-hover:text-emerald-700 group-active:text-emerald-700 transition-colors text-sm sm:text-base">
                    {option.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {option.subGroup}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
