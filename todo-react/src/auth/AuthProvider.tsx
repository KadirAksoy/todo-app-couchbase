import React, { useState, PropsWithChildren } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
