import React, { useState } from "react";

export default function PaymentVoucherForm() {
  const [form, setForm] = useState({
    pvNo: "",
    departmentCode: "",
    name: "",
    address: "",
    date: "",
    particulars: "",
    amount: "",
    amountWords: "",
    accountTitle: "",
    accountCode: "",
    debitAmount: "",
    creditAmount: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted:", form);
    // Submit logic here
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-6"
    >
      <h2 className="text-2xl font-semibold text-center">Payment Voucher</h2>

      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">PV No.</label>
          <input
            name="pvNo"
            value={form.pvNo}
            onChange={handleChange}
            className="w-full input input-bordered"
          />
        </div>
        <div>
          <label className="block font-medium">Department Code</label>
          <input
            name="departmentCode"
            value={form.departmentCode}
            onChange={handleChange}
            className="w-full input input-bordered"
          />
        </div>
      </div>

      {/* Personal Info */}
      <div>
        <label className="block font-medium">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full input input-bordered"
        />
      </div>
      <div>
        <label className="block font-medium">Address</label>
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full input input-bordered"
        />
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full input input-bordered"
          />
        </div>
        <div>
          <label className="block font-medium">Amount</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full input input-bordered"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium">
          Particulars (Includes References)
        </label>
        <textarea
          name="particulars"
          value={form.particulars}
          onChange={handleChange}
          className="w-full textarea textarea-bordered"
          rows={3}
        ></textarea>
      </div>

      <div>
        <label className="block font-medium">Amount in Words</label>
        <textarea
          name="amountWords"
          value={form.amountWords}
          onChange={handleChange}
          className="w-full textarea textarea-bordered"
          rows={2}
        ></textarea>
      </div>

      {/* Entry Distribution */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Entry Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium">Account Title</label>
            <input
              name="accountTitle"
              value={form.accountTitle}
              onChange={handleChange}
              className="w-full input input-bordered"
            />
          </div>
          <div>
            <label className="block font-medium">Account Code</label>
            <input
              name="accountCode"
              value={form.accountCode}
              onChange={handleChange}
              className="w-full input input-bordered"
            />
          </div>
          <div>
            <label className="block font-medium">Debit Amount</label>
            <input
              name="debitAmount"
              type="number"
              value={form.debitAmount}
              onChange={handleChange}
              className="w-full input input-bordered"
            />
          </div>
          <div>
            <label className="block font-medium">Credit Amount</label>
            <input
              name="creditAmount"
              type="number"
              value={form.creditAmount}
              onChange={handleChange}
              className="w-full input input-bordered"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="text-center">
        <button
          type="submit"
          className="btn btn-primary px-6 py-2 text-white rounded-md"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
