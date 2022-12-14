import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Admins from '../pages/admin/Admins';
import Vehicles from '../pages/admin/Vehicles';
import Reservations from '../pages/Reservations';
import { useAuthContext } from '../context/AuthContext';
import { VehicleParkingLot } from './VehicleParkingLot';

export const Router: React.FC = (): JSX.Element => {
  const { signedIn } = useAuthContext();

  return (
    <Routes>
      <Route path="/" element={<Dashboard />}>
        <Route path="" element={<VehicleParkingLot />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="admins" element={signedIn && <Admins />} />
        <Route path="reservations" element={<Reservations />}>
          <Route path=":vehicleId" element={<Reservations />} />
        </Route>
      </Route>
    </Routes>
  );
};
