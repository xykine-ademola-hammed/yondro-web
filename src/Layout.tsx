// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import { useState } from "react";
import HeaderNav from "./components/Header";
import SideBar from "./components/SideBar";
import { Outlet } from "react-router-dom";
import { OrganizationProvider } from "./GlobalContexts/Organization-Context";

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <OrganizationProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <SideBar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        <div className="flex-1 flex flex-col">
          <HeaderNav
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
          <Outlet />
        </div>
      </div>
    </OrganizationProvider>
  );
};
export default Layout;
