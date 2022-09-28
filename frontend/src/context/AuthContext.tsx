import React, { useContext, useState, createContext, useEffect } from 'react';

interface authContext {
  signedIn: boolean;
  setSignedIn: (signedIn: boolean) => void;
  sessionOver: Date;
  setSessionOver: (expiry: Date) => void;
  userId: number | null;
  setUserId: (newUserId: number | null) => void;
}

const AuthContext = createContext<authContext>({
  signedIn: false,
  setSignedIn: () => null,
  sessionOver: new Date(),
  setSessionOver: () => null,
  userId: null,
  setUserId: () => null,
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [sessionOver, setSessionOver] = useState<Date>(new Date());
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId.toString());
    }
  }, [userId]);

  useEffect(() => {
    let expiry: string | null | Date = localStorage.getItem('expiry');
    if (expiry) {
      expiry = new Date(expiry);
      if (Date.now() < expiry.getTime()) {
        setSignedIn(true);
        setSessionOver(expiry);

        ((id) => {
          if (id) {
            setUserId(parseInt(id, 10));
          }
        })(localStorage.getItem('userId'));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expiry', sessionOver.toISOString());
    setTimeout(() => {
      setSessionOver((sessionOver) => {
        if (Date.now() >= sessionOver.getTime()) {
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
      value={{
        signedIn,
        setSignedIn,
        sessionOver,
        setSessionOver,
        userId,
        setUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
