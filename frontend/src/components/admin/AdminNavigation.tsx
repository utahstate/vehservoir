import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const navItems = [
  {
    name: 'Vehicles',
    route: '/admin/vehicles',
  },
  {
    name: 'Reservations',
    route: '/admin/reservations',
  },
  {
    name: 'Admins',
    route: '/admin/admins',
  },
];

const AdminNavigation: React.FC = (): JSX.Element => {
  const { setAuthToken } = useAuthContext();
  const handleLogout = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    setAuthToken(null);
  };

  return (
    <section>
      <div className="container">
        <div className="terminal-nav">
          <div className="terminal-logo">
            <div className="logo terminal-prompt">
              <Link to="/admin" className="no-style">
                Vehservoir
              </Link>
            </div>
          </div>
          <nav className="terminal-menu">
            <ul>
              {navItems.map(({ name, route }) => (
                <li className="menu-item" key={name}>
                  <Link to={route}>{name}</Link>
                </li>
              ))}
              <li>
                <a className="btn btn-primary" onClick={handleLogout}>
                  Logout
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default AdminNavigation;
