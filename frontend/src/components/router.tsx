import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import Admins from './admin/Admins';
import Dashboard from './admin/Dashboard';
import Login from './admin/Login';
import Vehicles from './admin/Vehicles';

export const Router: React.FC = (): JSX.Element => {
  const { signedIn } = useAuthContext();

  return (
    <Routes>
      <Route
        path="/"
        element={signedIn ? <Navigate replace to="/admin" /> : <Login />}
      ></Route>
      <Route
        path="/admin"
        element={signedIn ? <Dashboard /> : <Navigate replace to="/" />}
      >
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="admins" element={<Admins />} />
      </Route>
    </Routes>
  );
};
