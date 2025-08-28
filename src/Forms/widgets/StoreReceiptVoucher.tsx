import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/useDownloadPdf";
import Signer from "../../components/Signer";
import spedLogo from "../../assets/spedLogo.png";

const requiredFields = [
  "voucherNo",
  "voucherDate",
  "toTheCentralStores",
  "nameOfSupplier",
  "supplierAddress",
];

const requiredStoreItemFields = [
  "articles",
  "denominationOfQty",
  "qtyReceived",
  "unitPrice",
  "amount",
  "ledgerFolio",
];

interface StoreItem {
  id: number | string;
  articles: string;
  denominationOfQty: string;
  qtyReceived: string;
  unitPrice: string;
  amount: string;
  ledgerFolio: string;
}

interface Requestor {
  firstName?: string;
  lastName?: string;
  department?: string;
  position?: string;
  date?: string;
}

interface Approver {
  firstName: string;
  lastName: string;
  department?: string;
  position?: string;
  date?: string;
  label?: string;
}

interface FormResponses {
  voucherNo?: string;
  voucherDate?: string;
  toTheCentralStores?: string;
  nameOfSupplier?: string;
  supplierAddress?: string;
  storeItems?: StoreItem[];
  totalAmount?: string;
  requestor?: Requestor;
  approvers?: Approver[];
  [key: string]: any;
}

interface StoreReceiptVoucherProps {
  formResponses: FormResponses;
  enableInputList?: string[];
  vissibleSections?: Array<"addMore" | string>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview";
}

const emptyItem: StoreItem = {
  id: "",
  articles: "",
  denominationOfQty: "",
  qtyReceived: "",
  unitPrice: "",
  amount: "",
  ledgerFolio: "",
};

const StoreReceiptVoucher: React.FC<StoreReceiptVoucherProps> = ({
  formResponses,
  enableInputList = [""],
  vissibleSections = [],
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "edit",
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();

  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [hasErrors, setHasErrors] = useState(false);
  const [formData, setFormData] = useState<FormResponses>(formResponses);

  const handleInputChange = (fieldId: keyof FormResponses, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const addMoreRow = () => {
    setStoreItems((prev) => [...prev, { ...emptyItem, id: Date.now() }]);
  };

  useEffect(() => {
    setFormData(formResponses);
    if (formResponses?.storeItems && Array.isArray(formResponses.storeItems)) {
      setStoreItems(formResponses?.storeItems);
    } else {
      setStoreItems([
        { ...emptyItem, id: 1 },
        { ...emptyItem, id: 2 },
        { ...emptyItem, id: 3 },
      ]);
    }
  }, [formResponses]);

  useEffect(() => {
    if (mode === "preview") {
      setStoreItems([
        { ...emptyItem, id: 1 },
        { ...emptyItem, id: 2 },
        { ...emptyItem, id: 3 },
        { ...emptyItem, id: 4 },
      ]);
    }
  }, [mode]);

  const isEnabled = (name: string) => enableInputList.includes(name);

  const checkIsValid = () => {
    const required: string[] = [];
    // Check top-level required fields
    for (let enableField of enableInputList) {
      if (requiredFields.includes(enableField) && !formData?.[enableField]) {
        required.push(enableField);
      }
    }
    for (let item of storeItems) {
      const allEmpty = requiredStoreItemFields.every(
        (field) => !item[field as keyof StoreItem]
      );
      if (allEmpty) continue;
      const hasEmpty = requiredStoreItemFields.some(
        (field) => !item[field as keyof StoreItem]
      );
      if (hasEmpty) {
        required.push("missing field");
      }
    }
    return !!required.length;
  };

  const handleSubmit = () => {
    if (!checkIsValid()) {
      onSubmit({ ...formData, storeItems });
      setFormData({});
      setStoreItems([]);
      setHasErrors(false);
    } else {
      setHasErrors(true);
    }
  };

  const handleCancel = () => {
    setFormData({});
    setStoreItems([]);
    onCancel();
  };

  const handleStoreItemChange = (
    eventName: keyof StoreItem,
    eventValue: string,
    index: number
  ) => {
    setStoreItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        [eventName]: eventValue,
      };
      return updatedItems;
    });
  };

  const requestor = formData.requestor || {};

  return (
    <div className="">
      <div className="flex justify-end items-end ">
        <button
          className="px-2 py-1 bg-blue-900 text-white rounded"
          onClick={() =>
            downloadPdf(componentRef as React.RefObject<HTMLElement>, {
              fileName: "payment-voucher.pdf",
              orientation: "portrait",
              format: "a4",
              margin: 24,
              scale: 2,
              hideSelectors: ["[data-export-hide]"],
              onBeforeCapture: () => {},
              onAfterCapture: () => {},
            })
          }
        >
          Download
        </button>
      </div>

      <div
        ref={componentRef}
        className="bg-white rounded-lg sm:p-2 w-full max-w-4xl"
      >
        <div className="flex gap-4 mb-4 sm:mb-0">
          <img src={spedLogo} alt="Company Logo" className="h-24" />
          <div>
            <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-600">
              {user?.organization?.name}
            </h2>
            <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-500">
              Store Receipt Voucher
            </h1>
          </div>
        </div>

        {hasErrors && (
          <div className="bg-red-50 p-4 rounded-lg mb-2">
            <p className="text-red-800 text-sm">
              There are some errors or missing required fields
            </p>
          </div>
        )}

        <div className=" my-4">
          <div className="grid grid-cols-2 gap-10">
            <div className="flex flex-rows">
              <div className="flex-1">
                <span className="text-sm font-semibold">No: </span>
              </div>
              <div className="flex-6">
                <input
                  type="text"
                  value={formData?.voucherNo ?? ""}
                  disabled={!isEnabled("voucherNo")}
                  onChange={(e) =>
                    handleInputChange("voucherNo", e.target.value)
                  }
                  className={`w-full p-1 border ${
                    isEnabled("voucherNo")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
              </div>
            </div>
            <div className="flex flex-rows">
              <div className="flex-1">
                <span className="text-sm font-semibold">Date: </span>
              </div>
              <div className="flex-6">
                <input
                  type="date"
                  value={formData?.voucherDate ?? ""}
                  onChange={(e) =>
                    handleInputChange("voucherDate", e.target.value)
                  }
                  disabled={!isEnabled("voucherDate")}
                  className={`w-full p-1 border ${
                    isEnabled("voucherDate")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-rows mt-1">
            <div className="flex-2">
              <span className="text-sm font-semibold">
                To the Central stores:{" "}
              </span>
            </div>
            <div className="flex-6">
              <input
                type="text"
                value={formData?.toTheCentralStores ?? ""}
                onChange={(e) =>
                  handleInputChange("toTheCentralStores", e.target.value)
                }
                disabled={!isEnabled("toTheCentralStores")}
                className={`w-full p-1 border ${
                  isEnabled("toTheCentralStores")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              />
            </div>
          </div>
          <div className="flex flex-rows mt-1">
            <div className="flex-1">
              <span className="text-sm font-semibold">Name of Suppplier: </span>
            </div>
            <div className="flex-4">
              <input
                type="text"
                value={formData?.nameOfSupplier ?? ""}
                disabled={!isEnabled("nameOfSupplier")}
                onChange={(e) =>
                  handleInputChange("nameOfSupplier", e.target.value)
                }
                className={`w-full p-1 border ${
                  isEnabled("nameOfSupplier")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              />
            </div>
          </div>
          <div className="flex flex-rows mt-1">
            <div className="flex-1">
              <span className="text-sm font-semibold"> Address: </span>
            </div>
            <div className="flex-6">
              <input
                type="text"
                value={formData?.supplierAddress ?? ""}
                disabled={!isEnabled("supplierAddress")}
                onChange={(e) =>
                  handleInputChange("supplierAddress", e.target.value)
                }
                className={`w-full p-1 border ${
                  isEnabled("supplierAddress")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="pr-40 py-1 text-left text-xs text-gray-500 ">
                    Articles
                  </th>
                  <th className="px-1 py-1 text-left text-xs text-gray-500 ">
                    Denomination Qty.
                  </th>
                  <th className="px-1 py-1 text-left text-xs text-gray-500 ">
                    Qty. received
                  </th>
                  <th className="px-1 py-1 text-left text-xs text-gray-500 ">
                    Unit Price
                  </th>
                  <th className="px-1 py-1 text-left text-xs text-gray-500 ">
                    Amount
                  </th>
                  <th className="px-1 py-1 text-left text-xs text-gray-500 ">
                    Ledger Folio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {storeItems?.map((item, index) => (
                  <tr key={item?.id ?? index}>
                    <td className="p-1">
                      <textarea
                        rows={1}
                        value={item?.articles ?? ""}
                        disabled={!isEnabled("articles")}
                        onChange={(e) =>
                          handleStoreItemChange(
                            "articles",
                            e.target.value,
                            index
                          )
                        }
                        className={`w-full p-1 border ${
                          isEnabled("articles")
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item?.denominationOfQty ?? ""}
                        disabled={!isEnabled("denominationOfQty")}
                        onChange={(e) =>
                          handleStoreItemChange(
                            "denominationOfQty",
                            e.target.value,
                            index
                          )
                        }
                        className={`w-full p-1 border ${
                          isEnabled("denominationOfQty")
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item?.qtyReceived ?? ""}
                        disabled={!isEnabled("qtyReceived")}
                        onChange={(e) =>
                          handleStoreItemChange(
                            "qtyReceived",
                            e.target.value,
                            index
                          )
                        }
                        className={`w-full p-1 border ${
                          isEnabled("qtyReceived")
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item?.unitPrice ?? ""}
                        disabled={!isEnabled("unitPrice")}
                        onChange={(e) =>
                          handleStoreItemChange(
                            "unitPrice",
                            e.target.value,
                            index
                          )
                        }
                        className={`w-full p-1 border ${
                          isEnabled("unitPrice")
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item?.amount ?? ""}
                        disabled={!isEnabled("amount")}
                        onChange={(e) =>
                          handleStoreItemChange("amount", e.target.value, index)
                        }
                        className={`w-full p-1 border ${
                          isEnabled("amount")
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item?.ledgerFolio ?? ""}
                        disabled={!isEnabled("ledgerFolio")}
                        onChange={(e) =>
                          handleStoreItemChange(
                            "ledgerFolio",
                            e.target.value,
                            index
                          )
                        }
                        className={`w-full p-1 border ${
                          isEnabled("ledgerFolio")
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(vissibleSections?.includes("addMore") || mode === "preview") && (
              <button
                type="button"
                onClick={addMoreRow}
                className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200"
              >
                Add row
              </button>
            )}
          </div>
        </div>

        {/* <div className="flex justify-end">
          <div className="flex flex-rows">
            <div>Total Amount:{formData?.totalAmount ?? "_____________"}</div>
          </div>
        </div> */}

        <div className="grid grid-cols-3 gap-20 ">
          <Signer
            firstName={requestor.firstName || user?.firstName || ""}
            lastName={requestor.lastName || user?.lastName || ""}
            date={requestor.date || moment(new Date()).format("DD/MM/YYYY")}
            department={requestor.department || user?.department?.name || ""}
            position={requestor.position || user?.position?.title || ""}
            label="Request by"
          />

          {(formData?.approvers || []).map((approver, idx) => (
            <Signer
              key={idx}
              firstName={approver.firstName}
              lastName={approver.lastName}
              date={approver.date ?? ""}
              department={approver.department ?? ""}
              position={approver.position ?? ""}
              label={approver.label ?? ""}
            />
          ))}
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg my-2">
          <p className="text-yellow-800 text-sm">
            This form is not to be used in cases of Local Purchases, receipt
            from the Crown Agents, receipt from Conversions or Transfer from
            another Store, but only in circumstances describe in Rules 34, 36
            and 37.
          </p>
        </div>

        {/* Action Buttons */}
        {showActionButtons && (
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreReceiptVoucher;
