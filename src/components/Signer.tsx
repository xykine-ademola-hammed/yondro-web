import React from "react";

interface SignerProps {
  firstName?: string;
  lastName?: string;
  position?: string;
  department?: string;
  date?: string;
  label?: string;
}

const Signer: React.FC<SignerProps> = ({
  firstName,
  lastName,
  position,
  department,
  date,
  label,
}) => {
  return (
    <div className="max-w-sm w-full bg-white rounded shadow-md border border-gray-200 p-2 hover:shadow-lg transition-shadow">
      <div className="flex flex-col items-center text-center">
        {/* Name */}
        <h2 className="text-xs font-semibold text-gray-800">
          {firstName} {lastName}
        </h2>

        {/* Position & Department */}
        <p className="text-[10px] text-gray-700 mt-1">{position}</p>
        <p className="text-[10px] text-gray-700">
          {department} {date}
        </p>

        {/* Divider */}
        <div className="w-full border-t border-gray-200 my-1"></div>

        {/* Date */}
        <p className="text-xs text-gray-500 italic">{label}</p>
      </div>
    </div>
  );
};

export default Signer;
