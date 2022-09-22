import React, { Dispatch, FC, ReactNode, SetStateAction } from 'react';

interface Props {
  title?: string;
  content?: ReactNode;
  setModalIsOpen: Dispatch<SetStateAction<boolean>>;
}

const Modal: FC<Props> = ({ title, content, setModalIsOpen }) => {
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
        border: '1px solid #000',
        placeItems: 'center',
        zIndex: 100,
      }}
    >
      <div
        className="container"
        style={{ backgroundColor: '#fff', padding: 20 }}
      >
        <div className="card-header">{title || null}</div>
        {content}
      </div>
    </div>
  );
};

export default Modal;
