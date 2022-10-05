import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Reservation } from '../components/VehicleParkingLot';

export interface UseReservationSocketProps {
  onReservationStarted: (r: Reservation) => void;
  onReservationEnded: (r: Reservation) => void;
  onReservationSaved: (r: Reservation) => void;
}

export interface TimelineEvent {
  header: string;
  message: string;
  eventId: string;
}

export const useReservationSocket = ({
  onReservationStarted,
  onReservationEnded,
  onReservationSaved,
}: UseReservationSocketProps) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const socket = io();
    socket.on('reservationSaved', (data: Reservation) => {
      const startDate = new Date(data.start).toLocaleString();
      const endDate = new Date(data.end).toLocaleString();
      setTimeline((timeline: TimelineEvent[]) => [
        ...(timeline ?? []),
        {
          header: 'Saved Reservation',
          message: `Vehicle ${data.vehicle.name} was reserved from ${startDate} - ${endDate}`,
          eventId: self.crypto.randomUUID(),
        },
      ]);
      onReservationSaved(data);
    });
    socket.on('reservationStarted', onReservationStarted);
    socket.on('reservationEnded', onReservationEnded);
    return () => {
      socket.close();
    };
  }, []);

  return { timeline };
};
