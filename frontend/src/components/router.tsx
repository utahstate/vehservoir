import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Admins from '../pages/admin/Admins';
import Vehicles from '../pages/admin/Vehicles';

export const Router: React.FC = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />}>
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="admins" element={<Admins />} />
      </Route>
    </Routes>
  );
};
