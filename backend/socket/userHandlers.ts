import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { connectedUsers, getUsernameBySocketId, getSocketIdByUsername } from "../utilis/connectedUsers";

interface IUserPayload {
    username: string;
    socketId: string;
}

export const userHandlers = (socket: Socket, io: any) => {
    socket.on('disconnect', (reason) => {
        console.log('\n🔌 DÉCONNEXION SOCKET');
        console.log('   👥 Liste restante:', Array.from(connectedUsers.entries()));
    });

    socket.on('protect', async (token) => {
        console.log('\n🔐 TENTATIVE D\'AUTHENTIFICATION');
        console.log('   📍 Socket ID:', socket.id);

        try {
            if (!token) {
                throw new Error('Token manquant');
            }

            const decoded = await jwt.verify(token, process.env.SECRET_KEY!) as { username: string };

            // Vérifier si l'utilisateur est déjà connecté
            const existingSocketId = connectedUsers.get(decoded.username);
            if (existingSocketId) {
                console.log('   ⚠️  Utilisateur déjà connecté, remplacement de la connexion');

            }

            connectedUsers.set(decoded.username, socket.id);
            socket.join(decoded.username);

            socket.emit('authenticate_success', {
                success: true,
                username: decoded.username,
                socketId: socket.id
            });

            console.log('   🎉 Authentification réussie pour:', decoded.username);
            console.log('   📊 Total connectés après auth:', connectedUsers.size);
            console.log('   👥 Liste complète:', Array.from(connectedUsers.entries()));

        } catch (error: any) {
            console.log('   ❌ ÉCHEC AUTHENTIFICATION');
            console.log('   💥 Erreur:', error.message);
            console.log('   🏷️  Type d\'erreur:', error.name);


            socket.emit('authenticate_error', {
                success: false,
                error: error.message,
                code: error.name
            });

            console.log('   🔌 Déconnexion du socket...');
            socket.disconnect();
        }
    });

    socket.on('search_user', (payload: IUserPayload) => {
        console.log("[userHandlers] Utilisateur demander :", payload);
        const username = payload.username;

        if (!username) {
            console.log('   ❌ Paramètre invalide pour search_user');
            io.to(socket.id).emit('user_not_found', { username: null });
            return;
        }

        const storedSocketId = getSocketIdByUsername(username);
        console.log("getSocketIdByUsername : ", storedSocketId);

        if (storedSocketId) {
            io.to(socket.id).emit('user_found', { username, socketId: storedSocketId });
        } else {
            io.to(socket.id).emit('user_not_found', { username });
        }
    });
}