import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavigation from '../components/admin/Navigation';
const Dashboard: React.FC = (): JSX.Element => {
  return (
    <>
      <AdminNavigation />
      <Outlet />
    </>
  );
};

export default Dashboard;
