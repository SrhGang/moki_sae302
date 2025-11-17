import { Socket } from 'socket.io';
import { messageHandlers } from './messageHandlers';
import { userHandlers } from './userHandlers';

const socketHandlers = (socket: Socket, io: any) => {
    userHandlers(socket, io);
    messageHandlers(socket, io);
}

export default socketHandlers;