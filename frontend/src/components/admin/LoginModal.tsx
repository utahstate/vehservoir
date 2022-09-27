import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import Alert from '../common/Alert';
import Modal from '../common/Modal';

export interface LoginModalProps {
  setLoginModalIsOpen: Dispatch<SetStateAction<boolean>>;
}

const LoginModal: FC<LoginModalProps> = ({
  setLoginModalIsOpen,
}): JSX.Element => {
  const { setSignedIn, setSessionOver, setUserId } = useAuthContext();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

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
        if (!data.expiration) {
          setError(data.message);
          return;
        }

        setSignedIn(true);

        setUserId(data.id);

        setSessionOver(new Date(data.expiration));
        setLoginModalIsOpen(false);
      })
      .catch((e) => {
        setError(e);
      });
  };

  return (
    <Modal>
      <>
        {error && <Alert error={error} />}
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
              className="btn btn-primary"
              type="submit"
              role="button"
              name="submit"
              style={{ marginRight: '1rem' }}
            >
              Login
            </button>

            <button
              onClick={() => setLoginModalIsOpen(false)}
              className="btn btn-error"
              role="button"
            >
              Cancel
            </button>
          </fieldset>
        </form>
      </>
    </Modal>
  );
};

export default LoginModal;
