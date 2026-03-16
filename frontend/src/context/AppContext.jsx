import React from 'react'

// Context cho global state management (nếu cần)
export const AppContext = React.createContext();

export const AppProvider = ({ children }) => {
  const [appState, setAppState] = React.useState({
    user: null,
    isLoading: false,
    error: null,
  });

  const updateAppState = (newState) => {
    setAppState(prev => ({ ...prev, ...newState }));
  };

  return (
    <AppContext.Provider value={{ appState, updateAppState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
