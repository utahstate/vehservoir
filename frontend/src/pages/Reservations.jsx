import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ReservationsCalendar } from '../components/common/calendar/ReservationsCalendar';

const Reservations = () => {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);

  const { vehicleId } = useParams();

  useEffect(() => {
    fetch('/api/vehicles', {
      method: 'GET',
      credentials: 'include',
    })
      .then((vehiclesJsonCollection) => vehiclesJsonCollection.json())
      .then((vehiclesList) => {
        if (vehiclesList.length) {
          if (vehicleId) {
            setSelectedVehicle(
              vehiclesList.find(
                (vehicle) => vehicle.id === parseInt(vehicleId),
              ),
            );
          } else {
            setSelectedVehicle(vehiclesList[0]);
          }
          setVehicleTypes(() => {
            const seenTypes = new Set();

            return vehiclesList.reduce((a, x) => {
              if (!seenTypes.has(x.type.id)) {
                seenTypes.add(x.type.id);
                return [...a, x.type];
              }
              return a;
            }, []);
          });
          setVehicles(vehiclesList);
        }
      });
  }, []);

  return (
    <div className="container">
      <h1>Reservations</h1>
      <div
        style={{
          display: 'grid',
          gap: '1.4em',
          gridTemplateRows: 'auto',
          gridTemplateColumns: '3fr 9fr',
          marginTop: 30,
        }}
      >
        <aside className="menu">
          {vehicleTypes.map((vehicleType) => (
            <div key={vehicleType.id}>
              <a
                onClick={() => {
                  setSelectedVehicle(null);
                  setSelectedVehicleType(vehicleType);
                }}
                style={
                  selectedVehicleType?.id === vehicleType?.id
                    ? {
                        fontSize: '1.5rem',
                        fontFamily: 'var(--font-stack)',
                        fontWeight: 900,
                        background: 'var(--primary-color)',
                        color: 'var(--invert-font-color)',
                      }
                    : {
                        fontSize: '1.5rem',
                        fontFamily: 'var(--font-stack)',
                      }
                }
              >
                {vehicleType.name}
              </a>
              <nav>
                <ul>
                  {vehicles
                    .filter((vehicle) => vehicle.type.name === vehicleType.name)
                    .map((vehicle) => (
                      <li key={vehicle.id}>
                        <a
                          style={
                            selectedVehicle?.id === vehicle?.id
                              ? {
                                  fontWeight: 900,
                                  background: 'var(--primary-color)',
                                  color: 'var(--invert-font-color)',
                                }
                              : {}
                          }
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setSelectedVehicleType(null);
                          }}
                        >
                          {vehicle.name}
                        </a>
                      </li>
                    ))}
                </ul>
              </nav>
            </div>
          ))}
        </aside>
        <main>
          <ReservationsCalendar
            vehicle={selectedVehicle}
            vehicleType={selectedVehicleType}
          />
        </main>
      </div>
    </div>
  );
};

export default Reservations;
