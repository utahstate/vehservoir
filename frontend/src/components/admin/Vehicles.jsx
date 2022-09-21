import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);

  fetch('/api/vehicles', {
    method: 'GET',
    credentials: 'include',
  })
    .then((vehicleJsonCollection) => vehicleJsonCollection.json())
    .then((vehicles) => setVehicles(vehicles));

  return (
    <div className="container">
      <h1>Manage Vehicles</h1>
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
              </tr>
            ))
          ) : (
            <></>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Vehicles;
