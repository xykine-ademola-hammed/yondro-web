import DepartmentPage from "./Department";
import PositionPage from "./Position";
import AllEmployee from "./Employee";
import { useState } from "react";
import { useAuth } from "../GlobalContexts/AuthContext";

export default function Organization() {
  const [activeTab, setActiveTab] = useState("Employee");
  const { user } = useAuth();

  const tabNames = ["Employee", "Position", "Department"];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {user?.organization?.name}
        </h1>
        {/* <p className="text-gray-600">Create and manage workflows.</p> */}
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabNames.map((tabName) => (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === tabName
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tabName}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "Department" && <DepartmentPage />}
        {activeTab === "Position" && <PositionPage />}
        {activeTab === "Employee" && <AllEmployee />}
      </div>
    </div>
  );
}
