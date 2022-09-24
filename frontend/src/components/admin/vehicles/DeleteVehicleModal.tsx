import React, { FC, useState } from 'react';
import Modal from '../../common/Modal';
import { VehicleModalProps } from './vehicleData';

const DeleteVehicleModal: FC<VehicleModalProps> = ({
  onSubmitAndStatus,
  currentVehicleData,
  setIsOpen,
}) => {
  const [error, setError] = useState<string>('');
  return (
    <Modal>
      <>
        <h4>Confirm Delete</h4>
        <p>
          Are you sure you want to delete
          <b> {currentVehicleData.name}</b>?
        </p>
        <button
          className="btn btn-primary"
          style={{ border: 'none', marginRight: 5 }}
          onClick={async () => {
            const deleteStatus = await onSubmitAndStatus(currentVehicleData);
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

export default DeleteVehicleModal;
