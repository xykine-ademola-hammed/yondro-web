import React, { useEffect, useRef, useState } from "react";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/useDownloadPdf";
import Signer from "../../components/Signer";
import { getFinanceCode } from "../../common/methods";
import spedLogo from "../../assets/spedLogo.png";

const formatDate = (date: Date) => moment(date).format("DD-MM-YYYY");

const requiredFields = ["requestorDeligation"];

const ProcurementOrder = ({
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

  const [storeItems, setStoreItems] = useState([]);
  const [hasErrors, setHasErrors] = useState(false);

  const { userDepartmenttMembers } = useOrganization();
  const employeeOptions = userDepartmenttMembers.rows.map((employee) => ({
    id: employee.id,
    value: employee.id,
    label: `${employee.firstName} - ${employee.lastName} `,
  }));

  const [formData, setFormData] = useState({
    requestorDeligation: getFinanceCode(user),
    ...formResponses,
  });

  const handleInputChange = (fieldId: number | string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const addMoreRow = () => {
    setStoreItems((prev) => [
      ...prev,
      {
        articles: "",
        denominationOfQty: "",
        qtyReceived: "",
        unitPrice: "",
        amount: "",
        ledgerFolio: "",
      },
    ]);
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...formResponses }));
    if (formResponses?.storeItems) {
      setStoreItems(formResponses?.storeItems);
    } else {
      setStoreItems([{}, {}, {}]);
    }
  }, [formResponses]);

  useEffect(() => {
    if (mode === "preview") {
      setStoreItems([
        {
          articles: "",
          denominationOfQty: "",
          qtyReceived: "",
          unitPrice: "",
          amount: "",
          ledgerFolio: "",
        },
        {
          articles: "",
          denominationOfQty: "",
          qtyReceived: "",
          unitPrice: "",
          amount: "",
          ledgerFolio: "",
        },
        {
          articles: "",
          denominationOfQty: "",
          qtyReceived: "",
          unitPrice: "",
          amount: "",
          ledgerFolio: "",
        },
        {
          articles: "",
          denominationOfQty: "",
          qtyReceived: "",
          unitPrice: "",
          amount: "",
          ledgerFolio: "",
        },
      ]);
    }
  }, [mode]);

  const isEnabled = (name: string) => enableInputList.includes(name);

  const checkIsValid = () => {
    const required = [];
    for (let enableField of enableInputList) {
      if (requiredFields.includes(enableField) && !formData?.[enableField])
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
    eventName: any,
    eventValue: any,
    index: number
  ) => {
    // Assuming storeItems is kept in state as an array
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
            downloadPdf(componentRef, {
              fileName: "payment-voucher.pdf",
              orientation: "portrait",
              format: "a4",
              margin: 24,
              scale: 2,
              hideSelectors: ["[data-export-hide]"], // hide buttons during capture
              onBeforeCapture: () => {
                // e.g., switch your form to preview/read-only mode
              },
              onAfterCapture: () => {
                // e.g., restore edit mode if you changed it
              },
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

        {/* Store Items */}
        <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="pr-5 py-1 text-left text-xs text-gray-500 text-sm"
                  >
                    S/N
                  </th>

                  <th
                    scope="col"
                    className="pr-125 py-1 text-left text-xs text-gray-500 text-sm"
                  >
                    Items
                  </th>

                  <th
                    scope="col"
                    className="px-1 py-1 text-left text-xs text-gray-500 text-sm"
                  >
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {storeItems?.map((item, index) => (
                  <tr key={item.id}>
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
              value={formData?.additionalNotes}
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
            ></textarea>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-20 ">
          <Signer
            firstName={formData?.requestor?.firstName || user?.firstName}
            lastName={formData?.requestor?.lastName || user?.lastName}
            date={
              formData?.requestor?.date ||
              moment(new Date()).format("DD/MM/YYYY")
            }
            department={
              formData?.requestor?.department || user?.department?.name
            }
            position={formData?.requestor?.position || user?.position?.title}
            label="Request by"
          />

          {formData?.approvers?.map((approver) => (
            <Signer
              firstName={approver.lastName}
              lastName={approver.firstName}
              date={approver.date}
              department={approver.department}
              position={approver.position}
              label={approver.label}
            />
          ))}
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

export default ProcurementOrder;
