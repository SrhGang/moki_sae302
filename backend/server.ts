import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

import signupRoute from './routes/signupRoute';
import loginRoute from './routes/loginRoute';
import avatarRoute from './routes/avatarRoute';
import tokenRoute from './routes/tokenRoute';
import logoutRoute from './routes/logoutRoute';
import userRoute from './routes/userRoute';
import messageRoute from './routes/messageRoute';

import socketHandlers from './socket/index';
import { connectedUsers } from './utilis/connectedUsers';

import connectDB from './config/db';
import { corsOptions, corsMiddleware } from './config/cors';


const app = express();
const server = createServer(app);
const io = new Server(server, { cors: corsOptions });

connectDB();

app.use(cors(corsOptions));
app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/signup', signupRoute);
app.use('/api/login', loginRoute);
app.use('/api/avatar', avatarRoute);
app.use('/api/refresh', tokenRoute);
app.use('/api/logout', logoutRoute);
app.use('/api/protect', userRoute);
// app.use('/api/messages', messageRoute); // Migré vers WebSocket

io.on('connection', (socket) => { socketHandlers(socket, io); });

// Log au démarrage du serveur
console.log('🚀 Serveur Socket.io démarré');

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

export { io, connectedUsers };
