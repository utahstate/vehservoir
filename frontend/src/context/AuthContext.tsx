import React, { useContext, useState, createContext, useEffect } from 'react';

interface authContext {
  signedIn: boolean;
  setSignedIn: (signedIn: boolean) => void;
  sessionOver: Date;
  setSessionOver: (expiry: Date) => void;
}

const AuthContext = createContext<authContext>({
  signedIn: false,
  setSignedIn: () => null,
  sessionOver: new Date(),
  setSessionOver: () => null,
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [sessionOver, setSessionOver] = useState<Date>(new Date());

  useEffect(() => {
    let expiry: string | null | Date = localStorage.getItem('expiry');
    if (expiry) {
      expiry = new Date(expiry);
      if (new Date().getTime() < expiry.getTime()) {
        setSignedIn(true);
        setSessionOver(expiry);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expiry', sessionOver.toISOString());
    setTimeout(() => {
      setSessionOver((sessionOver) => {
        if (new Date().getTime() >= sessionOver.getTime()) {
          setSignedIn((signedIn) => {
            if (signedIn) {
              alert(
                'Session expired. Any further privileged requests will fail until signed in again.',
              );
            }
            return signedIn;
          });
        }
        return sessionOver;
      });
    }, sessionOver.getTime() - Date.now());
  }, [sessionOver]);

  return (
    <AuthContext.Provider
      value={{ signedIn, setSignedIn, sessionOver, setSessionOver }}
    >
      {children}
    </AuthContext.Provider>
  );
};
