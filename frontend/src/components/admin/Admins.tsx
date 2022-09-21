import React from 'react';

const Admins: React.FC = (): JSX.Element => {
  return (
    <div className="container">
      <h1>Manage Admins</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Creation Date</th>
            <th>Actions</th>
          </tr>
        </thead>
      </table>
    </div>
  );
};

export default Admins;
