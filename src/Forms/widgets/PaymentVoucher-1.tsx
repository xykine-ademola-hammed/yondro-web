import React, { useEffect, useState } from "react";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";

export interface PaymentDetail {
  paymentDate: Date;
  paymentParticles: string;
  ammount: number;
}

export interface applicantDetail {
  applicantName: string;
  applicantAddress: string;
  applicantDescription: string;
}

export interface EntryDistribution {
  accountTitle: string;
  accountCodeNo: string;
  debitAmmount: string;
  debitDescription: string;
  creditAmmount: string;
  creditDescription: string;
}

export interface PersonnelType {
  id: number;
  name: number;
  positionName: string;
  date: Date;
}

export interface VoucherPersonnels {
  headOfUnit: PersonnelType;
  preparedBy: PersonnelType;
  reviewedBy: PersonnelType;
  approvedBy: PersonnelType;
  unitHeadBy: PersonnelType;
}

export interface AuditUnitPersonnels {
  checkedBy: PersonnelType;
  preparedBy: PersonnelType;
  reviewedBy: PersonnelType;
  approvedBy: PersonnelType;
}

export interface AuditRemark {
  pass: string;
  query: string;
}

export interface paymentVoucherDataType {
  voucherNo: string;
  departmentCode: string;
  applicationDate: Date;
  applicantDetail: applicantDetail;
  paymentDetails: PaymentDetail[];
  ammountInWord: string;
  entryDistribution: EntryDistribution;
  voucherPersonnels: VoucherPersonnels;
  auditUnitPersonnels: AuditUnitPersonnels;
  auditRemark: AuditRemark;
  additionalNotes: string[];
}

const formatDate = (date: Date) => moment(date).format("DD-MM-YYYY");

const PaymentVoucher = ({
  paymentVoucherData,
  enableInputList = [""],
  onFormResponses,
}) => {
  console.log("-------paymentVoucherData---------", paymentVoucherData);
  console.log("-------enableInputList---------", enableInputList);
  const { user } = useAuth();
  const { userDepartmenttMembers } = useOrganization();
  const employeeOptions = userDepartmenttMembers.rows.map((employee) => ({
    id: employee.id,
    value: employee.id,
    label: `${employee.firstName} - ${employee.lastName} `,
  }));

  const [formData, setFormData] =
    useState<paymentVoucherDataType>(paymentVoucherData);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log("----------NAME--VALUE----", name, value);
    setFormData((prevData) => {
      const keys = name.split("_");
      if (keys.length > 1) {
        const [field, index] = keys;
        return {
          ...prevData,
          paymentDetails: prevData.paymentDetails.map((detail, i) =>
            i === parseInt(index) ? { ...detail, [field]: value } : detail
          ),
        };
      }
      return { ...prevData, [name]: value };
    });

    onFormResponses((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setFormData(paymentVoucherData);
  }, [paymentVoucherData]);

  const isEnabled = (name: string) => enableInputList.includes(name);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start">
      <div className="bg-white rounded-lg sm:p-8 w-full max-w-4xl">
        <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-600">
          {user?.organization?.name}
        </h2>
        <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-500">
          PAYMENT VOUCHER
        </h1>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start mt-4">
          <div className="mb-4 sm:mb-0">
            <img
              src="https://via.placeholder.com/150x50?text=Company+Logo"
              alt="Company Logo"
              className="h-12"
            />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">
              Voucher No:{" "}
              <span className="font-normal">{formData?.voucherNo}</span>
            </p>

            <p className="text-sm font-semibold">
              Department Code:{" "}
              <span className="font-normal">{formData?.departmentCode}</span>
            </p>

            <p className="text-sm font-semibold">
              Date:{" "}
              <span className="font-normal">
                {formatDate(formData?.applicationDate)}
              </span>
            </p>
          </div>
        </div>

        {/* Payee and Payment Details */}
        <div className="border-t border-gray-300 pt-4 mt-4">
          <h3 className="text-l font-semibold text-gray-700 mb-1">
            Applicant Information
          </h3>
          <div className="p-2 border rounded-lg border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Name
              </label>
              <input
                name="applicantName"
                id="applicantName"
                value={formData?.applicantName}
                onChange={handleInput}
                type="text"
                disabled={!isEnabled("applicantName")}
                className={`mt-1 w-full p-1 border ${
                  isEnabled("applicantName")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Address
              </label>
              <input
                name="applicantAddress"
                id="applicantAddress"
                value={formData?.applicantAddress}
                onChange={handleInput}
                type="text"
                disabled={!isEnabled("applicantAddress")}
                className={`mt-1 w-full p-1 border ${
                  isEnabled("applicantAddress")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder=""
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Request detail
              </label>

              <textarea
                name="applicantDescription"
                id="applicantDescription"
                value={formData?.applicantDescription}
                onChange={handleInput}
                disabled={!isEnabled("applicantDescription")}
                className={`mt-1 w-full p-1 border ${
                  isEnabled("applicantDescription")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                rows={2}
                placeholder="Enter Description"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Payment Detail */}
        <div className="mt-4">
          <div className="flex w-full justify-between items-center">
            <h3 className="text-l font-semibold text-gray-700  mb-1">
              Payment Details
            </h3>

            <button
              type="button"
              onClick={() => {
                // setSelectedStageIndex(formData?.stages.length);
                // setSelectedStage(emptyStageData);
                // setIsOpenStageModal(true);
              }}
              className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200 cursor-pointer"
            >
              Add Detail
            </button>
          </div>

          <div className="p-2 border rounded-lg border-gray-200">
            {formData?.paymentDetails?.map(
              (paymentDetail: PaymentDetail, index: number) => (
                <div
                  className="grid grid-cols-1 sm:grid-cols-4 gap-1 mb-4 "
                  key={index}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Date
                    </label>
                    <input
                      name={`paymentDate_${index}`}
                      id={`paymentDate_${index}`}
                      value={moment(paymentDetail?.paymentDate).format(
                        "DD-MM-YYYY"
                      )}
                      onChange={handleInput}
                      type="date"
                      disabled={!isEnabled(`paymentDate_${index}`)}
                      className={`mt-1 w-full p-1 border ${
                        isEnabled(`paymentDate_${index}`)
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter Amount"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Particlars (Including References)
                    </label>
                    <textarea
                      name={`paymentParticles_${index}`}
                      id={`paymentParticles_${index}`}
                      value={paymentDetail?.paymentParticles}
                      onChange={handleInput}
                      disabled={!isEnabled(`paymentParticles_${index}`)}
                      className={`mt-1 w-full p-1 border ${
                        isEnabled(`paymentParticles_${index}`)
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      rows={2}
                      placeholder="Enter Payment Description"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Amount
                    </label>
                    <input
                      name={`ammount_${index}`}
                      id={`ammount_${index}`}
                      value={paymentDetail?.ammount}
                      onChange={handleInput}
                      type="number"
                      disabled={!isEnabled(`ammount_${index}`)}
                      className={`mt-1 w-full p-1 border ${
                        isEnabled(`ammount_${index}`)
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter Amount"
                    />
                  </div>
                </div>
              )
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Ammount in words
              </label>
              <input
                name="ammountInWord"
                id="ammountInWord"
                value={formData?.ammountInWord}
                onChange={handleInput}
                disabled={!isEnabled("ammountInWord")}
                className={`mt-1 w-full p-1 border ${
                  isEnabled("ammountInWord")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                type="text"
                placeholder=""
              />
            </div>
          </div>
        </div>

        {/* Entry Distribution */}
        <div className="mt-4">
          <div className="flex w-full justify-between items-center">
            <h3 className="text-l font-semibold text-gray-700  mb-1">
              Entry Distribution
            </h3>
          </div>

          <div className="p-2 border rounded-lg border-gray-200">
            <div className="">
              <div className="flex flex-col sm:flex-row w-full gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Account Title
                  </label>
                  <input
                    name="accountTitle"
                    id="accountTitle"
                    value={formData?.entryDistribution?.accountTitle}
                    onChange={handleInput}
                    disabled={!isEnabled("accountTitle")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("accountTitle")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    type="text"
                    placeholder=""
                  />
                </div>

                <div className="">
                  <label className="block text-sm font-medium text-gray-600">
                    Account Code No.
                  </label>
                  <input
                    name="accountCodeNo"
                    id="accountCodeNo"
                    value={formData?.entryDistribution?.accountCodeNo}
                    onChange={handleInput}
                    disabled={!isEnabled("accountCodeNo")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("accountCodeNo")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    type="text"
                    placeholder=""
                  />
                </div>
              </div>

              <div className="col-span-2 mt-1">
                <label className="block text-sm font-medium text-gray-600">
                  Amount
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-2 border border-gray-200">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Debit
                    </label>
                    <div className="flex gap-2">
                      <input
                        name="debitAmmount"
                        id="debitAmmount"
                        value={formData?.entryDistribution?.debitAmmount}
                        onChange={handleInput}
                        disabled={!isEnabled("debitAmmount")}
                        className={`mt-1 w-full p-1 border ${
                          isEnabled("debitAmmount")
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        type="number"
                        placeholder=""
                      />
                      <input
                        name="debitDescription"
                        id="debitDescription"
                        value={formData?.entryDistribution?.debitDescription}
                        onChange={handleInput}
                        disabled={!isEnabled("debitDescription")}
                        className={`mt-1 w-full p-1 border ${
                          isEnabled("debitDescription")
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        type="number"
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Credit
                    </label>
                    <div className="flex gap-2">
                      <input
                        name="creditAmmount"
                        id="creditAmmount"
                        value={formData?.entryDistribution?.creditAmmount}
                        onChange={handleInput}
                        disabled={!isEnabled("creditAmmount")}
                        className={`mt-1 w-full p-1 border ${
                          isEnabled("creditAmmount")
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        type="number"
                        placeholder=""
                      />
                      <input
                        name="creditDescription"
                        id="creditDescription"
                        value={formData?.entryDistribution?.creditDescription}
                        onChange={handleInput}
                        disabled={!isEnabled("creditDescription")}
                        className={`mt-1 w-full p-1 border ${
                          isEnabled("creditDescription")
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        type="number"
                        placeholder=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approval */}
        <div className="mt-4 ">
          <h3 className="text-l font-semibold text-gray-700 mb-1">
            Voucher Approval
          </h3>
          <div className="p-2 border rounded-lg border-gray-200">
            <div className="">
              <label className=" text-sm font-medium text-gray-600">
                Head of Unit [Voucher]
              </label>

              <select
                name="unitVoucherHeadById"
                id="unitVoucherHeadById"
                value={formData?.unitVoucherHeadById}
                onChange={handleInput}
                required
                disabled={!isEnabled("unitVoucherHeadById")}
                className={`mt-1 w-full p-1 border ${
                  isEnabled("unitVoucherHeadById")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select an option</option>
                {employeeOptions?.map((employee, idx) => (
                  <option key={employee.id} value={employee.value}>
                    {employee.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Prepared By
                </label>

                <select
                  name="preparedById"
                  id="preparedById"
                  value={formData?.preparedById}
                  onChange={handleInput}
                  required
                  disabled={!isEnabled("preparedById")}
                  className={`mt-1 w-full p-1 border ${
                    isEnabled("preparedById")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select an option</option>
                  {employeeOptions?.map((employee, idx) => (
                    <option key={employee.id} value={employee.value}>
                      {employee.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Reviewed By
                </label>

                <select
                  name="reviewedById"
                  id="reviewedById"
                  value={formData?.reviewedById}
                  onChange={handleInput}
                  required
                  disabled={!isEnabled("reviewedById")}
                  className={`mt-1 w-full p-1 border ${
                    isEnabled("reviewedById")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select an option</option>
                  {employeeOptions?.map((employee, idx) => (
                    <option key={employee.id} value={employee.value}>
                      {employee.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Approved By
                </label>

                <select
                  name="approvedById"
                  id="approvedById"
                  value={formData?.approvedById}
                  onChange={handleInput}
                  required
                  disabled={!isEnabled("approvedById")}
                  className={`mt-1 w-full p-1 border ${
                    isEnabled("approvedById")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select an option</option>
                  {employeeOptions?.map((employee, idx) => (
                    <option key={employee.id} value={employee.value}>
                      {employee.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Audit and Central Pay Officer Details */}
        <div className="mt-4 ">
          <h3 className="text-l font-semibold text-gray-700 mb-1">
            Audit and Central Pay Officer Details
          </h3>
          <div className="flex flex-col sm:flex-row p-2 border rounded-lg border-gray-200 gap-2">
            <div className="flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Checked by:
                </label>
                <div className="flex gap-2">
                  <select
                    name="auditCheckedById"
                    id="auditCheckedById"
                    value={formData?.voucherPersonnels?.approvedBy?.id}
                    onChange={handleInput}
                    required
                    disabled={!isEnabled("auditCheckedById")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("auditCheckedById")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select an option</option>
                    {employeeOptions?.map((employee, idx) => (
                      <option key={employee.id} value={employee.value}>
                        {employee.label}
                      </option>
                    ))}
                  </select>

                  <input
                    name="auditCheckedByDate"
                    id="auditCheckedByDate"
                    value={formatDate(
                      formData?.auditUnitPersonnels?.checkedBy?.date
                    )}
                    onChange={handleInput}
                    disabled={!isEnabled("auditCheckedByDate")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("auditCheckedByDate")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    type="date"
                    placeholder=""
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-600">
                  Pass
                </label>
                <div>
                  <textarea
                    name="auditRemarkPass"
                    id="auditRemarkPass"
                    value={formData?.auditRemark?.pass}
                    onChange={handleInput}
                    disabled={!isEnabled("auditRemarkPass")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("auditRemarkPass")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows={2}
                    placeholder="Enter Additional Notes or Comments"
                  ></textarea>
                </div>
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-600">
                  Query
                </label>
                <div>
                  <textarea
                    name="auditRemarkQuery"
                    id="auditRemarkQuery"
                    value={formData?.auditRemark?.query}
                    onChange={handleInput}
                    disabled={!isEnabled("auditRemarkQuery")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("auditRemarkQuery")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows={2}
                    placeholder="Enter Additional Notes or Comments"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex-1 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Prepared By
                </label>
                <div className="flex gap-2">
                  <select
                    name="auditPreparedById"
                    id="auditPreparedById"
                    value={formData?.voucherPersonnels?.approvedBy?.id}
                    onChange={handleInput}
                    required
                    disabled={!isEnabled("auditPreparedById")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("auditPreparedById")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select an option</option>
                    {employeeOptions?.map((employee, idx) => (
                      <option key={employee.id} value={employee.value}>
                        {employee.label}
                      </option>
                    ))}
                  </select>

                  <input
                    name="auditPreparedByDate"
                    id="auditPreparedByDate"
                    value={formatDate(
                      formData?.auditUnitPersonnels?.preparedBy?.date
                    )}
                    onChange={handleInput}
                    disabled={!isEnabled("auditPreparedByDate")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("auditPreparedByDate")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    type="date"
                    placeholder=""
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-600">
                  Reviewed By
                </label>
                <div className="flex gap-2">
                  <select
                    name="auditReviewedById"
                    id="auditReviewedById"
                    value={formData?.voucherPersonnels?.approvedBy?.id}
                    onChange={handleInput}
                    required
                    disabled={!isEnabled("auditReviewedById")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("auditReviewedById")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select an option</option>
                    {employeeOptions?.map((employee, idx) => (
                      <option key={employee.id} value={employee.value}>
                        {employee.label}
                      </option>
                    ))}
                  </select>

                  <input
                    name="auditReviewedByDate"
                    id="auditReviewedByDate"
                    value={formatDate(
                      formData?.auditUnitPersonnels?.reviewedBy?.date
                    )}
                    onChange={handleInput}
                    disabled={!isEnabled("auditReviewedByDate")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("auditReviewedByDate")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    type="date"
                    placeholder=""
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-600">
                  Approved By
                </label>
                <div className="flex gap-2">
                  <select
                    name="auditApprovedById"
                    id="auditApprovedById"
                    value={formData?.voucherPersonnels?.approvedBy?.id}
                    onChange={handleInput}
                    required
                    disabled={!isEnabled("auditApprovedById")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("auditApprovedById")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select an option</option>
                    {employeeOptions?.map((employee, idx) => (
                      <option key={employee.id} value={employee.value}>
                        {employee.label}
                      </option>
                    ))}
                  </select>

                  <input
                    name="auditApprovedByDate"
                    id="auditApprovedByDate"
                    value={formatDate(
                      formData?.auditUnitPersonnels?.approvedBy?.date
                    )}
                    onChange={handleInput}
                    disabled={!isEnabled("auditApprovedByDate")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("auditApprovedByDate")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    type="date"
                    placeholder=""
                  />
                </div>
              </div>
            </div>
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
              value={formData?.additionalNotes?.join(", ")}
              onChange={handleInput}
              disabled={!isEnabled("additionalNotes")}
              className={`mt-1 w-full p-2 border ${
                isEnabled("additionalNotes")
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows={4}
              placeholder="Enter Additional Notes or Comments"
            ></textarea>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Save Voucher
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentVoucher;
