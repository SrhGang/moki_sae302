import { Socket, Server } from "socket.io";
import { connectedUsers } from "../utilis/connectedUsers";
import { Message } from "../models/messageModel";
import jwt from 'jsonwebtoken';

export const messageHandlers = (socket: Socket, io: any) => {

    // Envoi de message via WebSocket
    socket.on('send_message', async (data) => {
        try {
            console.log('📨 Message WebSocket reçu:', data);
            
            const { recipient, content, token } = data;
            
            // Vérification du token JWT
            if (!token) {
                socket.emit('message_error', { error: 'Token manquant' });
                return;
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            const sender = decoded.username;
            
            // Validation des données
            if (!recipient || !content) {
                socket.emit('message_error', { error: 'Destinataire et contenu requis' });
                return;
            }
            
            // Sauvegarde en base
            const message = new Message({ sender, recipient, content });
            await message.save();
            
            const messageData = {
                sender,
                content,
                timestamp: message.timestamp,
                messageId: message._id
            };
            
            // Envoi au destinataire
            const recipientSocketId = connectedUsers.get(recipient);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('receive_message', messageData);
            }
            
            // Confirmation à l'expéditeur
            socket.emit('message_sent', {
                success: true,
                messageId: message._id,
                timestamp: message.timestamp
            });
            
        } catch (error: any) {
            console.error('Erreur envoi message:', error);
            socket.emit('message_error', { error: 'Erreur serveur' });
        }
    });
    
    // Récupération des messages via WebSocket
    socket.on('get_messages', async (data) => {
        try {
            const { otherUser, token } = data;
            
            // Vérification du token JWT
            if (!token) {
                socket.emit('messages_error', { error: 'Token manquant' });
                return;
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            const currentUser = decoded.username;
            
            const messages = await Message.find({
                $or: [
                    { sender: currentUser, recipient: otherUser },
                    { sender: otherUser, recipient: currentUser }
                ]
            }).sort({ timestamp: 1 });
            
            socket.emit('messages_retrieved', { messages });
            
        } catch (error: any) {
            console.error('Erreur récupération messages:', error);
            socket.emit('messages_error', { error: 'Erreur serveur' });
        }
    });
}