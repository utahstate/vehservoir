import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import Alert from '../../components/Alert';

const Login: React.FC = (): JSX.Element => {
  const { setSignedIn } = useAuthContext();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const nav = useNavigate();

  const handleSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    fetch('/api/admin/login', {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSignedIn(!data.error);
        nav('/');
      })
      .catch(() => {
        setError(true);
      });
  };

  return (
    <>
      <div className="container" style={{ marginTop: 100 }}>
        {error && <Alert error="Could not login with credentials" />}
        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Vehservoir Admin Login</legend>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                id="username"
                name="username"
                type="text"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                id="password"
                name="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              id="submit"
              className="btn btn-default"
              type="submit"
              role="button"
              name="submit"
            >
              Login
            </button>
          </fieldset>
        </form>
      </div>
    </>
  );
};

export default Login;
