import { useNavigate } from "react-router-dom";

export default function CreateFormButton() {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate("/forms/new")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer"
      >
        <i className="ri-add-line"></i>
        <span>Create Form</span>
      </button>
    </>
  );
}
