import { io } from 'socket.io-client';
const socket_ur = 'http://localhost:5000';

const socket = io(socket_ur, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('Connected to websocket');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected ', reason);
});
export default socket;
