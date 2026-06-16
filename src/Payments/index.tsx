import { Trash2, CreditCard } from "lucide-react";
import type { PaymentOption, Voucher } from "./PaymentTypes";
import { useAppContext } from "../GlobalContexts/AppContext";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../common/api-methods";
import MoneyDisplay from "../components/ui/MoneyDisplay";
import { PaymentOptionsModal } from "./PaymentOptionsModal";
import { useToast } from "../GlobalContexts/ToastContext";
import { Link } from "react-router-dom";

export function PaymentPool() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Voucher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    selectedRequestPoolIds,
    setSelectedRequestPaymentPool,
    selectedRequestPaymentPool,
    onRemoveItem,
  } = useAppContext();

  const { mutateAsync: getVoucherByEntityIds } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod("POST", `api/vouchers/get-by-entity-ids`, body, true),
    onSuccess: (data) => {
      setItems(data);
    },
    onError: async (_error) => {},
  });

  const { mutateAsync: processPayment } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod("POST", `api/payments`, body, true),
    onSuccess: (_data) => {
      setSelectedRequestPaymentPool([]);
      showToast("Payment processed successfully", "success");
    },
    onError: async (_error) => {},
  });

  useEffect(() => {
    if (selectedRequestPoolIds.length > 0) {
      getVoucherByEntityIds({
        entityIds: selectedRequestPoolIds,
      });
    } else {
      setItems([]);
    }
  }, [selectedRequestPoolIds]);

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.total_amount),
    0
  );

  const handleProcessPayment = () => {
    if (items.length > 0) {
      setIsModalOpen(true);
    }
  };

  const handleSelectPaymentOption = (paymentOption: PaymentOption) => {
    setIsModalOpen(false);
    processPayment({
      totalAmount,
      paymentOption,
      voucherIds: items.map((item) => item.id),
      stageInstanceIds: selectedRequestPaymentPool.map(
        (item: any) => item.stageId
      ),
    });
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm  p-2 sm:p-6">
      <Link
        to="/"
        className="w-12 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
      >
        <i className="fas fa-arrow-left text-gray-600"></i>
      </Link>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Payment Pool
        </h2>
        <span className="px-2.5 py-1 sm:px-3 sm:py-1 bg-green-600 text-white text-xs sm:text-sm font-semibold rounded-full">
          {items.length} {items.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
          <p className="text-gray-500 text-xs sm:text-sm">
            No items in payment pool. Add items to process payment.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4 sm:mb-6 max-h-64 sm:max-h-96 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-2 sm:p-3 flex justify-between items-center gap-2 sm:gap-3 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  {/* <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                    Voucher on
                  </p> */}
                  <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                    {item.entity.parentRequest?.workflow.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {/* {item.entity.requestor.firstName}{" "}
                    {item.entity.requestor.lastName} */}

                    {item.entity.parentRequest?.requestor.firstName}
                    {item.entity.parentRequest?.requestor.lastName}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                    <MoneyDisplay value={Number(item.total_amount)} />
                  </p>
                  <button
                    onClick={() => onRemoveItem(item.entity.id)}
                    className="p-1 sm:p-1.5 text-red-600 hover:text-red-700 active:text-red-700 hover:bg-red-50 active:bg-red-50 rounded-lg transition-colors touch-none"
                    title="Remove from pool"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-green-200 pt-4">
            <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Total Amount:
              </span>
              <span className="text-lg sm:text-2xl font-bold text-gray-900 break-all">
                ₦
                {totalAmount.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <button
              onClick={handleProcessPayment}
              className="w-full bg-green-600 hover:bg-green-700 active:bg-green-700 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors flex items-center justify-center gap-2 touch-none"
            >
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Process Payment</span>
            </button>
          </div>
        </>
      )}

      <PaymentOptionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectOption={handleSelectPaymentOption}
        totalAmount={totalAmount}
      />
    </div>
  );
}
