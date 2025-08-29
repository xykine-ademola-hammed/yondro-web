import React, { useEffect, useRef, useState, type RefObject } from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/useDownloadPdf";
import Signer from "../../components/Signer";
import spedLogo from "../../assets/spedLogo.png";

const requiredFields = [
  "unit",
  "applicationDate",
  "sivNo",
  "department",
  "issueAuthoriseBy",
  "designation",
];

const requiredStoreItemFields = [
  "articles",
  "denominationOfQty",
  "qtyDemanded",
  "qtyIssued",
  "rate",
  "amount",
  "ledgerFolio",
  "remarks",
];

// --- Types ---
interface StoreItem {
  id?: string | number;
  articles: string;
  denominationOfQty: string;
  qtyDemanded: string;
  qtyIssued: string;
  rate: string;
  amount: string;
  ledgerFolio: string;
  remarks: string;
}

interface Approver {
  firstName: string;
  lastName: string;
  date?: string;
  department?: string;
  position?: string;
}

interface Requestor {
  firstName?: string;
  lastName?: string;
  date?: string;
  department?: string;
  position?: string;
}

interface StoreIssueVoucherForm {
  unit?: string;
  applicationDate?: string;
  sivNo?: string;
  department?: string;
  issueAuthoriseBy?: string;
  designation?: string;
  requestor?: Requestor;
  approvers?: Approver[];
  storeItems?: StoreItem[];
  [key: string]: any;
}

interface StoreIssueVoucherProps {
  formResponses: StoreIssueVoucherForm;
  enableInputList?: string[];
  vissibleSections?: Array<"addMore" | string>;
  onSubmit: (data: StoreIssueVoucherForm) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview";
}

// default empty Item for new rows
const emptyItem: StoreItem = {
  articles: "",
  denominationOfQty: "",
  qtyDemanded: "",
  qtyIssued: "",
  rate: "",
  amount: "",
  ledgerFolio: "",
  remarks: "",
};

const StoreIssueVoucher: React.FC<StoreIssueVoucherProps> = ({
  formResponses,
  enableInputList = [""],
  vissibleSections = [],
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "edit",
}) => {
  const componentRef = useRef<HTMLElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();

  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [formData, setFormData] =
    useState<StoreIssueVoucherForm>(formResponses);
  const [hasErrors, setHasErrors] = useState(false);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const addMoreRow = () => {
    setStoreItems((prev) => [
      ...prev,
      { ...emptyItem, id: Date.now() + Math.random() },
    ]);
  };

  useEffect(() => {
    setFormData(formResponses);
    if (formResponses?.storeItems && Array.isArray(formResponses?.storeItems)) {
      setStoreItems(
        formResponses.storeItems.map((item, idx) => ({
          ...emptyItem,
          ...item,
          id: item.id ?? idx + "_" + Date.now(),
        }))
      );
    } else {
      setStoreItems([
        { ...emptyItem, id: 1 },
        { ...emptyItem, id: 2 },
        { ...emptyItem, id: 3 },
      ]);
    }
  }, [formResponses]);

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

  return (
    <div className="">
      <div className="flex justify-end items-end ">
        <button
          className="px-2 py-1 bg-blue-900 text-white rounded"
          onClick={() =>
            downloadPdf(componentRef as RefObject<HTMLElement>, {
              fileName: "payment-voucher.pdf",
              orientation: "portrait",
              format: "a4",
              margin: 24,
              scale: 2,
              hideSelectors: ["[data-export-hide]"], // hide buttons during capture
              onBeforeCapture: () => {},
              onAfterCapture: () => {},
            })
          }
        >
          Download
        </button>
      </div>

      <div
        ref={componentRef as React.RefObject<HTMLDivElement>}
        className="bg-white rounded-lg sm:p-2 w-full max-w-4xl"
      >
        <div className="flex gap-4 mb-4 sm:mb-0">
          <img src={spedLogo} alt="Company Logo" className="h-24" />
          <div>
            <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-600">
              {user?.organization?.name}
            </h2>
            <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-500">
              Store Issued Voucher
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

        {/* Header Section */}
        <div className="f my-4">
          <div className="">
            <div className="flex flex-rows mb-2">
              <div className="flex-1">
                <span className="text-xs font-semibold">Unit: </span>
              </div>
              <div className="flex-7">
                <input
                  type="text"
                  value={formData?.unit ?? ""}
                  disabled={!isEnabled("unit")}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                  className={`w-full p-1 border ${
                    isEnabled(`unit`) ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4  mb-2">
              <div className="flex flex-rows">
                <div className="flex-1">
                  <span className="text-xs font-semibold">Date: </span>
                </div>
                <div className="flex-3">
                  <input
                    type="date"
                    disabled={!isEnabled("applicationDate")}
                    value={formData?.applicationDate ?? ""}
                    onChange={(e) =>
                      handleInputChange("applicationDate", e.target.value)
                    }
                    className={`w-full p-1 border ${
                      isEnabled(`applicationDate`)
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                  />
                </div>
              </div>

              <div className="flex flex-rows">
                <div className="flex-1">
                  <span className="text-xs font-semibold">SIV No: </span>
                </div>
                <div className="flex-3">
                  <input
                    type="text"
                    value={formData?.sivNo ?? ""}
                    disabled={!isEnabled("sivNo")}
                    onChange={(e) => handleInputChange("sivNo", e.target.value)}
                    className={`w-full p-1 border ${
                      isEnabled(`sivNo`) ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-rows mb-2">
              <div className="flex-1">
                <span className="text-xs font-semibold">Department: </span>
              </div>
              <div className="flex-7">
                <input
                  type="text"
                  value={formData?.department ?? ""}
                  disabled={!isEnabled("department")}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  className={`w-full p-1 border ${
                    isEnabled(`department`)
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4  mb-2">
              <div className="flex flex-rows">
                <div className="flex-1">
                  <span className="text-xs font-semibold">Authorised By: </span>
                </div>
                <div className="flex-2">
                  <input
                    type="text"
                    value={formData?.issueAuthoriseBy ?? ""}
                    disabled={!isEnabled("issueAuthoriseBy")}
                    onChange={(e) =>
                      handleInputChange("issueAuthoriseBy", e.target.value)
                    }
                    className={`w-full p-1 border ${
                      isEnabled(`issueAuthoriseBy`)
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                  />
                </div>
              </div>

              <div className="flex flex-rows">
                <div className="flex-1">
                  <span className="text-xs font-semibold">Designation: </span>
                </div>
                <div className="flex-3">
                  <input
                    type="text"
                    value={formData?.designation ?? ""}
                    disabled={!isEnabled("designation")}
                    onChange={(e) =>
                      handleInputChange("designation", e.target.value)
                    }
                    className={`w-full p-1 border ${
                      isEnabled(`designation`)
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Items */}
        <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="pr-40 py-1 text-left text-xs text-gray-500">
                    Articles
                  </th>

                  <th className="px-1 py-1 text-left text-xs text-gray-500">
                    Denomination Qty.
                  </th>

                  <th className="px-1 py-1 text-left text-xs text-gray-500">
                    Qty. demanded
                  </th>

                  <th className="px-1 py-1 text-left text-xs text-gray-500">
                    Qty. issued
                  </th>

                  <th className="pl-1 pr-10 py-1 text-left text-xs text-gray-500">
                    Rate
                  </th>
                  <th className="pl-1 pr-10 py-1 text-left text-xs text-gray-500">
                    Amount
                  </th>
                  <th className="px-1 py-1 text-left text-xs text-gray-500">
                    Ledger Folio
                  </th>
                  <th className="px-1 py-1 text-left text-xs text-gray-500">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {storeItems?.map((item, index) => (
                  <tr key={item.id ?? index} className="items-center">
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
                          isEnabled(`articles`)
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
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
                          isEnabled(`denominationOfQty`)
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                      />
                    </td>

                    <td className="p-1">
                      <input
                        type="text"
                        value={item?.qtyDemanded ?? ""}
                        disabled={!isEnabled("qtyDemanded")}
                        onChange={(e) =>
                          handleStoreItemChange(
                            "qtyDemanded",
                            e.target.value,
                            index
                          )
                        }
                        className={`w-full p-1 border ${
                          isEnabled(`qtyDemanded`)
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item?.qtyIssued ?? ""}
                        disabled={!isEnabled("qtyIssued")}
                        onChange={(e) =>
                          handleStoreItemChange(
                            "qtyIssued",
                            e.target.value,
                            index
                          )
                        }
                        className={`w-full p-1 border ${
                          isEnabled(`qtyIssued`)
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                      />
                    </td>

                    <td className="p-1">
                      <input
                        type="text"
                        value={item?.rate ?? ""}
                        disabled={!isEnabled("rate")}
                        onChange={(e) =>
                          handleStoreItemChange("rate", e.target.value, index)
                        }
                        className={`w-full p-1 border ${
                          isEnabled(`rate`)
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
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
                          isEnabled(`amount`)
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
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
                          isEnabled(`ledgerFolio`)
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item?.remarks ?? ""}
                        disabled={!isEnabled("remarks")}
                        onChange={(e) =>
                          handleStoreItemChange(
                            "remarks",
                            e.target.value,
                            index
                          )
                        }
                        className={`w-full p-1 border ${
                          isEnabled(`remarks`)
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
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
                className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-200"
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

        <div className="grid grid-cols-3 gap-x-20 gap-y-4 mt-1">
          <Signer
            firstName={formData?.requestor?.firstName || user?.firstName || ""}
            lastName={formData?.requestor?.lastName || user?.lastName || ""}
            date={
              formData?.requestor?.date ||
              moment(new Date()).format("DD/MM/YYYY")
            }
            department={
              formData?.requestor?.department || user?.department?.name || ""
            }
            position={
              formData?.requestor?.position || user?.position?.title || ""
            }
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
              label="Endorsed/Approved by"
            />
          ))}
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg mb-2">
          <p className="text-yellow-800 text-xs">
            Original and Duplicate for cards & Ledger Posting, Triplicate to the
            Department of use and Quadruplicate remains in the book.
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

export default StoreIssueVoucher;
