import React, { FC, useState } from 'react';
import { toTitleCase } from '../../../pages/admin/Vehicles';
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
                onChange={(e) => {
                  setCurrentAdminData({
                    ...currentAdminData,
                    username: toTitleCase(e.target.value),
                  });
                }}
                value={currentAdminData?.username || ''}
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
