"use client";

import { useNavigate } from "react-router-dom";

export default function CreateWorkflowButton() {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate("/workflows/add-edit/new")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer text-sm sm:text-base"
      >
        <i className="ri-add-line"></i>
        <span>Create Workflow</span>
      </button>
    </>
  );
}
