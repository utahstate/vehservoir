import React, { FC, useEffect, useState } from 'react';
import { toTitleCase } from '../../../pages/admin/Vehicles';
import Modal from '../../Modal';
import { VehicleModalProps } from './vehicleData';

const SaveVehicleModal: FC<VehicleModalProps> = ({
  title,
  onSubmit,
  currentVehicleData,
  setCurrentVehicleData,
  setIsOpen,
}) => {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [isNewVehicle, setIsNewVehicle] = useState(false);

  useEffect(() => {
    fetch('/api/vehicles/types', {
      method: 'GET',
      credentials: 'include',
    })
      .then((vehicleTypeJsonCollection) => vehicleTypeJsonCollection.json())
      .then((vehicleTypeList) => setVehicleTypes(vehicleTypeList));
  }, []);

  return (
    <Modal
      content={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            currentVehicleData.type.new = true;
            onSubmit(currentVehicleData);
            setIsOpen(false);
          }}
        >
          <fieldset>
            <legend>{title}</legend>
            <div className="form-group">
              <label htmlFor="name">Vehicle Name:</label>
              <input
                name="name"
                id="name"
                type="text"
                onChange={(e) => {
                  setCurrentVehicleData({
                    ...currentVehicleData,
                    name: toTitleCase(e.target.value),
                  });
                }}
                value={currentVehicleData?.name || ''}
              />
            </div>
            <div className="form-group">
              <label htmlFor="is-new">New Vehicle Type?</label>
              <input
                type="checkbox"
                id="is-new"
                name="is-new"
                checked={isNewVehicle}
                onChange={() => setIsNewVehicle(!isNewVehicle)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vehicle-select">Vehicle Type:</label>
              {!isNewVehicle ? (
                <select
                  id="vehicle-select"
                  name="vehicle-select"
                  value={currentVehicleData.type.name}
                  onChange={(e) =>
                    setCurrentVehicleData({
                      ...currentVehicleData,
                      type: { name: toTitleCase(e.target.value) },
                    })
                  }
                  style={{
                    border: '1px solid #000',
                    borderRadius: 0,
                    padding: '.7em .5em',
                    fontSize: 15,
                    fontFamily: 'var(--font-stack)',
                    width: '100%',
                    backgroundColor: '#fff',
                  }}
                >
                  {vehicleTypes.map(({ id, name }) => (
                    <option key={id} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={currentVehicleData.type.name}
                  onChange={(e) =>
                    setCurrentVehicleData({
                      ...currentVehicleData,
                      type: { name: toTitleCase(e.target.value) },
                    })
                  }
                />
              )}
            </div>
            <div className="form-group">
              <input
                type="submit"
                value="Confirm"
                className="btn btn-primary"
              />
              <button
                className="btn btn-error"
                onClick={() => setIsOpen(false)}
                style={{ marginLeft: 5 }}
              >
                Cancel
              </button>
            </div>
          </fieldset>
        </form>
      }
    />
  );
};

export default SaveVehicleModal;
