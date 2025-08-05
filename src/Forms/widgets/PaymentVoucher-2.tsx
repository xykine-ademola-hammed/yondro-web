import React from "react";

const PaymentVoucher = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        {/* Header with Logo and Title */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <img
              src="https://via.placeholder.com/150x50?text=Company+Logo"
              alt="Company Logo"
              className="h-12"
            />
            <h2 className="text-sm text-gray-600">Company Name</h2>
            <p className="text-xs text-gray-500">
              123 Business St, City, Country
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-800">
              PAYMENT VOUCHER
            </h1>
            <div className="mt-2">
              <p className="text-sm">
                <span className="font-semibold">Voucher No:</span> PV-001
              </p>
              <p className="text-sm">
                <span className="font-semibold">Date:</span> August 01, 2025
              </p>
            </div>
          </div>
        </div>

        {/* Payee Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Payee Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Payee Name
              </label>
              <input
                type="text"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Payee Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Address
              </label>
              <input
                type="text"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Address"
              />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Payment Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Amount
              </label>
              <input
                type="number"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Payment Method
              </label>
              <select className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Payment Method</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600">
              Description
            </label>
            <textarea
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Enter Payment Description"
            ></textarea>
          </div>
        </div>

        {/* Approval Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Approval</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Prepared By
              </label>
              <input
                type="text"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Approved By
              </label>
              <input
                type="text"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Name"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
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
