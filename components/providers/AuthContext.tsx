import React, {
  useContext,
  useState,
  createContext,
  Dispatch,
  SetStateAction,
} from "react";

interface authContext {
  authToken: string | null;
  setAuthToken: (token: string) => void;
}

const AuthContext = createContext<authContext>({
  authToken: null,
  setAuthToken: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};
