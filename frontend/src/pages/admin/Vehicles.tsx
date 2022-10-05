import React, { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DeleteVehicleModal from '../../components/admin/vehicles/DeleteVehicleModal';
import SaveVehicleModal from '../../components/admin/vehicles/SaveVehicleModal';
import { useAuthContext } from '../../context/AuthContext';

export interface VehicleTypeData {
  id: number | null;
  name: string;
  new: boolean;
  color: string;
}
export interface VehicleData {
  id: number | null;
  name: string;
  type: VehicleTypeData;
}

export const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split(' ')
    .filter((x) => x)
    .map((x) => x[0]?.toUpperCase() + x.slice(1))
    .join(' ') + (str.endsWith(' ') ? ' ' : '');

const actions: Record<string, (d: VehicleData) => Promise<Response>> = {
  update: (currentVehicleData: VehicleData) => {
    const { id, ...dataToSend } = currentVehicleData;

    return fetch(`/api/vehicle/${id}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });
  },
  create: (currentVehicleData: VehicleData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  remove: (currentVehicleData: VehicleData) => {
    return fetch(`/api/vehicle/${currentVehicleData.id}`, {
      method: 'DELETE',
    });
  },
};

const getVehicles = async () => {
  return fetch('/api/vehicles', {
    method: 'GET',
    credentials: 'include',
  }).then((vehicleJsonCollection) => vehicleJsonCollection.json());
};

const Vehicles: FC = () => {
  const { signedIn } = useAuthContext();

  const [selectedAction, setSelectedAction] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [currentVehicleData, setCurrentVehicleData] = useState<VehicleData>({
    id: null,
    name: '',
    type: { id: null, name: '', new: true, color: '#FF0000' },
  });

  const refreshVehicles = (): void => {
    getVehicles().then((vehicles) => setVehicles(vehicles));
  };

  useEffect(() => refreshVehicles(), []);

  const modalProps = {
    title: `${toTitleCase(selectedAction)} Vehicle`,
    onSubmitAndStatus: async (vehicleData: VehicleData): Promise<Response> => {
      const saveResult = await actions[selectedAction](vehicleData);
      if (saveResult.ok) {
        refreshVehicles();
        setModalIsOpen(false);
      }
      return saveResult;
    },
    currentVehicleData: currentVehicleData,
    setCurrentVehicleData: setCurrentVehicleData,
    isOpen: modalIsOpen,
    setIsOpen: setModalIsOpen,
  };
  const modal =
    selectedAction === 'remove' ? (
      <DeleteVehicleModal {...modalProps} />
    ) : (
      <SaveVehicleModal {...modalProps} />
    );

  return (
    <>
      <div className="container">
        <h1>Vehicles</h1>
        {signedIn ? (
          <button
            className="btn btn-default"
            onClick={() => {
              setSelectedAction('create');
              setModalIsOpen(true);
            }}
          >
            Create New Vehicle +
          </button>
        ) : (
          <></>
        )}
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              {signedIn ? <th>Actions</th> : <></>}
            </tr>
          </thead>
          <tbody>
            {vehicles.length ? (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <Link to={`/reservations/${vehicle.id}`}>{vehicle.id}</Link>
                  </td>
                  <td>{vehicle.name}</td>
                  <td>{vehicle.type.name}</td>
                  {signedIn ? (
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          gap: '1rem',
                        }}
                      >
                        <a
                          onClick={() => {
                            setSelectedAction('update');
                            setCurrentVehicleData(vehicle);
                            setModalIsOpen(!modalIsOpen);
                          }}
                        >
                          Edit
                        </a>
                        <a
                          onClick={() => {
                            setSelectedAction('remove');
                            setCurrentVehicleData(vehicle);
                            setModalIsOpen(!modalIsOpen);
                          }}
                        >
                          Delete
                        </a>
                      </div>
                    </td>
                  ) : (
                    <></>
                  )}
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
