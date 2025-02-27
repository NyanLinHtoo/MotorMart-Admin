import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the AuthContextType interface for the context
interface AuthContextType {
  user: any; // You can specify a more specific type for the user if needed
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

// Create the AuthContext with a default value of undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Update the AuthProvider to accept children as ReactNode
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access AuthContext
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
