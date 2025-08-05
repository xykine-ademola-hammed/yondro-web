// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  useAppContext,
  type NavigationItem,
} from "../GlobalContexts/AppContext";

interface SideBarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const SideBar: React.FC<SideBarProps> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
}) => {
  const {
    selectedNavItem,
    setSelectNavItem,
    getNavigationItem,
    navigationItems,
  } = useAppContext();

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div
        className={`${
          sidebarCollapsed ? "w-0" : "w-55"
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-gray-800">WorkVflow</h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <i
              className={`fas ${
                !sidebarCollapsed && "fa-chevron-left"
              } text-gray-600`}
            ></i>
          </button>
        </div>
        {!sidebarCollapsed && (
          <nav className="flex-1 py-4">
            {navigationItems?.map((item: NavigationItem) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id);
                  setSelectNavItem(getNavigationItem(item.id));
                }}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap ${
                  selectedNavItem?.id === item.id
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                    : "text-gray-700"
                }`}
              >
                <i className={`${item.icon} w-5 text-center`}></i>
                <span className="ml-3">{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};
export default SideBar;
