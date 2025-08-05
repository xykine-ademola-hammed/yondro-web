// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import { useState } from "react";
import { useAppContext } from "../GlobalContexts/AppContext";
import { useAuth } from "../GlobalContexts/AuthContext";

interface HeaderProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const HeaderNav: React.FC<HeaderProps> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const { selectedNavItem } = useAppContext();
  const { user, logout } = useAuth();
  return (
    <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-2">
      <div className="flex flex-row items-center">
        <div className="h-16 flex items-center justify-between px-4 border-gray-200">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <i
              className={`fas ${
                sidebarCollapsed && "fa-chevron-right"
              } text-gray-600`}
            ></i>
          </button>
        </div>

        <h2 className="text-1xl font-semibold text-gray-800">
          {selectedNavItem?.label}
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 relative">
          <div
            onClick={toggleDropdown}
            className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer"
          >
            <span className="text-white text-sm font-medium">
              {user?.firstName[0]}
              {user?.lastName[0]}
            </span>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
              <ul className="py-1">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Profile
                </li>
                <li
                  onClick={logout}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default HeaderNav;
