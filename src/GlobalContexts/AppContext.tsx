import React, { createContext, useContext, useState } from "react";

const AppContext = createContext({} as { [key: string]: any });

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  headerMessage: string;
}
export default function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "fas fa-tachometer-alt",
      headerMessage: "Welcome back",
    },
    {
      id: "history",
      label: "History",
      icon: "fas fa-history", // Changed icon to represent history
      headerMessage: "",
    },
    {
      id: "workflows",
      label: "Workflow",
      icon: "fas fa-project-diagram",
      headerMessage: "",
    },
    // {
    //   id: "forms",
    //   label: "Form",
    //   icon: "fas fa-file-alt",
    //   headerMessage: "",
    // },
    {
      id: "organization",
      label: "Organization",
      icon: "fas fa-building",
      headerMessage: "",
    },
  ];

  const [selectedNavItem, setSelectNavItem] = useState(navigationItems[0]);

  const getNavigationItem = (id: string) => {
    return navigationItems.find((item) => item.id === id);
  };

  return (
    <AppContext.Provider
      value={{
        selectedNavItem,
        setSelectNavItem,
        navigationItems,
        getNavigationItem,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
