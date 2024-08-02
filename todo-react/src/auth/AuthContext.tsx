import React from "react";

interface AuthContextProps {
  token: string | null;
  setToken: (token: string | null) => void;
}

export const AuthContext = React.createContext<AuthContextProps>({
  token: null,
  setToken: () => {},
});
