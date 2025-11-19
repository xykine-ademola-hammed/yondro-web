import React from "react";
import type { PaymentVoucherDataType } from "../PaymentVoucher";

type Errors = Record<string, string | undefined>;

interface VoucherPaymentDetailProps {
  title?: string;
  formData: Record<string, any>;
  errors: Errors;
  isEnabled: (fieldName: string) => boolean;
  inputClass: (fieldName: string) => string;
  handleInput: (e: React.ChangeEvent<any>) => void;
  setFormData: React.Dispatch<React.SetStateAction<PaymentVoucherDataType>>;
}

const VoucherPaymentDetail: React.FC<VoucherPaymentDetailProps> = ({
  title = "Payment Voucher Details",
  formData,
  errors,
  isEnabled,
  inputClass,
  handleInput,
  setFormData,
}) => {
  return (
    <div className="mt-2">
      <div className="flex w-full justify-between items-center">
        <h3 className="text-l font-semibold text-gray-700 mb-1">{title}</h3>
      </div>

      <div className="p-1 border rounded-lg border-gray-200">
        {/* --- Payment Particulars + Amount --- */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 mb-4">
          {/* Particulars */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600">
              Particulars (Including References)
            </label>
            <textarea
              name="paymentParticles"
              id="paymentParticles"
              value={formData?.paymentParticles || ""}
              onChange={handleInput}
              disabled={!isEnabled("paymentParticles")}
              className={inputClass("paymentParticles")}
              rows={2}
              placeholder="Enter Payment Description"
            />
            {errors.paymentParticles && (
              <p className="text-xs text-red-600 mt-1">
                {errors.paymentParticles}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Amount
            </label>
            <input
              name="paymentDetailAmount"
              id="paymentDetailAmount"
              value={formData?.paymentDetailAmount || ""}
              onChange={handleInput}
              type="text"
              disabled={!isEnabled("paymentDetailAmount")}
              className={inputClass("paymentDetailAmount")}
              placeholder="Enter Amount"
            />
            {errors.paymentDetailAmount && (
              <p className="text-xs text-red-600 mt-1">
                {errors.paymentDetailAmount}
              </p>
            )}
          </div>
        </div>

        {/* --- Fee Breakdown Grid --- */}
        <div className="grid grid-cols-2 gap-1">
          {/* Gross Total Bill */}
          <div className="flex justify-end min-w-max">
            <span className="text-sm">Gross Total Bill</span>
          </div>
          <div>
            <input
              type="text"
              name="grossTotalBill"
              value={formData?.grossTotalBill ?? ""}
              disabled={!isEnabled("grossTotalBill")}
              onChange={handleInput}
              className={inputClass("grossTotalBill")}
            />
            {errors.grossTotalBill && (
              <p className="text-xs text-red-600 mt-1">
                {errors.grossTotalBill}
              </p>
            )}
          </div>

          {/* Stamp Duty */}
          <div className="flex justify-end min-w-max">
            <span className="text-sm">Stamp Duty (1%)</span>
          </div>
          <div>
            <input
              type="text"
              name="stampDuty"
              value={formData?.stampDuty ?? ""}
              onChange={handleInput}
              className={inputClass("stampDuty")}
              disabled
            />
            {errors.stampDuty && (
              <p className="text-xs text-red-600 mt-1">{errors.stampDuty}</p>
            )}
          </div>

          {/* VAT */}
          <div className="flex justify-end min-w-max">
            <span className="text-sm">VAT (7.5%)</span>
          </div>
          <div>
            <input
              type="text"
              name="lessVat"
              value={formData?.vat ?? ""}
              disabled
              className={inputClass("lessVat")}
            />
            {errors.lessVat && (
              <p className="text-xs text-red-600 mt-1">{errors.lessVat}</p>
            )}
          </div>

          {/* WHT */}
          <div className="flex justify-end items-center gap-3">
            <span className="text-sm">WHT</span>

            {/* WHT 5% */}
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, whtPercent: 5 }))
              }
              disabled={!isEnabled("wht")}
              className={`px-1 py-1 rounded-lg border text-sm font-medium transition border-gray-200 ${
                formData.whtPercent === 5
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              5%
            </button>

            {/* WHT 10% */}
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, whtPercent: 10 }))
              }
              disabled={!isEnabled("wht")}
              className={`px-1 py-1 rounded-lg border text-sm font-medium transition border-gray-200 ${
                formData.whtPercent === 10
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              10%
            </button>
          </div>

          <div>
            <input
              type="text"
              name="wht"
              value={formData?.wht ?? ""}
              disabled
              className={inputClass("wht")}
            />
            {errors.wht && (
              <p className="text-xs text-red-600 mt-1">{errors.wht}</p>
            )}
          </div>

          {/* Net Amount Payable */}
          <div className="flex justify-end min-w-max">
            <span className="text-sm">Net Amount Payable</span>
          </div>
          <div>
            <input
              type="text"
              name="totalEstimate"
              value={formData?.totalEstimate ?? ""}
              disabled
              className={inputClass("totalEstimate")}
            />
            {errors.totalEstimate && (
              <p className="text-xs text-red-600 mt-1">
                {errors.totalEstimate}
              </p>
            )}
          </div>
        </div>

        {/* Amount in Words */}
        <div className="mt-3">
          <h3 className="text-l text-gray-700 mb-1">Total in words:</h3>
          <textarea
            name="amountInWord"
            id="amountInWord"
            value={formData?.amountInWord || ""}
            onChange={handleInput}
            disabled={!isEnabled("amountInWord")}
            className={inputClass("amountInWord")}
            rows={2}
          />
          {errors.amountInWord && (
            <p className="text-xs text-red-600 mt-1">{errors.amountInWord}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherPaymentDetail;
