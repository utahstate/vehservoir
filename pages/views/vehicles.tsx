import React from "react";

type Props = {};

const Vehicles = (props: Props) => {
  return (
    <div className="container">
      <h1>Manage Vehicles</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Reservations</th>
            <th>Actions</th>
          </tr>
        </thead>
      </table>
    </div>
  );
};

export default Vehicles;
