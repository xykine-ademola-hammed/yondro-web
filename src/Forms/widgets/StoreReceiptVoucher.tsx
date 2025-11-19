import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/hooks/useDownloadPdf";
import Signer from "../../components/Signer";
import spedLogo from "../../assets/spedLogo.png";
import FormActions from "./FormActions";
import GenericTable from "./StoreItemTable";
import DocumentAttachmentForm from "./DocumentAttachmentForm.tsx";
import type { Approver } from "./ClaimOutOfPocketExpenses.tsx";

const requiredFields = [
  "voucherNo",
  "voucherDate",
  "toTheCentralStores",
  "nameOfSupplier",
  "supplierAddress",
] as const;

const requiredStoreItemFields = [
  "articles",
  "denominationOfQty",
  "qtyReceived",
  "unitPrice",
  "amount",
  "ledgerFolio",
] as const;

type HeaderKey = (typeof requiredFields)[number];
type RowKey = (typeof requiredStoreItemFields)[number];

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
  mode?: "new" | "edit" | "preview" | "view";
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
  console.log("========MDOE==========", mode);
  const componentRef = useRef<HTMLDivElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();

  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [formData, setFormData] = useState<FormResponses>(formResponses);

  const [hasErrors, setHasErrors] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<HeaderKey, true>>>({});
  const [rowErrors, setRowErrors] = useState<
    Record<number | string, Partial<Record<RowKey, true>>>
  >({});

  const inputClass = (name: HeaderKey) =>
    [
      "w-full p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm",
      "border",
      errors[name] ? "border-red-600 ring-1 ring-red-300" : "border-gray-300",
    ].join(" ");

  const inputCellClass = (rowId: number | string, field: RowKey) =>
    [
      "w-full p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm",
      "border",
      rowErrors[rowId]?.[field]
        ? "border-red-600 ring-1 ring-red-300"
        : "border-gray-300",
    ].join(" ");

  const isEnabled = (name: string) => enableInputList.includes(name);

  // -------- lifecycle --------
  useEffect(() => {
    setFormData(formResponses);
    if (formResponses?.storeItems && Array.isArray(formResponses.storeItems)) {
      setStoreItems(formResponses.storeItems);
    } else {
      setStoreItems([
        { ...emptyItem, id: 1 },
        { ...emptyItem, id: 2 },
        { ...emptyItem, id: 3 },
      ]);
    }
    setErrors({});
    setRowErrors({});
    setHasErrors(false);
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

  // -------- handlers --------
  const handleInputChange = (fieldId: keyof FormResponses, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // clear header error if any
    if (errors[fieldId as HeaderKey]) {
      setErrors((prev) => {
        const { [fieldId as HeaderKey]: _omit, ...rest } = prev;
        return rest;
      });
    }
  };

  const addMoreRow = () => {
    setStoreItems((prev) => [...prev, { ...emptyItem, id: Date.now() }]);
  };

  const handleStoreItemChange = (
    eventName: keyof StoreItem,
    eventValue: string,
    index: number
  ) => {
    setStoreItems((prevItems) => {
      const updatedItems = [...prevItems];
      const updatedRow = { ...updatedItems[index], [eventName]: eventValue };
      updatedItems[index] = updatedRow;

      // clear row error if any
      const rid = updatedRow.id ?? index;
      if (rowErrors[rid]?.[eventName as RowKey]) {
        setRowErrors((prev) => {
          const clone = { ...prev };
          const r = { ...(clone[rid] || {}) };
          delete r[eventName as RowKey];
          if (Object.keys(r).length === 0) delete clone[rid];
          else clone[rid] = r;
          return clone;
        });
      }
      return updatedItems;
    });
  };

  // -------- validation --------
  const validate = () => {
    const nextErrors: Partial<Record<HeaderKey, true>> = {};
    const nextRowErrors: Record<
      number | string,
      Partial<Record<RowKey, true>>
    > = {};

    // Validate enabled header fields
    requiredFields.forEach((field) => {
      if (isEnabled(field) && !String(formData?.[field] ?? "").trim()) {
        nextErrors[field] = true;
      }
    });

    // Row rule: each row must be fully empty OR fully filled
    for (const row of storeItems) {
      const rid = row.id;
      const values = requiredStoreItemFields.map((k) =>
        String(row[k] ?? "").trim()
      );
      const allEmpty = values.every((v) => v === "");
      if (allEmpty) continue;
      const allFilled = values.every((v) => v !== "");
      if (!allFilled) {
        for (const k of requiredStoreItemFields) {
          if (!String(row[k] ?? "").trim()) {
            if (!nextRowErrors[rid]) nextRowErrors[rid] = {};
            nextRowErrors[rid][k] = true;
          }
        }
      }
    }

    setErrors(nextErrors);
    setRowErrors(nextRowErrors);

    const invalid =
      Object.keys(nextErrors).length > 0 ||
      Object.keys(nextRowErrors).length > 0;

    setHasErrors(invalid);
    return !invalid;
  };

  const handleSubmit = (status: string) => {
    if (validate()) {
      setLoading(true);
      onSubmit({ ...formData, storeItems }, status);
      setHasErrors(false);
    } else {
      setHasErrors(true);
    }
  };

  const handleCancel = () => {
    setFormData({});
    setStoreItems([]);
    setErrors({});
    setRowErrors({});
    onCancel();
  };

  // -------- table columns with controlled render (for error styling) --------
  const storeColumns = [
    {
      label: "Articles",
      field: "articles" as const,
      renderCell: (
        val: string,
        row: StoreItem,
        idx: number,
        onChange: (v: string) => void,
        disabled: boolean
      ) => (
        <textarea
          rows={1}
          value={val ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={inputCellClass(row.id ?? idx, "articles")}
        />
      ),
      isDisabled: () => !isEnabled("articles"),
    },
    {
      label: "Denomination Qty.",
      field: "denominationOfQty" as const,
      renderCell: (
        val: string,
        row: StoreItem,
        idx: number,
        onChange: (v: string) => void,
        disabled: boolean
      ) => (
        <input
          type="text"
          value={val ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={inputCellClass(row.id ?? idx, "denominationOfQty")}
        />
      ),
      isDisabled: () => !isEnabled("denominationOfQty"),
    },
    {
      label: "Qty. received",
      field: "qtyReceived" as const,
      renderCell: (
        val: string,
        row: StoreItem,
        idx: number,
        onChange: (v: string) => void,
        disabled: boolean
      ) => (
        <input
          type="text"
          value={val ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={inputCellClass(row.id ?? idx, "qtyReceived")}
        />
      ),
      isDisabled: () => !isEnabled("qtyReceived"),
    },
    {
      label: "Unit Price",
      field: "unitPrice" as const,
      renderCell: (
        val: string,
        row: StoreItem,
        idx: number,
        onChange: (v: string) => void,
        disabled: boolean
      ) => (
        <input
          type="text"
          value={val ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={inputCellClass(row.id ?? idx, "unitPrice")}
        />
      ),
      isDisabled: () => !isEnabled("unitPrice"),
    },
    {
      label: "Amount",
      field: "amount" as const,
      renderCell: (
        val: string,
        row: StoreItem,
        idx: number,
        onChange: (v: string) => void,
        disabled: boolean
      ) => (
        <input
          type="text"
          value={val ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={inputCellClass(row.id ?? idx, "amount")}
        />
      ),
      isDisabled: () => !isEnabled("amount"),
    },
    {
      label: "Ledger Folio",
      field: "ledgerFolio" as const,
      renderCell: (
        val: string,
        row: StoreItem,
        idx: number,
        onChange: (v: string) => void,
        disabled: boolean
      ) => (
        <input
          type="text"
          value={val ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={inputCellClass(row.id ?? idx, "ledgerFolio")}
        />
      ),
      isDisabled: () => !isEnabled("ledgerFolio"),
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
                  className={inputClass("voucherNo")}
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
                  className={inputClass("voucherDate")}
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
                className={inputClass("toTheCentralStores")}
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
                className={inputClass("nameOfSupplier")}
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
                className={inputClass("supplierAddress")}
              />
            </div>
          </div>
        </div>

        <GenericTable
          columns={storeColumns}
          rows={storeItems}
          onCellChange={(field, value, rowIndex) => {
            handleStoreItemChange(field as keyof StoreItem, value, rowIndex);
          }}
          onAddRow={addMoreRow}
          canAddRow={vissibleSections?.includes("addMore")}
          addRowLabel="Add row"
        />

        <DocumentAttachmentForm
          onSubmit={(documents) => {
            console.log("+++++++++++++", documents);
            setFormData((prev) => ({ ...prev, attachments: documents }));
          }}
          mode={mode}
          initialDocuments={formData?.attachments || []}
        />

        {/* Signers row */}
        <div className="mt-4 flex flex-wrap gap-6">
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
              label="Request"
            />
          </div>

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
