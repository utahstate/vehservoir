import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div className="container">
        <h1 className="terminal-prompt">404 Page Not Found</h1>
        <p>This is awkward...</p>
        <div>
          <button
            className="btn btn-default"
            onClick={() => navigate(-1)}
            style={{ border: '2px solid #000', marginRight: 5 }}
          >
            Go back
          </button>
          <a
            className="btn btn-primary"
            style={{ border: 'none' }}
            target="blank"
            href="https://youtu.be/dQw4w9WgXcQ"
          >
            Feeling lucky?
          </a>
        </div>
      </div>
    </div>
  );
};
