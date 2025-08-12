import React, { useEffect, useState } from "react";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";

export interface PaymentDetail {
  paymentDate: Date;
  paymentParticles: string;
  Amount: number;
}

export interface applicantDetail {
  applicantName: string;
  applicantAddress: string;
  applicantDescription: string;
}

export interface EntryDistribution {
  accountTitle: string;
  accountCodeNo: string;
  debitAmount: string;
  debitDescription: string;
  creditAmount: string;
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
  amountInWord: string;
  entryDistribution: EntryDistribution;
  voucherPersonnels: VoucherPersonnels;
  auditUnitPersonnels: AuditUnitPersonnels;
  auditRemark: AuditRemark;
  additionalNotes: string[];
}

const formatDate = (date: Date) => moment(date).format("DD-MM-YYYY");

const PaymentVoucher = ({
  formResponses,
  enableInputList = [""],
  vissibleSections = [],
  showFormTitle = false,
  instruction = "",
  onSubmit,
  onCancel,
  showActionButtons = false,
}) => {
  const { user } = useAuth();
  const { userDepartmenttMembers, schoolDeans } = useOrganization();
  const employeeOptions = userDepartmenttMembers.rows.map((employee) => ({
    id: employee.id,
    value: employee.id,
    label: `${employee.firstName} - ${employee.lastName} `,
  }));

  const deanOptions = schoolDeans.rows.map((dean) => ({
    id: dean.id,
    value: dean.id,
    label: `${dean.firstName} - ${dean.lastName} `,
  }));

  const [formData, setFormData] =
    useState<paymentVoucherDataType>(formResponses);

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
  };

  useEffect(() => {
    setFormData(formResponses);
  }, [formResponses]);

  const isEnabled = (name: string) => enableInputList.includes(name);

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({} as paymentVoucherDataType);
  };

  const handleCancel = () => {
    setFormData({} as paymentVoucherDataType);
    onCancel();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start">
      <div className="bg-white rounded-lg sm:p-2 w-full max-w-4xl">
        {showFormTitle && (
          <>
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
                  <span className="font-normal">
                    {formData?.departmentCode}
                  </span>
                </p>

                <p className="text-sm font-semibold">
                  Date:{" "}
                  <span className="font-normal">
                    {formatDate(formData?.applicationDate)}
                  </span>
                </p>
              </div>
            </div>
          </>
        )}

        {instruction && (
          <div className="bg-yellow-50 p-4 rounded-lg mb-2">
            <p className="text-yellow-800 text-sm">{instruction}</p>
          </div>
        )}

        {/* Payee and Payment Details */}
        {vissibleSections?.includes("paymentInformation") && (
          <div className="border-gray-300 pt-4 mt-2">
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
        )}

        {/* Payment Detail */}
        {vissibleSections?.includes("paymentDetails") && (
          <div className="mt-4">
            <div className="flex w-full justify-between items-center">
              <h3 className="text-l font-semibold text-gray-700  mb-1">
                Payment Details
              </h3>
            </div>

            <div className="p-2 border rounded-lg border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 mb-4 ">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Date
                  </label>
                  <input
                    name={`paymentDate`}
                    id={`paymentDate`}
                    value={moment(formData?.paymentDate).format("DD-MM-YYYY")}
                    onChange={handleInput}
                    type="date"
                    disabled={!isEnabled(`paymentDate`)}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled(`paymentDate`)
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
                    name={`paymentParticles`}
                    id={`paymentParticles`}
                    value={formData?.paymentParticles}
                    onChange={handleInput}
                    disabled={!isEnabled(`paymentParticles`)}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled(`paymentParticles`)
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
                    name={`paymentDetailAmount`}
                    id={`paymentDetailAmount`}
                    value={formData?.paymentDetailAmount}
                    onChange={handleInput}
                    type="number"
                    disabled={!isEnabled(`Amount`)}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled(`Amount`) ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter Amount"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Amount in words
                </label>
                <input
                  name="amountInWord"
                  id="amountInWord"
                  value={formData?.amountInWord}
                  onChange={handleInput}
                  disabled={!isEnabled("amountInWord")}
                  className={`mt-1 w-full p-1 border ${
                    isEnabled("amountInWord")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  type="text"
                  placeholder=""
                />
              </div>
            </div>
          </div>
        )}

        {/* Entry Distribution */}
        {vissibleSections?.includes("entryDistribution") && (
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
                      value={formData?.accountTitle}
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
                      value={formData?.accountCodeNo}
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
                          name="debitAmount"
                          id="debitAmount"
                          value={formData?.debitAmount}
                          onChange={handleInput}
                          disabled={!isEnabled("debitAmount")}
                          className={`mt-1 w-full p-1 border ${
                            isEnabled("debitAmount")
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          type="number"
                          placeholder=""
                        />
                        <input
                          name="debitDescription"
                          id="debitDescription"
                          value={formData?.debitDescription}
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
                          name="creditAmount"
                          id="creditAmount"
                          value={formData?.creditAmount}
                          onChange={handleInput}
                          disabled={!isEnabled("creditAmount")}
                          className={`mt-1 w-full p-1 border ${
                            isEnabled("creditAmount")
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          type="number"
                          placeholder=""
                        />
                        <input
                          name="creditDescription"
                          id="creditDescription"
                          value={formData?.creditDescription}
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
        )}

        {/* Voucher Approval */}
        {vissibleSections?.includes("voucherApproval") && (
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
        )}

        {/* Audit and Central Pay Officer Details */}
        {vissibleSections?.includes("auditPersonnel") && (
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
                      value={formData?.auditCheckedById}
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
                      value={formatDate(formData?.auditCheckedByDate)}
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
                      value={formData?.auditRemarkPass}
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
                      value={formData?.auditRemarkQuery}
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
                      value={formData?.auditPreparedById}
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
                      value={formatDate(formData?.auditPreparedByDate)}
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
                      value={formData?.auditReviewedById}
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
                      value={formatDate(formData?.auditReviewedByDate)}
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
                      value={formData?.auditApprovedById}
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
                      value={formatDate(formData?.auditApprovedByDate)}
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
        )}

        {vissibleSections?.includes("additionalInformation") && (
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
        )}

        {vissibleSections.includes("approvals") && (
          <div className="mt-4 ">
            <h3 className="text-l font-semibold text-gray-700 mb-1">
              Approvals
            </h3>
            <div className="p-2 border rounded-lg border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
                <div className="">
                  <label className="block text-sm font-medium text-gray-600">
                    Head of Department
                  </label>

                  <select
                    name="departmentHeadById"
                    id="departmentHeadById"
                    value={formData?.departmentHeadById}
                    onChange={handleInput}
                    required
                    disabled={!isEnabled("departmentHeadById")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("departmentHeadById")
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
                    School Dean
                  </label>

                  <select
                    name="schoolDeanById"
                    id="schoolDeanById"
                    value={formData?.schoolDeanById}
                    onChange={handleInput}
                    required
                    disabled={!isEnabled("schoolDeanById")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("schoolDeanById")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select an option</option>
                    {deanOptions?.map((dean, idx) => (
                      <option key={dean.id} value={dean.value}>
                        {dean.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Chief Executive
                  </label>

                  <select
                    name="chiefExecutivedById"
                    id="chiefExecutivedById"
                    value={formData?.chiefExecutivedById}
                    onChange={handleInput}
                    required
                    disabled={!isEnabled("chiefExecutivedById")}
                    className={`mt-1 w-full p-1 border ${
                      isEnabled("chiefExecutivedById")
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
        )}

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

export default PaymentVoucher;
