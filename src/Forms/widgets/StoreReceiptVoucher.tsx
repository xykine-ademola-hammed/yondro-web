import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/hooks/useDownloadPdf";
import Signer from "../../components/Signer";
import spedLogo from "../../assets/spedLogo.png";
import FormActions from "./FormActions";
import GenericTable from "./StoreItemTable";
import DocumentAttachmentForm from "./DocumentAttachmentForm.tsx";

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
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: FormResponses;
  enableInputList?: string[];
  vissibleSections?: Array<"addMore" | string>;
  onSubmit: (data: any, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
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
  mode = "new",
  responseTypes = [""],
  loading,
  setLoading,
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

  const storeColumns = [
    {
      label: "Articles",
      field: "articles" as keyof StoreItem,
      renderCell: (
        val: string,
        _row: any,
        _idx: number,
        onChange: any,
        disabled: boolean
      ) => (
        <textarea
          rows={1}
          value={val ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-1 border-0 focus:ring-2 focus:ring-blue-500 text-sm"
        />
      ),
      isDisabled: (_row: any, _idx: number) => !isEnabled("articles"),
    },
    {
      label: "Denomination Qty.",
      field: "denominationOfQty" as keyof StoreItem,
      isDisabled: (_row: any, _idx: number) => !isEnabled("denominationOfQty"),
    },
    {
      label: "Qty. received",
      field: "qtyReceived" as keyof StoreItem,
      isDisabled: (_row: any, _idx: number) => !isEnabled("qtyReceived"),
    },
    {
      label: "Unit Price",
      field: "unitPrice" as keyof StoreItem,
      isDisabled: (_row: any, _idx: number) => !isEnabled("unitPrice"),
    },
    {
      label: "Amount",
      field: "amount" as keyof StoreItem,
      isDisabled: (_row: any, _idx: number) => !isEnabled("amount"),
    },
    {
      label: "Ledger Folio",
      field: "ledgerFolio" as keyof StoreItem,
      isDisabled: (_row: any, _idx: number) => !isEnabled("ledgerFolio"),
    },
  ];

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

        <div className="my-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm font-semibold">No: </span>
              </div>
              <div className="w-full">
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
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm font-semibold">Date: </span>
              </div>
              <div className="w-full">
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
          <div className="flex flex-col md:flex-row mt-3 items-start md:items-center">
            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm font-semibold">
                To the Central stores:
              </span>
            </div>
            <div className="w-full">
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
          <div className="flex flex-col md:flex-row mt-3 items-start md:items-center">
            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm font-semibold">Name of Supplier:</span>
            </div>
            <div className="w-full">
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
          <div className="flex flex-col md:flex-row mt-3 items-start md:items-center">
            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm font-semibold">Address:</span>
            </div>
            <div className="w-full">
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

        <GenericTable
          columns={storeColumns}
          rows={storeItems}
          onCellChange={(field, value, rowIndex, _row) => {
            handleStoreItemChange(field, value, rowIndex);
          }}
          onAddRow={addMoreRow}
          canAddRow={vissibleSections?.includes("addMore")}
          addRowLabel="Add row"
        />

        <DocumentAttachmentForm
          onSubmit={(documents) =>
            setFormData((prev) => ({ ...prev, attachments: documents }))
          }
          mode="new"
          initialDocuments={formData?.attachments || []}
        />

        {/* Signers row (flex + wrap, nice spacing) */}
        <div className="mt-4 flex flex-wrap gap-6">
          {/* Requestor */}
          <div className="w-[340px] max-w-full flex-shrink-0">
            <Signer
              firstName={
                formData?.requestor?.firstName || user?.firstName || ""
              }
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
          </div>

          {/* Approvers */}
          {(formData?.approvers || []).map((approver, idx) => (
            <div key={idx} className="w-[340px] max-w-full flex-shrink-0">
              <Signer
                firstName={approver.firstName}
                lastName={approver.lastName}
                date={approver.date}
                department={approver.department}
                position={approver.position}
                label={approver.label}
              />
            </div>
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

export default StoreReceiptVoucher;
