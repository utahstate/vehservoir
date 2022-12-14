import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import LoginModal from './LoginModal';
import { FaMoon } from 'react-icons/fa';
import { BsSun } from 'react-icons/bs';
import { useTheme } from '../../hooks/UseTheme';

const AdminNavigation: React.FC = (): JSX.Element => {
  const { signedIn, setSignedIn, setSessionOver, setUserId } = useAuthContext();
  const [loginModalIsOpen, setLoginModalIsOpen] =
    React.useState<boolean>(false);

  const [theme, setTheme] = useTheme();

  const handleLogout = (e: React.SyntheticEvent): void => {
    e.preventDefault();

    fetch('/api/admin/logout', {
      method: 'GET',
      credentials: 'same-origin',
    }).then(() => {
      setSignedIn(false);
      setUserId(null);
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
                <button
                  onClick={() => {
                    setTheme(theme === 'dark' ? 'light' : 'dark');
                  }}
                  style={{
                    padding: 0,
                    border: '1px solid var(--secondary-color)',
                  }}
                >
                  <div
                    style={{
                      transition: '0.2s ease',
                      fontSize: 15,
                      float: theme === 'dark' ? 'right' : 'left',
                      width: '50%',
                      height: '100%',
                      background: 'var(--secondary-color)',
                      color: 'var(--invert-font-color)',
                      padding: '0.65rem 2rem',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {theme === 'dark' ? <FaMoon /> : <BsSun />}
                  </div>
                </button>
              </li>
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
