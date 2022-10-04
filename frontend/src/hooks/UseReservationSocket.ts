import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useReservationSocket = ({
  onReservationStarted,
  onReservationEnded,
}: any) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const [reservations, setReservations] = useState<any>();

  useEffect(() => {
    const socket = io();
    socket.on('connect', () => {
      setSocket(socket);
    });
    socket.on('disconnect', () => {
      setSocket(null);
    });
    socket.on(
      'reservationCreated',
      (data: { vehicle: { id: number; name: string } }) => {
        setReservations((reservations: any) => [...(reservations ?? []), data]);
      },
    );
    socket.on('reservationDeleted', (data) => {
      console.log(data);
    });
    socket.on('reservationStarted', onReservationStarted);
    socket.on('reservationEnded', onReservationEnded);
    return () => {
      socket.close();
    };
  }, []);

  return { reservations };
};
