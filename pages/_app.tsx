import { FC } from 'react';
import type { AppProps /*, AppContext */ } from 'next/app';
import "terminal.css";

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <div style={{ display: "flex", maxWidth: "100vw" }}>
      <Component {...pageProps} />
    </div>
  );
};

export default MyApp;
