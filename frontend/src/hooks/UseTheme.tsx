import React, { useState, useEffect } from 'react';

const DEFAULT_THEME = 'light';
export const useTheme = (): [
  string,
  React.Dispatch<React.SetStateAction<string>>,
] => {
  const [theme, setTheme] = useState<string>(
    localStorage.getItem('theme') || DEFAULT_THEME,
  );

  useEffect(() => {
    localStorage.setItem('theme', theme);

    const root = document.documentElement;
    const colors: Record<string, string> = {
      '--background-color': theme === 'dark' ? '#1e1e1e' : '#fff',
      '--font-color': theme === 'dark' ? '#e8e9ed' : '#151515',
      '--invert-font-color': theme === 'dark' ? '#222225' : '#fff',
      '--secondary-color': theme === 'dark' ? '#a3abba' : '#727578',
      '--tertiary-color': theme === 'dark' ? '#a3abba' : '#fff',
      '--primary-color': theme === 'dark' ? '#62c4ff' : '#1a95e0',
      '--error-color': theme === 'dark' ? '#ff3c74' : '#d20962',
      '--progress-bar-background': theme === 'dark' ? '#3f3f44' : '#727578',
      '--progress-bar-fill': theme === 'dark' ? '#62c4ff' : '#151515',
      '--code-bg-color': theme === 'dark' ? '#222225' : '#fff',
    };

    Object.keys(colors).map((cssVar) =>
      root.style.setProperty(cssVar, colors[cssVar]),
    );
  }, [theme]);

  return [theme, setTheme];
};
