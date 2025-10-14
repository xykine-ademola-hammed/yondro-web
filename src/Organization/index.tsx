import DepartmentPage from "./Department";
import PositionPage from "./Position";
import AllEmployee from "./Employee";
import { useState } from "react";
import { useAuth } from "../GlobalContexts/AuthContext";
import SchoolOfficePage from "./Schools-Offices";

export default function Organization() {
  const [activeTab, setActiveTab] = useState("Staff");
  const { user } = useAuth();
  const storedUser = localStorage.getItem("user");

  const tabNames = ["Staff", "Position", "Department", "Sch|Office"];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {!storedUser
            ? user?.organization?.name
            : JSON.parse(storedUser)?.organization?.name}
        </h1>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 px-6">
          {tabNames.map((tabName) => (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              className={`py-4 pr-1 border-b-2 font-medium text-sm cursor-pointer ${
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
        {activeTab === "Sch|Office" && <SchoolOfficePage />}
        {activeTab === "Department" && <DepartmentPage />}
        {activeTab === "Position" && <PositionPage />}
        {activeTab === "Staff" && <AllEmployee />}
      </div>
    </div>
  );
}
