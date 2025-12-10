import React from "react";
import type { VoteBookAccountLookup } from "../../../Finance/vouchers/VoucherAccountLookup";
import type { PaymentVoucherDataType } from "../PaymentVoucher";
import VoucherAccountLookup from "../../../Finance/vouchers/VoucherAccountLookup";

type Errors = Record<string, string | undefined>;

type VoucherAccount = {
  id?: string | number;
  name?: string;
  code?: string;
  [key: string]: any;
};

interface EntriDistributionProps {
  title?: string;
  formData: Record<string, any>;
  errors: Errors;
  isEnabled: (fieldName: string) => boolean;
  inputClass: (fieldName: string) => string;
  handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedVoucherAccount: VoucherAccount | null;
  setSelectedVoucherAccount: React.Dispatch<
    React.SetStateAction<VoteBookAccountLookup | null>
  >;
  setFormData: React.Dispatch<React.SetStateAction<PaymentVoucherDataType>>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const EntriDistribution: React.FC<EntriDistributionProps> = ({
  title = "Entry Distribution",
  formData,
  errors,
  isEnabled,
  inputClass,
  handleInput,
  selectedVoucherAccount,
  setSelectedVoucherAccount,
  setFormData,
  setErrors,
}) => {
  return (
    <div className="mt-2">
      <div className="flex w-full justify-between items-center">
        <h3 className="text-l font-semibold text-gray-700 mb-1">{title}</h3>
      </div>

      <div className="p-1 border rounded-lg border-gray-200">
        <div>
          {/* Account Lookup */}
          <div className="flex flex-col sm:flex-row w-full gap-1">
            <VoucherAccountLookup
              isEnabled={
                isEnabled("accountTitle") && isEnabled("accountCodeNo")
              }
              onSelect={(selected) => {
                if (selected !== null) {
                  setSelectedVoucherAccount(selected);
                } else {
                  setSelectedVoucherAccount(null);
                }

                setFormData((prev) => ({
                  ...prev,
                  selectedVoucherAccount: selected,
                  accountTitle: selected?.name ?? "",
                  accountCodeNo: selected?.code ?? "",
                }));

                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.accountTitle;
                  delete next.accountCodeNo;
                  return next;
                });
              }}
              selectedAccount={
                selectedVoucherAccount ?? formData.selectedVoucherAccount
              }
            />
          </div>

          {/* Amount Section */}
          <div className="col-span-2 mt-0">
            <label className="block text-sm font-medium text-gray-600">
              Amount
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 p-1 border border-gray-200">
              {/* Debit */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600">
                  Debit
                </label>
                <div className="flex gap-1">
                  <input
                    name="debitAmount"
                    id="debitAmount"
                    value={formData?.debitAmount || ""}
                    onChange={handleInput}
                    disabled={!isEnabled("debitAmount")}
                    className={inputClass("debitAmount")}
                    type="text"
                    placeholder="Amount"
                  />
                  <input
                    name="debitDescription"
                    id="debitDescription"
                    value={formData?.debitDescription || ""}
                    onChange={handleInput}
                    disabled={!isEnabled("debitDescription")}
                    className={inputClass("debitDescription")}
                    type="text"
                    placeholder="Description"
                  />
                </div>
                {(errors.debitAmount || errors.debitDescription) && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.debitAmount || errors.debitDescription}
                  </p>
                )}
              </div>

              {/* Credit */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600">
                  Credit
                </label>
                <div className="flex gap-1">
                  <input
                    name="creditAmount"
                    id="creditAmount"
                    value={formData?.creditAmount || ""}
                    onChange={handleInput}
                    disabled={!isEnabled("creditAmount")}
                    className={inputClass("creditAmount")}
                    type="text"
                    placeholder="Amount"
                  />
                  <input
                    name="creditDescription"
                    id="creditDescription"
                    value={formData?.creditDescription || ""}
                    onChange={handleInput}
                    disabled={!isEnabled("creditDescription")}
                    className={inputClass("creditDescription")}
                    type="text"
                    placeholder="Description"
                  />
                </div>
                {(errors.creditAmount || errors.creditDescription) && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.creditAmount || errors.creditDescription}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Account errors */}
          {(errors.accountTitle || errors.accountCodeNo) && (
            <p className="text-xs text-red-600 mt-1">
              {errors.accountTitle || errors.accountCodeNo}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntriDistribution;
