import React, {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/hooks/useDownloadPdf";
import Signer from "../../components/Signer";
import { getFinanceCode } from "../../common/methods";
import spedLogo from "../../assets/spedLogo.png";
import FormActions from "./FormActions";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import type { EmployeeOption } from "./PaymentVoucher-semi-auto";

interface Requestor {
  firstName?: string;
  lastName?: string;
  date?: string;
  department?: string;
  position?: string;
}

interface Approver {
  firstName: string;
  lastName: string;
  date?: string;
  department?: string;
  position?: string;
  label?: string;
}

interface DutyTourExpenseForm {
  date: string;
  location?: string;
  description?: string;
  recommendationNotes?: string;
  requestorDeligation?: string;
  requestor?: Requestor;
  approvers?: Approver[];
  // for compatibility with spread
  [key: string]: any;
}

interface DutyTourExpenseProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: Partial<DutyTourExpenseForm>;
  enableInputList?: string[];
  trigerVoucherCreation: boolean;
  vissibleSections?: string[];
  onSubmit: (data: DutyTourExpenseForm, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
}

const requiredFields: (keyof DutyTourExpenseForm)[] = [
  "requestorDeligation",
  "date",
  "location",
  "description",
];

const DutyTourExpense: React.FC<DutyTourExpenseProps> = ({
  formResponses,
  enableInputList = [""],
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "new",
  responseTypes = [""],
  trigerVoucherCreation,
  loading,
  setLoading,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();
  const [hasErrors, setHasErrors] = useState<boolean>(false);

  const [formData, setFormData] = useState<DutyTourExpenseForm>({
    date: moment(new Date()).format("YYYY-MM-DD"),
    requestorDeligation: getFinanceCode(user),
    ...formResponses,
  });

  const { userDepartmenttMembers } = useOrganization();

  // Type safety for employee options
  const employeeOptions: EmployeeOption[] =
    (userDepartmenttMembers?.rows?.map((employee: any) => ({
      id: employee.id,
      value: employee.id,
      label: `${employee.firstName} - ${employee.lastName} `,
    })) as EmployeeOption[]) ?? [];

  // Handle text, textarea, and date inputs
  const handleInputChange = (
    fieldId: keyof DutyTourExpenseForm,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...formResponses,
    }));
  }, [formResponses]);

  const isEnabled = (name: string) => enableInputList.includes(name);

  // Validation: check enabled required fields
  const checkIsValid = () => {
    const required = [];
    for (let enableField of enableInputList) {
      if (requiredFields.includes(enableField) && !formData?.[enableField])
        required.push(enableField);
    }

    return !!required.length;
  };

  const handleSubmit = (status: string) => {
    if (!checkIsValid()) {
      setLoading(true);
      onSubmit(formData, status);
      // Reset only non-default fields
      // setFormData({
      //   date: moment(new Date()).format("YYYY-MM-DD"),
      //   requestorDeligation: getFinanceCode(user),
      // });
      setHasErrors(false);
    } else {
      setHasErrors(true);
    }
  };

  const handleCancel = () => {
    setFormData({
      date: moment(new Date()).format("YYYY-MM-DD"),
      requestorDeligation: getFinanceCode(user),
    });
    onCancel();
  };

  return (
    <div>
      <div className="flex justify-end items-end ">
        <button
          className="px-2 py-1 bg-blue-900 text-white rounded"
          onClick={() =>
            downloadPdf(componentRef as RefObject<HTMLElement>, {
              fileName: "job-maintenance-requisition.pdf",
              orientation: "portrait",
              format: "a4",
              margin: 10,
              scale: 1,
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
        ref={componentRef}
        className="bg-white rounded-lg sm:p-2 w-full max-w-4xl"
      >
        <div className="flex gap-4 mb-4 sm:mb-0">
          <img src={spedLogo} alt="Company Logo" className="h-24" />
          <div>
            <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-600">
              {user?.organization?.name}
            </h2>
            <h1 className="text-xl sm:text-2xl  text-center text-gray-500">
              Duty Tour Expense Form
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

        <p className="mt-4">PART A </p>
        <>
          <div className="">
            <div className="mb-1 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-sm ">Name of Officer:</span>
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    value={formData?.officerName ?? ""}
                    disabled={!isEnabled("officerName")}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("officerName", e.target.value)
                    }
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("officerName")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-sm ">Phone number:</span>
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    value={formData?.phone ?? ""}
                    disabled={!isEnabled("phone")}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("phone", e.target.value)
                    }
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("phone") ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                  />
                </div>
              </div>
            </div>

            <div className="">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-5">
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                    <span className="text-sm ">Rank:</span>
                  </div>
                  <div className="w-full">
                    <input
                      type="text"
                      value={formData?.rank ?? ""}
                      disabled={!isEnabled("rank")}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("rank", e.target.value)
                      }
                      className={`w-full p-1 border ${
                        isEnabled("rank") ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                    <span className="text-sm ">CONTEDISS/CONPCASS</span>
                  </div>
                  <div className="w-full">
                    <input
                      type="text"
                      value={formData?.contedisConpcass}
                      disabled={!isEnabled("contedisConpcass")}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("contedisConpcass", e.target.value)
                      }
                      className={`w-full p-1 border ${
                        isEnabled("contedisConpcass")
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="">
            <h3 className="text-sm text-gray-700">Purpose of Tour</h3>
            <div>
              <textarea
                name="purpose"
                id="purpose"
                value={formData?.purpose || ""}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("purpose", e.target.value)
                }
                disabled={!isEnabled("purpose")}
                className={`mt-0 w-full p-1 border ${
                  isEnabled("purpose") ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                rows={3}
              ></textarea>
            </div>
          </div>

          <div className=" flex flex-col md:flex-row items-start md:items-center">
            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">Place(s) of travel:</span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.travelLocation}
                disabled={!isEnabled("travelLocation")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("travelLocation", e.target.value)
                }
                className={`w-full p-1 border ${
                  isEnabled("travelLocation")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              />
            </div>
          </div>

          <div className=" my-1 flex flex-col md:flex-row items-start md:items-center">
            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">Period of Tour:</span>
            </div>
            <div className="flex gap-1 w-full">
              <input
                type="date"
                value={formData?.startDate}
                disabled={!isEnabled("startDate")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("startDate", e.target.value)
                }
                className={`w-full p-1 border ${
                  isEnabled("startDate") ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              />
              <span>To</span>
              <input
                type="date"
                value={formData?.endDate}
                disabled={!isEnabled("endDate")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("endDate", e.target.value)
                }
                className={`w-full p-1 border ${
                  isEnabled("endDate") ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              />
            </div>
          </div>

          <div className=" flex flex-col md:flex-row items-start md:items-center">
            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">Tranport mode specify:</span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.travelMode}
                disabled={!isEnabled("travelMode")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("travelMode", e.target.value)
                }
                className={`w-full p-1 border ${
                  isEnabled("travelMode") ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                placeholder="Road, Air, Sea, Rail"
              />
            </div>
          </div>
        </>

        <p className="mt-4">PART B </p>
        <div className="border p-2 rounded border-gray-300">
          <div className=" grid grid-cols-2 gap-1">
            <div className="mb-0 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">Estimated Transport Cost:</span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.estimatedTransportCost}
                disabled={!isEnabled("estimatedTransportCost")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("estimatedTransportCost", e.target.value)
                }
                className={`w-full p-1 border ${
                  isEnabled("estimatedTransportCost")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              />
            </div>

            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">Estimated Night Allowance:</span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.estimatedNight}
                disabled={!isEnabled("estimatedNight")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("estimatedNight", e.target.value)
                }
                className={`w-full p-1 border ${
                  isEnabled("estimatedNight")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                placeholder="....Days X N......"
              />
            </div>

            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">
                Other(s) (If Applicable) Specify:
              </span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.others}
                disabled={!isEnabled("others")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("others", e.target.value)
                }
                className={`w-full p-1 border ${
                  isEnabled("others") ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              />
            </div>

            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">Total:</span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.totalEstimate}
                disabled={!isEnabled("totalEstimate")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("totalEstimate", e.target.value)
                }
                className={`w-full p-1 border ${
                  isEnabled("totalEstimate")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              />
            </div>
          </div>

          <div>
            <h3 className="text-l  text-gray-700 mb-1">Total in words:</h3>
            <div>
              <textarea
                name="totalInWord"
                id="totalInWord"
                value={formData?.totalInWord || ""}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("totalInWord", e.target.value)
                }
                disabled={!isEnabled("totalInWord")}
                className={`mt-1 w-full p-1 border ${
                  isEnabled("totalInWord")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                rows={2}
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">Bank:</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.bank ?? ""}
                  disabled={!isEnabled("bank")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("bank", e.target.value)
                  }
                  className={`mt-1 w-full p-1 border ${
                    isEnabled("bank") ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">Account number:</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.accountNumber ?? ""}
                  disabled={!isEnabled("accountNumber")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("accountNumber", e.target.value)
                  }
                  className={`mt-1 w-full p-1 border ${
                    isEnabled("accountNumber")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4">PART C </p>
        <div className="border p-2 rounded border-gray-300">
          <h3 className="text-sm">Provost Approval for Expenditure </h3>
          <div>
            <div className="flex gap-2">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">Sum of ammount (in figure):</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.amountApproveFigure}
                  disabled={!isEnabled("amountApproveFigure")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("amountApproveFigure", e.target.value)
                  }
                  className={`w-full p-1 border ${
                    isEnabled("amountApproveFigure")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">Approve Ammount (in word):</span>
              </div>
              <div className="w-full">
                <textarea
                  name="amountApproveWord"
                  id="amountApproveWord"
                  value={formData?.amountApproveWord || ""}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("amountApproveWord", e.target.value)
                  }
                  disabled={!isEnabled("amountApproveWord")}
                  className={`mt-1 w-full p-1 border ${
                    isEnabled("amountApproveWord")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                  rows={2}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {trigerVoucherCreation && (
          <div className="mt-2">
            <h3 className="text-l font-semibold text-gray-700 mb-1">
              Voucher Approval
            </h3>
            <div className="p-1 border rounded-lg border-gray-200">
              <div className="">
                <label className=" text-sm font-medium text-gray-600">
                  Head of Unit [Voucher]
                </label>
                <select
                  name="unitVoucherHeadById"
                  id="unitVoucherHeadById"
                  value={formData?.unitVoucherHeadById ?? ""}
                  onChange={(e) =>
                    handleInputChange("unitVoucherHeadById", e.target.value)
                  }
                  required
                  className={`mt-0 w-full p-1 border ${
                    isEnabled("unitVoucherHeadById")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select an option</option>
                  {employeeOptions?.map((employee) => (
                    <option key={employee.id} value={employee.value}>
                      {employee.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

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

          {(formData?.approvers || []).map((approver, idx) => (
            <Signer
              key={idx}
              firstName={approver.firstName}
              lastName={approver.lastName}
              date={approver.date}
              department={approver.department}
              position={approver.position}
              label={approver.label}
            />
          ))}
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

export default DutyTourExpense;
