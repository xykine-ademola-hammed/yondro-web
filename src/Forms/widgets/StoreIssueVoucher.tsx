import React, { useEffect, useRef, useState, type RefObject } from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/hooks/useDownloadPdf";
import Signer from "../../components/Signer";
import spedLogo from "../../assets/spedLogo.png";
import FormActions from "./FormActions";
import GenericTable from "./StoreItemTable";
import DocumentAttachmentForm from "./DocumentAttachmentForm";
import type { Approver } from "./ClaimOutOfPocketExpenses";
import { isShowOrganizationDetail } from "../../common/constant";

const requiredFields = [
  "unit",
  "applicationDate",
  "sivNo",
  "department",
  "issueAuthoriseBy",
  "designation",
] as const;

const requiredStoreItemFields = [
  "articles",
  "denominationOfQty",
  "qtyDemanded",
  "qtyIssued",
  "rate",
  "amount",
  "ledgerFolio",
  "remarks",
] as const;

// --- Types ---
type StoreItemKey = (typeof requiredStoreItemFields)[number];

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
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: StoreIssueVoucherForm;
  enableInputList?: string[];
  vissibleSections?: Array<"addMore" | string>;
  onSubmit: (data: StoreIssueVoucherForm, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
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
  mode = "new",
  responseTypes = [""],
  loading = false,
  setLoading,
}) => {
  const componentRef = useRef<HTMLElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();

  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [formData, setFormData] =
    useState<StoreIssueVoucherForm>(formResponses);

  // field-level errors for header fields
  const [errors, setErrors] = useState<Record<string, string | true>>({});
  // row/field-level errors for table
  const [rowErrors, setRowErrors] = useState<
    Record<number | string, Partial<Record<StoreItemKey, true>>>
  >({});

  const [hasErrors, setHasErrors] = useState(false);

  // ---------- helpers for styling (no red unless error) ----------
  const inputClass = (name: string) =>
    [
      "w-full p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs",
      "border",
      errors[name] ? "border-red-600 ring-1 ring-red-300" : "border-gray-300",
    ].join(" ");

  const inputCellClass = (rowId: number | string, field: StoreItemKey) =>
    [
      "w-full p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm",
      "border",
      rowErrors[rowId]?.[field]
        ? "border-red-600 ring-1 ring-red-300"
        : "border-gray-300",
    ].join(" ");

  // ---------- change handlers ----------
  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // clear error on change
    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const { [fieldId]: _omit, ...rest } = prev;
      return rest;
    });
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
    // reset errors on incoming data change
    setErrors({});
    setRowErrors({});
    setHasErrors(false);
  }, [formResponses]);

  const isEnabled = (name: string) => enableInputList.includes(name);

  // ---------- validation ----------
  const validate = () => {
    const nextErrors: Record<string, string | true> = {};
    const nextRowErrors: Record<
      number | string,
      Partial<Record<StoreItemKey, true>>
    > = {};

    // header/summary required fields (only for enabled fields)
    for (const field of requiredFields) {
      if (isEnabled(field) && !String(formData?.[field] ?? "").trim()) {
        nextErrors[field] = true;
      }
    }

    // table rows rule: each row must be fully empty OR fully filled
    for (const row of storeItems) {
      const rid = row.id ?? Math.random();
      const values = requiredStoreItemFields.map((f) =>
        String(row[f] ?? "").trim()
      );
      const allEmpty = values.every((v) => v === "");
      if (allEmpty) continue; // fine, ignore
      const allFilled = values.every((v) => v !== "");
      if (!allFilled) {
        // mark each missing field as error
        for (const f of requiredStoreItemFields) {
          if (!String(row[f] ?? "").trim()) {
            if (!nextRowErrors[rid]) nextRowErrors[rid] = {};
            nextRowErrors[rid][f] = true;
          }
        }
      }
    }

    setErrors(nextErrors);
    setRowErrors(nextRowErrors);

    const hasAnyErrors =
      Object.keys(nextErrors).length > 0 ||
      Object.keys(nextRowErrors).length > 0;

    setHasErrors(hasAnyErrors);
    return !hasAnyErrors;
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

  const handleStoreItemChange = (
    eventName: keyof StoreItem,
    eventValue: string,
    index: number
  ) => {
    setStoreItems((prevItems) => {
      const updatedItems = [...prevItems];
      const row = { ...updatedItems[index], [eventName]: eventValue };
      updatedItems[index] = row;

      // clear row cell error on change
      const rid = row.id ?? index;
      if (rowErrors[rid]?.[eventName as StoreItemKey]) {
        setRowErrors((prev) => {
          const clone = { ...prev };
          const r = { ...(clone[rid] || {}) };
          delete r[eventName as StoreItemKey];
          if (Object.keys(r).length === 0) {
            delete clone[rid];
          } else {
            clone[rid] = r;
          }
          return clone;
        });
      }
      return updatedItems;
    });
  };

  // ---------- table columns with controlled inputs (so we can style errors) ----------
  const storeColumns = [
    {
      label: "Articles",
      field: "articles" as const,
      renderCell: (
        val: string,
        row: StoreItem,
        idx: number,
        onChange: any,
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
        onChange: any,
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
      label: "Qty. demanded",
      field: "qtyDemanded" as const,
      renderCell: (
        val: string,
        row: StoreItem,
        idx: number,
        onChange: any,
        disabled: boolean
      ) => (
        <input
          type="text"
          value={val ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={inputCellClass(row.id ?? idx, "qtyDemanded")}
        />
      ),
      isDisabled: () => !isEnabled("qtyDemanded"),
    },
    {
      label: "Qty. issued",
      field: "qtyIssued" as const,
      renderCell: (
        val: string,
        row: StoreItem,
        idx: number,
        onChange: any,
        disabled: boolean
      ) => (
        <input
          type="text"
          value={val ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={inputCellClass(row.id ?? idx, "qtyIssued")}
        />
      ),
      isDisabled: () => !isEnabled("qtyIssued"),
    },
    {
      label: "Rate",
      field: "rate" as const,
      renderCell: (
        val: string,
        row: StoreItem,
        idx: number,
        onChange: any,
        disabled: boolean
      ) => (
        <input
          type="text"
          value={val ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={inputCellClass(row.id ?? idx, "rate")}
        />
      ),
      isDisabled: () => !isEnabled("rate"),
    },
    {
      label: "Amount",
      field: "amount" as const,
      renderCell: (
        val: string,
        row: StoreItem,
        idx: number,
        onChange: any,
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
        onChange: any,
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
    {
      label: "Remarks",
      field: "remarks" as const,
      renderCell: (
        val: string,
        row: StoreItem,
        idx: number,
        onChange: any,
        disabled: boolean
      ) => (
        <input
          type="text"
          value={val ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={inputCellClass(row.id ?? idx, "remarks")}
        />
      ),
      isDisabled: () => !isEnabled("remarks"),
    },
  ];

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
          {isShowOrganizationDetail && (
            <img src={spedLogo} alt="Company Logo" className="h-24" />
          )}
          <div>
            <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-600">
              {isShowOrganizationDetail
                ? user?.organization?.name
                : "Organization Name"}
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
        <div className="my-4">
          <div>
            {/* Unit */}
            <div className="flex flex-col md:flex-row items-start md:items-center mb-2">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-xs font-semibold">Unit: </span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.unit ?? ""}
                  disabled={!isEnabled("unit")}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                  className={inputClass("unit")}
                />
              </div>
            </div>
            {/* Date & SIV No */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-xs font-semibold">Date: </span>
                </div>
                <div className="w-full">
                  <input
                    type="date"
                    disabled={!isEnabled("applicationDate")}
                    value={formData?.applicationDate ?? ""}
                    onChange={(e) =>
                      handleInputChange("applicationDate", e.target.value)
                    }
                    className={inputClass("applicationDate")}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-xs font-semibold">SIV No: </span>
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    value={formData?.sivNo ?? ""}
                    disabled={!isEnabled("sivNo")}
                    onChange={(e) => handleInputChange("sivNo", e.target.value)}
                    className={inputClass("sivNo")}
                  />
                </div>
              </div>
            </div>
            {/* Department */}
            <div className="flex flex-col md:flex-row items-start md:items-center mb-2">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-xs font-semibold">Department: </span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.department ?? ""}
                  disabled={!isEnabled("department")}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  className={inputClass("department")}
                />
              </div>
            </div>
            {/* Authorised By & Designation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-xs font-semibold">Authorised By: </span>
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    value={formData?.issueAuthoriseBy ?? ""}
                    disabled={!isEnabled("issueAuthoriseBy")}
                    onChange={(e) =>
                      handleInputChange("issueAuthoriseBy", e.target.value)
                    }
                    className={inputClass("issueAuthoriseBy")}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-xs font-semibold">Designation: </span>
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    value={formData?.designation ?? ""}
                    disabled={!isEnabled("designation")}
                    onChange={(e) =>
                      handleInputChange("designation", e.target.value)
                    }
                    className={inputClass("designation")}
                  />
                </div>
              </div>
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
              label="Request"
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

        <div className="bg-yellow-50 p-4 rounded-lg mb-2">
          <p className="text-yellow-800 text-xs">
            Original and Duplicate for cards & Ledger Posting, Triplicate to the
            Department of use and Quadruplicate remains in the book.
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

export default StoreIssueVoucher;
