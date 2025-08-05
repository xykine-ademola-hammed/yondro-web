import React from "react";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { useAuth } from "../../GlobalContexts/AuthContext";

const PaymentVoucher = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start space-y-8">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl">
        <h2 className="text-center text-3xl font-bold text-gray-600">
          {user?.organization?.name}
        </h2>
        <h1 className="text-2xl font-semibold text-center text-gray-500">
          PAYMENT VOUCHER
        </h1>

        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <img
              src="https://via.placeholder.com/150x50?text=Company+Logo"
              alt="Company Logo"
              className="h-12 mb-"
            />

            {/* <p className="text-xs text-gray-500">
              123 Business St, City, Country
            </p>
            <p className="text-xs text-gray-500">Phone: (123) 456-7890</p> */}
            {/* <p className="text-xs text-gray-500">Email: info@company.com</p> */}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">
              Voucher No: <span className="font-normal">PV-001</span>
            </p>

            <p className="text-sm font-semibold">
              Department Code: <span className="font-normal">000405095</span>
            </p>

            <p className="text-sm font-semibold">
              Date: <span className="font-normal">August 01, 2025</span>
            </p>
          </div>
        </div>

        {/* Payee and Payment Details */}
        <div className="border-t border-gray-300 pt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Payee Information
          </h3>
          <div className="p-2 border rounded-lg border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Name
              </label>
              <input
                type="text"
                className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Address
              </label>
              <input
                type="text"
                className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder=""
              />
            </div>
          </div>
        </div>

        {/* Payment Detail */}
        <div className="mt-4">
          <div className="flex w-full justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700  mb-1">
              Payment Details
            </h3>

            <button
              type="button"
              onClick={() => {
                // setSelectedStageIndex(formData.stages.length);
                // setSelectedStage(emptyStageData);
                // setIsOpenStageModal(true);
              }}
              className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200 cursor-pointer"
            >
              Add Detail
            </button>
          </div>

          <div className="p-2 border rounded-lg border-gray-200">
            <div className="grid grid-cols-4 gap-1 mb-4 ">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Date
                </label>
                <input
                  type="date"
                  className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Amount"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600">
                  Particlars (Including References)
                </label>
                <textarea
                  className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Enter Payment Description"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Amount
                </label>
                <input
                  type="number"
                  className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Amount"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Ammount in words
              </label>
              <input
                type="text"
                className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder=""
              />
            </div>
          </div>
        </div>

        {/* Entry Distribution */}
        <div className="mt-4">
          <div className="flex w-full justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700  mb-1">
              Entry Distribution
            </h3>

            {/* <button
              type="button"
              onClick={() => {
                // setSelectedStageIndex(formData.stages.length);
                // setSelectedStage(emptyStageData);
                // setIsOpenStageModal(true);
              }}
              className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200 cursor-pointer"
            >
              Add Detail
            </button> */}
          </div>

          <div className="p-2 border rounded-lg border-gray-200">
            <div className="">
              <div className="flex w-full gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Account Title
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder=""
                  />
                </div>

                <div className="">
                  <label className="block text-sm font-medium text-gray-600">
                    Account Code No.
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder=""
                  />
                </div>
              </div>

              <div className="col-span-2 mt-1">
                <label className="block text-sm font-medium text-gray-600">
                  Amount
                </label>

                <div className="grid grid-cols-4 gap-2 p-2 border border-gray-200">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Debit
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder=""
                      />
                      <input
                        type="number"
                        className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Credit
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder=""
                      />
                      <input
                        type="number"
                        className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approval and Additional Details */}
        <div className="mt-4 ">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Approval</h3>
          <div className="p-2 border rounded-lg border-gray-200">
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Prepared By
                </label>
                <input
                  type="text"
                  className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Reviewed By
                </label>
                <input
                  type="text"
                  className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Approved By
                </label>
                <input
                  type="text"
                  className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
              </div>
            </div>
          </div>
        </div>

        {/* Audit and Central Pay Officer Details */}
        <div className="mt-4 ">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Audit and Central Pay Officer Details
          </h3>
          <div className="flex p-2 border rounded-lg border-gray-200 gap-2">
            <div className="flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Checked by:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder=""
                  />
                  <input
                    type="date"
                    className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
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
                    className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
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
                  <input
                    type="text"
                    className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder=""
                  />
                  <input
                    type="date"
                    className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder=""
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-600">
                  Reviewed By
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder=""
                  />
                  <input
                    type="date"
                    className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder=""
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-600">
                  Approved By
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder=""
                  />
                  <input
                    type="date"
                    className="mt-1 w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder=""
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Additional Notes
          </h3>
          <div>
            <textarea
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
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
