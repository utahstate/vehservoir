/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuthContext } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import Modal from '../Modal';
import { CalendarStyleWrapper } from './CalendarStyleWrapper';

export const reservationActions = {
  update: (currentReservationData) => {
    const { id, ...dataToSend } = currentReservationData;
    return fetch(`/api/reservation/${id}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });
  },
  create: (currentReservationData) => {
    const { id, ...dataToSend } = currentReservationData;

    return fetch(`/api/reservation`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        credentials: 'include',
      },
      body: JSON.stringify(dataToSend),
    });
  },
  remove: (currentReservationData) => {
    return fetch(`/api/reservation/${currentReservationData.id}`, {
      method: 'DELETE',
    });
  },
};

export const ReservationsCalendar = ({ vehicle, vehicleType }) => {
  const [initialReservations, setInitialReservations] = useState([]);
  const [dateInfo, setDateInfo] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [selectedAction, setSelectedAction] = useState('');

  const calendarRef = useRef();
  const { signedIn } = useAuthContext();

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().removeAllEvents();
    }
    if (dateInfo.start && dateInfo.end && (vehicle || vehicleType)) {
      fetch(
        `/api/reservations/${
          vehicle ? `vehicle/${vehicle.id}` : `type/${vehicleType.id}`
        }?start=${dateInfo.start.toISOString()}&end=${dateInfo.end.toISOString()}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      )
        .then((reservationJsonCollection) => reservationJsonCollection.json())
        .then((reservationsList) =>
          setInitialReservations(
            reservationsList.map(({ id, start, end, request }) => ({
              id,
              title: request ? request.userName : 'Manual',
              start: start,
              end: end,
            })),
          ),
        );
    }
  }, [dateInfo, vehicle, vehicleType]);

  const createFromCalendar = (event) => {
    setSelectedAction('create');
    setCurrentReservation(event);
    reservationActions
      .create({
        start: event.start,
        end: event.end,
        vehicleId: vehicle.id,
      })
      .then((reservation) => reservation.json())
      .then((reservation) => {
        calendarRef.current.getApi().addEvent({
          id: reservation.id,
          title: 'Manual',
          start: reservation.start,
          end: reservation.end,
        });
      });
  };

  const handleEventClick = (reservationInfo) => {
    setSelectedAction('remove');
    setModalIsOpen(true);
    setCurrentReservation(reservationInfo.event);
  };

  const patchReservation = (event) => {
    setSelectedAction('update');
    reservationActions
      .update({
        id: parseInt(event.event.id, 10),
        vehicleId: vehicle.id,
        start: event.event.start,
        end: event.event.end,
      })
      .then(async (res) => {
        if (!res.ok) {
          const { message } = await res.json();
          event.revert();
          toast(message, {
            position: 'bottom-right',
            type: 'error',
          });
        }
      });
  };

  const onDeleteModalSubmit = async () => {
    const deleteStatus = await reservationActions.remove(currentReservation);
    if (deleteStatus.ok) {
      const event = calendarRef.current
        .getApi()
        .getEventById(currentReservation.id);
      event.remove();
      setModalIsOpen(false);
      return;
    }
    toast((await deleteStatus.json()).message, {
      position: 'top-center',
      type: 'error',
    });
  };

  return (
    <div>
      <CalendarStyleWrapper>
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          editable={signedIn}
          selectable={signedIn}
          height={600}
          eventOverlap={!!vehicleType?.id}
          customButtons={{
            customTitle: {
              text: vehicle?.name || vehicleType?.name || '',
            },
          }}
          headerToolbar={{
            left: 'customTitle',
            center: '',
          }}
          allDaySlot={false}
          allDayContent={false}
          initialView="timeGridWeek"
          events={initialReservations}
          datesSet={(dateInfo) => setDateInfo(dateInfo)}
          select={vehicle ? createFromCalendar : null}
          eventClick={signedIn ? handleEventClick : null}
          eventChange={signedIn ? patchReservation : null}
        />
      </CalendarStyleWrapper>
      {modalIsOpen ? (
        <Modal title={''}>
          <h3>Are you sure you want to delete this reservation?</h3>
          <button
            className="btn btn-primary"
            style={{ border: 'none', marginRight: 5 }}
            onClick={onDeleteModalSubmit}
          >
            Yes
          </button>
          <button
            className="btn btn-default"
            onClick={() => setModalIsOpen(false)}
          >
            No
          </button>
        </Modal>
      ) : null}
    </div>
  );
};
