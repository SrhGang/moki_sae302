import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuthContext } from 'contexts/AuthContext';

const SOCKET_SERVER_URL = 'http://localhost:3000';

interface UserSearch {
  username: string; 
  socketId: string | null;
}

export const useSocket = () => {
  const socketRef = useRef<typeof Socket | null>(null);
  const [message, setMessage] = useState([]);
  const [userSearch, setUserSearch] = useState<{ users: UserSearch[] }>({ users: [] });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { keys } = useAuthContext();

  useEffect(() => {
    // Initialiser la connexion Socket.IO
    socketRef.current = io(SOCKET_SERVER_URL, {
      // Options de configuration
      transports: ['websocket'],
      autoConnect: true,
    });

    // Gestionnaires d'événements
    socketRef.current.on('connect', () => {
      console.log('Connecté au serveur Socket.IO');
      // Tentative d'authentification automatique via token stocké
      try {
        
        if (keys) {
          if (keys.accessToken) {
            socketRef.current?.emit('protect', keys.accessToken);
          }
        }
      } catch (err) {
        console.log('❌ Erreur lors de la tentative d\'auth auto:', err);
      }
    });

    socketRef.current.on('authenticate_success', (data: any) => {
      console.log('🔐 authenticate_success:', data);
      setIsAuthenticated(true);
    });

    socketRef.current.on('authenticate_error', (data: any) => {
      console.log('🔐 authenticate_error:', data);
      setIsAuthenticated(false);
    });

    // Handlers pour la recherche d'utilisateurs (une seule fois au connect)
    socketRef.current.on('user_found', (data: { users: UserSearch[] }) => {
      setUserSearch(data);

    });

    socketRef.current.on('user_not_found', (data: any) => {
      console.log('🔍 user_not_found:', data);
      setUserSearch({ users: [] });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Déconnecté du serveur Socket.IO');
      setIsAuthenticated(false);
    });

    // Nettoyage à la déconnexion
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Fonction pour envoyer des messages
  const sendMessage = (event: string, data: any) => {
    console.log('📤 Début de sendMessage (frontend)');
    console.log('🎯 Événement:', event);
    console.log('📦 Données à envoyer:', data);
    console.log('🔌 Socket actuel:', socketRef.current ? 'CONNECTÉ' : 'NON CONNECTÉ');
    
    if (socketRef.current) {
        try {
            socketRef.current.emit(event, data);
            console.log('✅ Message émis avec succès');
        } catch (error: any) {
            console.log('❌ Erreur lors de l\'émission du message:');
            console.log('  - Type:', error.name);
            console.log('  - Message:', error.message);
            console.log('  - Stack:', error.stack);
        }
    } else {
        console.log('❌ Impossible d\'envoyer le message: socket non connecté');
    }
    console.log('🏁 Fin de sendMessage (frontend)');
  };

  // Fonction dédiée pour la recherche d'utilisateurs
  const searchUser = (username: string) => {
    if (!socketRef.current) {
      console.log('❌ Socket non connecté');
      return;
    }
    console.log('🔍 Recherche utilisateur:', username);
    socketRef.current.emit('search_user', { username });
  };

  // Fonction pour écouter les événements
  const subscribeToEvent = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Fonction pour arrêter d'écouter les événements
  const unsubscribeFromEvent = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket: socketRef.current,
    sendMessage,
    searchUser,
    subscribeToEvent,
    unsubscribeFromEvent,
    message,
    userSearch,
    isAuthenticated
  };
};