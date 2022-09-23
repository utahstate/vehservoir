import React, { FC } from 'react';
import Modal from '../../Modal';
import { VehicleModalProps } from './vehicleData';

const DeleteVehicleModal: FC<VehicleModalProps> = ({
  onSubmit,
  currentVehicleData,
  setIsOpen,
}) => {
  return (
    <Modal
      content={
        <>
          <h4>Confirm Delete</h4>
          <p>
            Are you sure you want to delete
            <b> {currentVehicleData.name}</b>?
          </p>
          <button
            className="btn btn-primary"
            style={{ border: 'none', marginRight: 5 }}
            onClick={() => {
              onSubmit(currentVehicleData);
              setIsOpen(false);
            }}
          >
            Yes
          </button>
          <button className="btn btn-default" onClick={() => setIsOpen(false)}>
            No
          </button>
        </>
      }
    />
  );
};

export default DeleteVehicleModal;
