import React, { FC } from 'react';

interface Props {
  title?: string;
  children?: JSX.Element;
}

const Modal: FC<Props> = ({ title, children }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backdropFilter: 'brightness(40%) blur(2px)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: 20,
          border: '1px solid #000',
          width: '80%',
          maxWidth: 600,
        }}
      >
        <div className="card-header">{title || null}</div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
