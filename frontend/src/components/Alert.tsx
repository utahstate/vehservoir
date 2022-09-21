import React from 'react';

interface ErrorProps {
  error: string;
}

const Alert: React.FC<ErrorProps> = ({ error }) => {
  return (
    <div
      className="terminal-alert terminal-alert-error"
      style={{ marginBottom: 30 }}
    >
      {error}
    </div>
  );
};

export default Alert;
