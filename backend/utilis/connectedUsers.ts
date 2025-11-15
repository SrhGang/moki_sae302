// Map pour stocker les utilisateurs connectés
// username -> socketId
export const connectedUsers = new Map<string, string>();

// Obtenir les infos de connexion 
export const getConnectedUsers = () => {
    return Array.from(connectedUsers.entries()).map(([username, socketId]) => ({ username, socketId }));
}

// Vérifier si un utilisateur est connecté
export const isUserConnected = (username: string): boolean => {
    return connectedUsers.has(username);
}

// Obtenir le socketId par username
export const getSocketIdByUsername = (username: string): string | null => {
    return connectedUsers.get(username) || null;
}

// Obtenir le username par socketId
export const getUsernameBySocketId = (socketId: string): string | null => {
    for (const [username, sId] of connectedUsers.entries()) {
        if (sId === socketId) {
            return username;
        }
    }
    return null;
}