import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <AppContext.Provider
      value={{
        selectedParty,
        setSelectedParty,
        selectedFactory,
        setSelectedFactory,
        dashboardData,
        setDashboardData,
        loading,
        setLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
