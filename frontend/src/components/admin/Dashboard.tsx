import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavigation from './AdminNavigation';

const Dashboard: React.FC = (): JSX.Element => {
  return (
    <>
      <AdminNavigation />
      <Outlet />
    </>
  );
};

export default Dashboard;
