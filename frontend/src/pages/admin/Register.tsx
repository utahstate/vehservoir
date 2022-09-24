import React, { useState } from 'react';
import Alert from '../../components/common/Alert';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = (): JSX.Element => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const nav = useNavigate();

  const handleSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    fetch('/api/admin/register', {
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
      .then((res) => {
        console.log(res);
        nav('/admin/admins');
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="container" style={{ marginTop: 100 }}>
      {errorMessage.length === 0 && <Alert error={errorMessage} />}
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
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password:</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            id="submit"
            className="btn btn-default"
            type="submit"
            role="button"
            name="submit"
          >
            Register Admin
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default Register;
