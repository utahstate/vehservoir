import React, { useEffect, useState } from 'react';
import DeleteAdminModal from '../../components/admin/admins/DeleteAdminModal';
import SaveAdminModal from '../../components/admin/admins/SaveAdminModal';
import { useAuthContext } from '../../context/AuthContext';
import { toTitleCase } from './Vehicles';

export interface AdminData {
  id: number | null;
  username: string;
  password: string;
  creationDate: Date;
}

const actions: Record<string, (d: AdminData) => Promise<Response>> = {
  update: (currentAdminData: AdminData) => {
    const { id, creationDate, ...dataToSend } = currentAdminData;

    return fetch(`/api/admin/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });
  },
  create: (currentAdminData: AdminData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToSend } = currentAdminData;

    return fetch(`/api/admin/register`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        credentials: 'include',
      },
      body: JSON.stringify(dataToSend),
    });
  },
  remove: (currentAdminData: AdminData) => {
    return fetch(`/api/admin/${currentAdminData.id}`, {
      method: 'DELETE',
    });
  },
};

const getAdmins = async () => {
  return fetch('/api/admins', {
    method: 'GET',
    credentials: 'include',
  }).then((adminJsonCollection) => adminJsonCollection.json());
};

const Admins: React.FC = (): JSX.Element => {
  const { signedIn } = useAuthContext();

  const [admins, setAdmins] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentAdminData, setCurrentAdminData] = useState<AdminData>({
    id: null,
    username: '',
    password: '',
    creationDate: new Date(),
  });

  const refreshAdmins = (): void => {
    getAdmins().then((adminPayload) => setAdmins(adminPayload));
  };

  useEffect(() => refreshAdmins(), []);

  const modalProps = {
    title: `${toTitleCase(selectedAction)} Admin`,
    onSubmitAndStatus: async (adminData: AdminData): Promise<Response> => {
      const saveResult = await actions[selectedAction](adminData);
      if (saveResult.ok) {
        refreshAdmins();
        setModalIsOpen(false);
      }
      return saveResult;
    },
    currentAdminData: currentAdminData,
    setCurrentAdminData: setCurrentAdminData,
    isOpen: modalIsOpen,
    setIsOpen: setModalIsOpen,
  };

  const modal =
    selectedAction === 'remove' ? (
      <DeleteAdminModal {...modalProps} />
    ) : (
      <SaveAdminModal {...modalProps} />
    );

  return (
    <>
      <div className="container">
        <h1>Manage Admins</h1>
        {signedIn ? (
          <button
            className="btn btn-default"
            onClick={() => {
              setSelectedAction('create');
              setModalIsOpen(true);
            }}
          >
            Register New Admin +
          </button>
        ) : (
          <></>
        )}
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Creation Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(({ id, username, creationDate }) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{username}</td>
                <td>{new Date(creationDate).toLocaleString()}</td>

                <td>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      gap: '1rem',
                    }}
                  >
                    <a
                      onClick={() => {
                        setSelectedAction('update');
                        setCurrentAdminData({
                          id,
                          username,
                          password: '',
                          creationDate,
                        });
                        setModalIsOpen(!modalIsOpen);
                      }}
                    >
                      Edit
                    </a>
                    <a
                      onClick={() => {
                        setSelectedAction('remove');
                        setCurrentAdminData({
                          id,
                          username,
                          password: '',
                          creationDate,
                        });
                        setModalIsOpen(!modalIsOpen);
                      }}
                    >
                      Delete
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalIsOpen ? modal : <></>}
    </>
  );
};

export default Admins;
