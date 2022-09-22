import React, { FC, SyntheticEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../Modal';
import CreatableSelect from 'react-select/creatable';
import { ActionMeta, InputActionMeta, OnChangeValue } from 'react-select';

interface VehicleOption {
  value: string;
  label: string;
}

const vehicleOptions: VehicleOption[] = [
  { value: 'van', label: 'Van' },
  { value: 'golf cart', label: 'Golf Cart' },
];

const vehicleSelectStyles = {
  menu: (provided: any) => ({
    ...provided,
    border: '1px solid #000',
    borderRadius: 0,
    zIndex: 200,
  }),
  option: (provided: any) => ({
    ...provided,
    fontSize: 15,
  }),
  control: (provided: any) => ({
    ...provided,
    fontSize: 15,
    border: '1px solid #000',
    borderRadius: 0,
    marginBottom: 20,
    outline: 'none',
  }),
  input: (provided: any) => ({
    ...provided,
    outline: 'none',
  }),
};

const Vehicles: FC = () => {
  const [selectedAction, setSelectedAction] = useState('');
  const [modalIsOpen, setIsOpen] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [currentVehicleData, setCurrentVehicleData] = useState({
    id: 0,
    name: '',
    type: { name: '' },
  });

  useEffect(() => {
    fetch('/api/vehicles', {
      method: 'GET',
      credentials: 'include',
    })
      .then((vehicleJsonCollection) => vehicleJsonCollection.json())
      .then((vehicles) => setVehicles(vehicles));
  }, []);

  // MODAL SUBMISSION HANDLERS
  const handleEditModalSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    const { id, ...dataToSend } = currentVehicleData;

    // console.log(dataToSend);

    fetch(`/api/vehicle/${currentVehicleData.id}`, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    }).then(async (response) => console.log(await response.json()));
  };

  // STATE HANDLERS
  const handleVehicleChange = (
    newValue: OnChangeValue<VehicleOption, false>,
    { action }: ActionMeta<VehicleOption>,
  ) => {
    switch (action) {
      case 'create-option':
        // TODO: HANDLE CREATING A VEHICLE TYPE
        return;
      case 'select-option':
        setCurrentVehicleData({
          ...currentVehicleData,
          type: { name: newValue?.value || '' },
        });
        return;
    }
  };

  const handleVehicleInputChange = (
    inputValue: string,
    { action, prevInputValue }: InputActionMeta,
  ) => {
    // console.log(action);
    switch (action) {
      case 'input-change':
        setCurrentVehicleData({
          ...currentVehicleData,
          type: { name: inputValue },
        });
        // console.log(currentVehicleData.type.name);
        return;
    }
  };

  // EDIT MODAL
  const editModalContent = (
    <form>
      <fieldset>
        <legend>Edit Vehicle</legend>
        <div className="form-group">
          <label htmlFor="name">Vehicle Name:</label>
          <input
            name="name"
            id="name"
            type="text"
            onChange={(e) => {
              setCurrentVehicleData({
                ...currentVehicleData,
                name: e.target.value,
              });
            }}
            value={currentVehicleData?.name || ''}
          />
        </div>
        <label htmlFor="vehicle-select">Vehicle Type:</label>
        <CreatableSelect
          id="vehicle-select"
          defaultValue={vehicleOptions.filter(
            ({ value }) => value === currentVehicleData.type.name,
          )}
          onChange={handleVehicleChange}
          onInputChange={handleVehicleInputChange}
          options={vehicleOptions}
          styles={vehicleSelectStyles}
          isClearable
        />
        <div className="form-group">
          <button className="btn btn-default" onClick={() => setIsOpen(false)}>
            Cancel
          </button>
          <button className="btn btn-default" onClick={handleEditModalSubmit}>
            Confirm
          </button>
        </div>
      </fieldset>
    </form>
  );

  const deleteModalContent = (
    <>
      <p>Are you sure you want to delete {currentVehicleData.name}?</p>
      <button className="btn btn-default" onClick={() => setIsOpen(false)}>
        Cancel
      </button>
      <button className="btn btn-default" onClick={handleEditModalSubmit}>
        Confirm
      </button>
    </>
  );

  return (
    <>
      <div className="container">
        <h1>Manage Vehicles</h1>
        <button className="btn btn-default">Create New Vehicle +</button>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length ? (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <Link to={`/calendar/vehicles/${vehicle.id}`}>
                      {vehicle.id}
                    </Link>
                  </td>
                  <td>{vehicle.name}</td>
                  <td>{vehicle.type.name}</td>
                  <td>
                    <span style={{ marginRight: 30 }}>
                      <a
                        onClick={() => {
                          setCurrentVehicleData(vehicle);
                          setSelectedAction('edit');
                          setIsOpen(!modalIsOpen);
                        }}
                      >
                        Edit
                      </a>
                    </span>
                    <a
                      onClick={() => {
                        setSelectedAction('delete');
                        setIsOpen(!modalIsOpen);
                      }}
                    >
                      Delete
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <></>
            )}
          </tbody>
        </table>
      </div>
      {modalIsOpen ? (
        <Modal
          content={
            selectedAction === 'edit' ? editModalContent : deleteModalContent
          }
          setModalIsOpen={setIsOpen}
        />
      ) : null}
    </>
  );
};

export default Vehicles;
