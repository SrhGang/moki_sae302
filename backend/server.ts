import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import signupRoute from './routes/signupRoute';
import loginRoute from './routes/loginRoute';
import avatarRoute from './routes/avatarRoute';
import tokenRoute from './routes/tokenRoute';
import logoutRoute from './routes/logoutRoute';
import userRoute from './routes/userRoute';
import messageRoute from './routes/messageRoute';

import connectDB from './config/db';
import { corsOptions, corsMiddleware } from './config/cors';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: corsOptions });

const connectedUsers = new Map<string, string>();

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
app.use('/api/messages', messageRoute);

io.on('connection', (socket) => {
    socket.on('authenticate', (token) => {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY!) as { username: string };
            connectedUsers.set(decoded.username, socket.id);
            socket.join(decoded.username);
        } catch (error) {
            socket.disconnect();
        }
    });

    socket.on('send_message', (data) => {
        const recipientSocketId = connectedUsers.get(data.recipient);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receive_message', data);
        }
    });
 
    socket.on('disconnect', () => {
        for (const [username, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(username);
                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

export { io, connectedUsers };
