import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import LoginModal from './LoginModal';

const AdminNavigation: React.FC = (): JSX.Element => {
  const { signedIn, setSignedIn, setSessionOver } = useAuthContext();
  const [loginModalIsOpen, setLoginModalIsOpen] =
    React.useState<boolean>(false);

  const handleLogout = (e: React.SyntheticEvent): void => {
    e.preventDefault();

    fetch('/api/admin/logout', {
      method: 'GET',
      credentials: 'same-origin',
    }).then(() => {
      setSignedIn(false);
      setSessionOver(new Date());
    });
  };

  return (
    <section>
      <div className="container">
        <div className="terminal-nav">
          <div className="terminal-logo">
            <div className="logo terminal-prompt">
              <Link to="/" className="no-style">
                Vehservoir
              </Link>
            </div>
          </div>
          <nav className="terminal-menu">
            <ul>
              <li className="menu-item">
                <Link to="/vehicles">Vehicles</Link>
              </li>
              <li className="menu-item">
                <Link to="/reservations">Reservations</Link>
              </li>

              {signedIn ? (
                <li className="menu-item">
                  <Link to="/admins">Admins</Link>
                </li>
              ) : null}
              <li>
                {signedIn ? (
                  <a className="btn btn-primary" onClick={handleLogout}>
                    Logout
                  </a>
                ) : (
                  <a
                    className="btn btn-primary"
                    onClick={() => setLoginModalIsOpen(true)}
                  >
                    Login
                  </a>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {loginModalIsOpen ? (
        <LoginModal setLoginModalIsOpen={setLoginModalIsOpen} />
      ) : (
        <></>
      )}
    </section>
  );
};

export default AdminNavigation;
