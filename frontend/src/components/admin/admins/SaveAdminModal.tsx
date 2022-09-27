import React, { FC, useState } from 'react';
import Modal from '../../common/Modal';
import { AdminModalProps } from './adminData';
import Alert from '../../common/Alert';

const SaveAdminModal: FC<AdminModalProps> = ({
  title,
  onSubmitAndStatus,
  currentAdminData,
  setCurrentAdminData,
  setIsOpen,
}) => {
  const [error, setError] = useState<string>('');

  return (
    <Modal>
      <>
        {error && <Alert error={error}></Alert>}
        <form
          autoComplete="off"
          onSubmit={async (e) => {
            e.preventDefault();

            const submitResult = await onSubmitAndStatus(currentAdminData);
            if (submitResult.ok) {
              return;
            }

            const submitResultMessage = (await submitResult.json()).message;
            setError(
              submitResultMessage && submitResultMessage.forEach
                ? submitResultMessage.join(', ')
                : submitResultMessage,
            );
          }}
        >
          <fieldset>
            <legend>{title}</legend>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                name="username"
                id="username"
                type="text"
                autoComplete="off"
                onChange={(e) => {
                  setCurrentAdminData({
                    ...currentAdminData,
                    username: e.target.value,
                  });
                }}
                value={currentAdminData?.username || ''}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">
                {title.includes('Create') ? 'Password:' : 'New Password'}
              </label>
              <input
                name="password"
                id="password"
                type="password"
                autoComplete="off"
                onChange={(e) => {
                  setCurrentAdminData({
                    ...currentAdminData,
                    password: e.target.value,
                  });
                }}
                value={currentAdminData?.password || ''}
              />
            </div>

            <div className="form-group">
              <input
                type="submit"
                value="Confirm"
                className="btn btn-primary"
              />
              <button
                className="btn btn-error"
                onClick={() => setIsOpen(false)}
                style={{ marginLeft: 5 }}
              >
                Cancel
              </button>
            </div>
          </fieldset>
        </form>
      </>
    </Modal>
  );
};

export default SaveAdminModal;
