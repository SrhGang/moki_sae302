import { Socket, Server } from "socket.io";
import { connectedUsers } from "../utilis/connectedUsers";

export const messageHandlers = (socket: Socket, io: any) => {

    socket.on('send_message', (data) => {
        console.log('\n✉️  NOUVEAU MESSAGE REÇU');
        console.log('   📍 Socket ID:', socket.id);
        console.log('   👤 Expéditeur:', socket.id);
        console.log('   👥 Destinataire:', data.recipient);
        console.log('   🕒 Timestamp:', new Date().toISOString());
        console.log('   📝 Contenu:', data.message);

        const recipientSocketId = connectedUsers.get(data.recipient);

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receive_message', data);
            
            // Confirmation à l'expéditeur
            socket.emit('message_delivered', {
                success: true,
                recipient: data.recipient,
                timestamp: new Date().toISOString()
            });
        } else {
            console.log('⚠️  Destinataire non connecté, message non délivré');
            socket.emit('message_undelivered', {
                success: false,
                recipient: data.recipient,
                error: 'Destinataire non connecté'
            });
        }
    });
}