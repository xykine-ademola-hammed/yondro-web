import React, { useEffect, useRef, useState, type RefObject } from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/hooks/useDownloadPdf";
import Signer from "../../components/Signer";
import { getFinanceCode } from "../../common/methods";
import spedLogo from "../../assets/spedLogo.png";
import FormActions from "./FormActions";

/** Interfaces for core objects **/
interface StoreItem {
  id?: string | number;
  itemName?: string;
  quantity?: string;
  // These additional fields show up in initialization,
  // but are not actually used in this UI's table.
  articles?: string;
  denominationOfQty?: string;
  qtyReceived?: string;
  unitPrice?: string;
  amount?: string;
  ledgerFolio?: string;
}

interface Approver {
  firstName: string;
  lastName: string;
  date?: string;
  department?: string;
  position?: string;
  label?: string;
}

interface Requestor {
  firstName?: string;
  lastName?: string;
  date?: string;
  department?: string;
  position?: string;
}

interface ProcurementOrderFormResponses {
  requestorDeligation?: string;
  additionalNotes?: string;
  requestor?: Requestor;
  approvers?: Approver[];
  storeItems?: StoreItem[];
}

interface ProcurementOrderProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: ProcurementOrderFormResponses;
  enableInputList?: string[];
  vissibleSections?: string[];
  onSubmit: (data: ProcurementOrderFormResponses, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
}

/** Required field names **/
const requiredFields = ["requestorDeligation"];

/** Component Implementation **/
const ProcurementOrder: React.FC<ProcurementOrderProps> = ({
  formResponses,
  enableInputList = [""],
  vissibleSections = [],
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "new",
  responseTypes = [""],
  loading = false,
  setLoading,
}) => {
  // console.log("====mode=====", mode);
  // Use HTMLElement for PDF compatibility
  const componentRef = useRef<HTMLElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();

  // useState with proper typing
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProcurementOrderFormResponses>({
    requestorDeligation: getFinanceCode(user),
    ...formResponses,
  });

  // Unified handler for input changes
  const handleInputChange = (
    fieldId: keyof ProcurementOrderFormResponses | string,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Add a new empty row to storeItems
  const addMoreRow = () => {
    setStoreItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        itemName: "",
        quantity: "",
      },
    ]);
  };

  // When formResponses changes (eg, load), sync state
  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...formResponses }));
    if (formResponses?.storeItems && Array.isArray(formResponses.storeItems)) {
      setStoreItems(
        formResponses.storeItems.map((item, idx) => ({
          ...item,
          id: item.id ?? idx + "_" + Date.now(),
        }))
      );
    } else {
      setStoreItems([{ id: 1 }, { id: 2 }, { id: 3 }]);
    }
    // eslint-disable-next-line
  }, [formResponses]);

  // If preview mode, show extra blank rows
  useEffect(() => {
    if (mode === "preview") {
      setStoreItems([
        { id: 1, itemName: "", quantity: "" },
        { id: 2, itemName: "", quantity: "" },
        { id: 3, itemName: "", quantity: "" },
        { id: 4, itemName: "", quantity: "" },
      ]);
    }
  }, [mode]);

  // Field enable utility
  const isEnabled = (name: string) => enableInputList.includes(name);

  // Validate required fields and store items
  const checkIsValid = () => {
    const required: string[] = [];
    for (let enableField of enableInputList) {
      if (
        requiredFields.includes(enableField) &&
        !formData?.[enableField as keyof ProcurementOrderFormResponses]
      )
        required.push(enableField);
    }

    for (let item of storeItems) {
      if (
        (item.itemName && !item.quantity) ||
        (!item.itemName && item.quantity)
      )
        required.push("quantity");
    }
    return !!required.length;
  };

  // Form submission handlers
  const handleSubmit = (status: string) => {
    if (!checkIsValid()) {
      setLoading(true);
      onSubmit({ ...formData, storeItems }, status);
      // setFormData({});
      // setStoreItems([]);
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

  // Handler for per-row item field changes
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

  // const responseButtonProps: Record<
  //   string,
  //   {
  //     bgColor: string;
  //     label: string;
  //     action: () => void;
  //   }
  // > = {
  //   Reject: {
  //     bgColor: "green",
  //     label: "Approve",
  //     action: () => handleSubmit("Reject"),
  //   },
  //   Approve: {
  //     bgColor: "green",
  //     label: "Approve",
  //     action: () => handleSubmit("Approve"),
  //   },
  //   Approval: {
  //     bgColor: "green",
  //     label: "Approve",
  //     action: () => handleSubmit("Approve"),
  //   },
  //   Acknowledgement: {
  //     bgColor: "green",
  //     label: "Acknowledgement",
  //     action: () => handleSubmit("Approve"),
  //   },
  //   Payment: {
  //     bgColor: "green",
  //     label: "Approve payment",
  //     action: () => handleSubmit("Payment"),
  //   },
  //   Procurement: {
  //     bgColor: "blue",
  //     label: "Approve procurement",
  //     action: () => handleSubmit("Procurement"),
  //   },
  // };

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
              Procurement Order Form
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
          <div className="">
            <span className="text-sm font-semibold">
              Department/School/Unit:{" "}
            </span>
          </div>
          <div className="flex-6">
            <input
              type="text"
              value={formData?.requestorDeligation ?? ""}
              disabled={!isEnabled("requestorDeligation")}
              onChange={(e) =>
                handleInputChange("requestorDeligation", e.target.value)
              }
              className={`w-full p-1 border ${
                isEnabled(`requestorDeligation`)
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
            />
          </div>
        </div>

        {/* Store Items Table */}
        <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="pr-5 py-1 text-left text-xs text-gray-500 text-sm">
                    S/N
                  </th>
                  <th className="pr-125 py-1 text-left text-xs text-gray-500 text-sm">
                    Items
                  </th>
                  <th className="px-1 py-1 text-left text-xs text-gray-500 text-sm">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {storeItems?.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td className="p-1">{index + 1}</td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item?.itemName ?? ""}
                        disabled={!isEnabled("itemName")}
                        onChange={(e) =>
                          handleStoreItemChange(
                            "itemName",
                            e.target.value,
                            index
                          )
                        }
                        className={`mt-1 w-full p-1 border ${
                          isEnabled(`itemName`)
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item?.quantity ?? ""}
                        disabled={!isEnabled("quantity")}
                        onChange={(e) =>
                          handleStoreItemChange(
                            "quantity",
                            e.target.value,
                            index
                          )
                        }
                        className={`mt-1 w-full p-1 border ${
                          isEnabled(`quantity`)
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

        <div className="mt-4">
          <h3 className="text-l font-semibold text-gray-700 mb-1">
            Additional Notes
          </h3>
          <div>
            <textarea
              name="additionalNotes"
              id="additionalNotes"
              disabled={!isEnabled("additionalNotes")}
              value={formData?.additionalNotes ?? ""}
              onChange={(e) =>
                handleInputChange("additionalNotes", e.target.value)
              }
              className={`mt-1 w-full p-2 border ${
                isEnabled("additionalNotes")
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              rows={4}
              placeholder=""
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 ">
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

          {formData?.approvers?.map((approver, idx) => (
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

        {showActionButtons && (
          <FormActions
            loading={loading}
            handleCancel={handleCancel}
            mode={mode}
            handleSubmit={handleSubmit}
            responseTypes={responseTypes}
          />
        )}
      </div>
    </div>
  );
};

export default ProcurementOrder;
