import DepartmentPage from "./Department";
import PositionPage from "./Position";
import AllEmployee from "./Employee";
import { useState } from "react";
import { useAuth } from "../GlobalContexts/AuthContext";
import SchoolOfficePage from "./Schools-Offices";
import CommitteePage from "./Committee";
import ResponsiveTabs from "../components/ui/ResponsiveTabs";

export default function Organization() {
  const [activeTab, setActiveTab] = useState("Staff");
  const { user } = useAuth();
  const storedUser = localStorage.getItem("user");

  const tabNames = [
    "Staff",
    "Position",
    "Department",
    "Sch|Office",
    "Committee",
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {!storedUser
            ? user?.organization?.name
            : JSON.parse(storedUser)?.organization?.name}
        </h1>
      </div>

      <ResponsiveTabs
        setActiveTab={setActiveTab}
        tabNames={tabNames}
        activeTab={activeTab}
      />

      <div className="p-6">
        {activeTab === "Sch|Office" && <SchoolOfficePage />}
        {activeTab === "Department" && <DepartmentPage />}
        {activeTab === "Position" && <PositionPage />}
        {activeTab === "Staff" && <AllEmployee />}
        {activeTab === "Committee" && <CommitteePage />}
      </div>
    </div>
  );
}
