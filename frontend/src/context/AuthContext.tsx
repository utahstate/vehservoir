import React, { useContext, useState, createContext } from 'react';

interface authContext {
  signedIn: boolean;
  setSignedIn: (signedIn: boolean) => void;
}

const AuthContext = createContext<authContext>({
  signedIn: false,
  setSignedIn: () => null,
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [signedIn, setSignedIn] = useState<boolean>(false);

  return (
    <AuthContext.Provider value={{ signedIn, setSignedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
