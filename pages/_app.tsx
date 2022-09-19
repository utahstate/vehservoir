import { FC } from 'react';
import type { AppProps /*, AppContext */ } from 'next/app';
import AdminNavigation from "../components/AdminNavigation";
import { AuthProvider } from "../components/providers/AuthContext";
import "terminal.css";

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
      <div className="terminal">
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
};

export default MyApp;
