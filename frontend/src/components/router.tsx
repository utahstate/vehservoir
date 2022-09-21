import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import Admins from './admin/Admins';
import Dashboard from './admin/Dashboard';
import Login from './admin/Login';
import Vehicles from './admin/Vehicles';

export const Router: React.FC = (): JSX.Element => {
  const { authToken } = useAuthContext();

  return (
    <Routes>
      <Route
        path="/"
        element={authToken ? <Navigate replace to="/admin" /> : <Login />}
      ></Route>
      <Route
        path="/admin"
        element={authToken ? <Dashboard /> : <Navigate replace to="/" />}
      >
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="admins" element={<Admins />} />
      </Route>
    </Routes>
  );
};
