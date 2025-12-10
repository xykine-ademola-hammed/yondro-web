import React, { createContext, useContext, useState } from "react";
import type { PendingInboxRow } from "../Dashboard";

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
  const [selectedRequestPaymentPool, setSelectedRequestPaymentPool] = useState<
    PendingInboxRow[]
  >([]);
  const navigationItems = [
    {
      id: "home",
      label: "Home",
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

  const addToPaymentPool = (pool: PendingInboxRow) => {
    setSelectedRequestPaymentPool((prevPool) => [...prevPool, pool]);
  };

  const onRemoveItem = (entityId: number) => {
    const updatedItems = selectedRequestPaymentPool.filter(
      (pool) => pool.requestId !== entityId
    );
    setSelectedRequestPaymentPool(updatedItems);
  };

  return (
    <AppContext.Provider
      value={{
        selectedNavItem,
        setSelectNavItem,
        navigationItems,
        getNavigationItem,
        addToPaymentPool,
        onRemoveItem,
        selectedRequestPaymentPool,
        selectedRequestPoolIds: selectedRequestPaymentPool.map(
          (item) => item.requestId
        ),
        setSelectedRequestPaymentPool,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
