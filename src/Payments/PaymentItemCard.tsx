import { Copy, Plus } from "lucide-react";
import type { PaymentItem } from "./PaymentTypes";

interface PaymentItemCardProps {
  item: PaymentItem;
  onAddToPool: (item: PaymentItem) => void;
  onCopyToClipboard: (item: PaymentItem) => void;
  isInPool: boolean;
}

export function PaymentItemCard({
  item,
  onAddToPool,
  onCopyToClipboard,
  isInPool,
}: PaymentItemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow active:shadow-md">
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2">
            {item.description}
          </h3>
          <p className="text-xs text-gray-500 truncate">{item.beneficiary}</p>
        </div>
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
            {item.category}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-end gap-2">
        <div className="min-w-0">
          <p className="text-base sm:text-lg font-bold text-gray-900 break-words">
            ₦{item.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500">{item.date}</p>
        </div>

        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={() => onCopyToClipboard(item)}
            className="p-2 sm:p-2 text-gray-600 hover:text-gray-900 active:text-gray-900 hover:bg-gray-100 active:bg-gray-100 rounded-lg transition-colors touch-none"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAddToPool(item)}
            disabled={isInPool}
            className={`p-2 sm:p-2 rounded-lg transition-colors touch-none ${
              isInPool
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "text-green-600 hover:text-green-700 active:text-green-700 hover:bg-green-50 active:bg-green-50"
            }`}
            title={isInPool ? "Already in pool" : "Add to payment pool"}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
