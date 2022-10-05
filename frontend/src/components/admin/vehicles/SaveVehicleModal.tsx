import React, { FC, useEffect, useState } from 'react';
import { toTitleCase, VehicleTypeData } from '../../../pages/admin/Vehicles';
import Modal from '../../common/Modal';
import { VehicleModalProps } from './vehicleData';
import Alert from '../../common/Alert';

const SaveVehicleModal: FC<VehicleModalProps> = ({
  title,
  onSubmitAndStatus,
  currentVehicleData,
  setCurrentVehicleData,
  setIsOpen,
}) => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeData[]>([]);
  const [isNewVehicleType, setIsNewVehicleType] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch('/api/vehicles/types', {
      method: 'GET',
      credentials: 'include',
    })
      .then((vehicleTypeJsonCollection) => vehicleTypeJsonCollection.json())
      .then((vehicleTypeList) => {
        if (vehicleTypeList.length) {
          setCurrentVehicleData({
            ...currentVehicleData,
            type: vehicleTypeList[0],
          });
        }
        setVehicleTypes(vehicleTypeList);
      });
  }, []);

  return (
    <Modal>
      <>
        {error && <Alert error={error}></Alert>}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            currentVehicleData.type.new = true;

            const submitResult = await onSubmitAndStatus(currentVehicleData);
            if (submitResult.ok) {
              return;
            }

            const submitResultMessage = (await submitResult.json()).message;
            setError(
              submitResultMessage && submitResultMessage.forEach
                ? submitResultMessage.join(', ')
                : submitResultMessage,
            );
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
              <label htmlFor="color">
                Color for vehicle type &quot;{currentVehicleData.type.name}
                &quot;:
              </label>
              <input
                type="color"
                value={
                  !isNewVehicleType
                    ? vehicleTypes.find(
                        (vehicleType) =>
                          vehicleType.name === currentVehicleData.type.name,
                      )?.color || '#FF0000'
                    : currentVehicleData.type.color
                }
                style={{
                  border: 'none',
                  appearance: 'none',
                  width: '100%',
                  height: 45,
                  margin: 0,
                  padding: 0,
                  outline: 'none',
                  backgroundColor: 'transparent',
                }}
                onChange={(e) => {
                  setVehicleTypes((types) => {
                    if (!isNewVehicleType) {
                      types = types.map((type) =>
                        type.name === currentVehicleData.type.name
                          ? { ...type, color: e.target.value }
                          : type,
                      );
                    }
                    return types;
                  });

                  setCurrentVehicleData({
                    ...currentVehicleData,
                    type: {
                      ...currentVehicleData.type,
                      color: e.target.value,
                    },
                  });
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="is-new">New Vehicle Type?</label>
              <input
                type="checkbox"
                id="is-new"
                name="is-new"
                checked={isNewVehicleType}
                onChange={() => setIsNewVehicleType(!isNewVehicleType)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vehicle-select">Vehicle Type:</label>
              {!isNewVehicleType ? (
                <select
                  id="vehicle-select"
                  name="vehicle-select"
                  value={currentVehicleData.type.name}
                  onChange={(e) =>
                    setCurrentVehicleData({
                      ...currentVehicleData,
                      type: {
                        ...currentVehicleData.type,
                        name: e.target.value,
                        new: false,
                      },
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
                      type: {
                        ...currentVehicleData.type,
                        name: toTitleCase(e.target.value),
                        new: true,
                      },
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
      </>
    </Modal>
  );
};

export default SaveVehicleModal;
