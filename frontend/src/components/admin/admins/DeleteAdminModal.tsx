import React, { FC, useState } from 'react';
import Modal from '../../common/Modal';
import { AdminModalProps } from './adminData';

const DeleteAdminModal: FC<AdminModalProps> = ({
  onSubmitAndStatus,
  currentAdminData,
  setIsOpen,
}) => {
  const [error, setError] = useState<string>('');
  return (
    <Modal>
      <>
        <h4>Confirm Delete</h4>
        <p>
          Are you sure you want to delete
          <b> {currentAdminData.username}</b>?
        </p>
        <button
          className="btn btn-primary"
          style={{ border: 'none', marginRight: 5 }}
          onClick={async () => {
            const deleteStatus = await onSubmitAndStatus(currentAdminData);
            if (deleteStatus.ok) {
              return;
            }
            setError((await deleteStatus.json()).message);
          }}
        >
          Yes
        </button>
        <button className="btn btn-default" onClick={() => setIsOpen(false)}>
          No
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </>
    </Modal>
  );
};

export default DeleteAdminModal;
