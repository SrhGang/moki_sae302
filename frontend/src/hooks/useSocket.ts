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
    console.log('📤 Début de sendMessage (frontend)');
    console.log('🎯 Événement:', event);
    console.log('📦 Données à envoyer:', data);
    console.log('🔌 Socket actuel:', socketRef.current ? 'CONNECTÉ' : 'NON CONNECTÉ');
    
    if (socketRef.current) {
        console.log('🚀 Émission du message via socket...');
        console.log('📡 Statut du socket:');
        console.log('  - Connecté:', socketRef.current.connected);
        console.log('  - ID:', socketRef.current.id);
        // console.log('  - État:', socketRef.current.active ? 'ACTIF' : 'INACTIF');
        
        try {
            socketRef.current.emit(event, data);
            console.log('✅ Message émis avec succès');
            console.log('📊 Détails de l\'émission:');
            console.log('  - Event:', event);
            console.log('  - Data size:', JSON.stringify(data).length, 'bytes');
            console.log('  - Timestamp:', new Date().toISOString());
            
        } catch (error: any) {
            console.log('❌ Erreur lors de l\'émission du message:');
            console.log('  - Type:', error.name);
            console.log('  - Message:', error.message);
            console.log('  - Stack:', error.stack);
        }
    } else {
        console.log('❌ Impossible d\'envoyer le message: socket non connecté');
        console.log('🔍 Raisons possibles:');
        console.log('  - Socket non initialisé');
        console.log('  - Connexion perdue');
        console.log('  - Composant démonté');
        console.log('  - Token d\'authentification manquant');
        
        // Vérifier le token
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        console.log('🔑 Token disponible:', token ? 'OUI' : 'NON');
        if (token) {
            console.log('🔑 Token (premiers caractères):', token.substring(0, 20) + '...');
        }
    }
    
    console.log('🏁 Fin de sendMessage (frontend)');
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