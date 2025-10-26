import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3000';

export const useSocket = () => {
  const socketRef = useRef<typeof Socket | null>(null);

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
    });

    socketRef.current.on('disconnect', () => {
      console.log('Déconnecté du serveur Socket.IO');
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
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
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
    subscribeToEvent,
    unsubscribeFromEvent,
  };
};