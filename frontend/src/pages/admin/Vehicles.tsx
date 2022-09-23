import React, { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DeleteVehicleModal from '../../components/admin/vehicles/DeleteVehicleModal';
import SaveVehicleModal from '../../components/admin/vehicles/SaveVehicleModal';

export interface CurrentVehicleData {
  id: number | null;
  name: string;
  type: {
    name: string;
    new: boolean;
  };
}

export const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split(' ')
    .filter((x) => x)
    .map((x) => x[0]?.toUpperCase() + x.slice(1))
    .join(' ') + (str.endsWith(' ') ? ' ' : '');

const actions: Record<string, (d: CurrentVehicleData) => Promise<any>> = {
  update: (currentVehicleData: CurrentVehicleData) => {
    const { id, ...dataToSend } = currentVehicleData;

    return fetch(`/api/vehicle/${currentVehicleData.id}`, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });
  },
  create: (currentVehicleData: CurrentVehicleData) => {
    const { id, ...dataToSend } = currentVehicleData;

    return fetch(`/api/vehicle`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        credentials: 'include',
      },
      body: JSON.stringify(dataToSend),
    });
  },
  remove: (currentVehicleData: CurrentVehicleData) => {
    return fetch(`/api/vehicle/${currentVehicleData.id}`, {
      method: 'DELETE',
    });
  },
};

const getVehicles = () => {
  return fetch('/api/vehicles', {
    method: 'GET',
    credentials: 'include',
  }).then((vehicleJsonCollection) => vehicleJsonCollection.json());
};

const Vehicles: FC = () => {
  const [selectedAction, setSelectedAction] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [currentVehicleData, setCurrentVehicleData] =
    useState<CurrentVehicleData>({
      id: null,
      name: '',
      type: { name: '', new: true },
    });

  const refreshVehicles = (): void => {
    getVehicles().then((vehicles) => setVehicles(vehicles));
  };

  useEffect(() => refreshVehicles(), []);

  const modal =
    selectedAction === 'remove' ? (
      <DeleteVehicleModal
        title={`${toTitleCase(selectedAction)} Vehicle`}
        onSubmit={(vehicleData: CurrentVehicleData) => {
          actions[selectedAction](vehicleData).then(refreshVehicles);
        }}
        currentVehicleData={currentVehicleData}
        setCurrentVehicleData={setCurrentVehicleData}
        isOpen={modalIsOpen}
        setIsOpen={setModalIsOpen}
      />
    ) : (
      <SaveVehicleModal
        title={`${toTitleCase(selectedAction)} Vehicle`}
        onSubmit={(vehicleData: CurrentVehicleData) => {
          actions[selectedAction](vehicleData).then(refreshVehicles);
        }}
        currentVehicleData={currentVehicleData}
        setCurrentVehicleData={setCurrentVehicleData}
        isOpen={modalIsOpen}
        setIsOpen={setModalIsOpen}
      />
    );

  return (
    <>
      <div className="container">
        <h1>Manage Vehicles</h1>
        <button
          className="btn btn-default"
          onClick={() => {
            setSelectedAction('create');
            setModalIsOpen(true);
          }}
        >
          Create New Vehicle +
        </button>
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
                          setSelectedAction('update');
                          setCurrentVehicleData(vehicle);
                          setModalIsOpen(!modalIsOpen);
                        }}
                      >
                        Edit
                      </a>
                    </span>
                    <a
                      onClick={() => {
                        setSelectedAction('remove');
                        setCurrentVehicleData(vehicle);
                        setModalIsOpen(!modalIsOpen);
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
      {modalIsOpen ? modal : <></>}
    </>
  );
};

export default Vehicles;
