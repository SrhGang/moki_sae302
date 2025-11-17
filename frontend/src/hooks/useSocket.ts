import { useEffect, useRef, useState } from 'react';
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

// // ==========================Message========================
// interface Message {
//   id: number;
//   sender: "me" | "other";
//   text: string;
//   timestamp?: string;
// }

// interface Conversation {
//   id: number;
//   name: string;
//   status: string;
//   profile: string;
//   messages: Message[];
// }

// const { socket, sendMessage, subscribeToEvent, unsubscribeFromEvent } = useSocket(); 
// const [conversations, setConversations] = useState<Conversation[]>([]); 
// const [selectedConv, setSelectedConv] = useState<Conversation | null>(conversations[2]);
//   const [newMessage, setNewMessage] = useState("");
//    const [searchUser, setSearchUser] = useState("");
//     const [allUsers, setAllUsers] = useState<Conversation[]>([]); // Tous les utilisateurs du backend
//     const [isLoading, setIsLoading] = useState(true);

    

//  // Récupérer les utilisateurs au chargement
//   useEffect(() => {
//     if (!socket) return;

//     socket.emit('get_users');

//     socket.on('users_list', (data: any[]) => {
//       console.log('Utilisateurs reçus:', data);
      
//       const conversationsFromBackend: Conversation[] = data.map((user) => ({
//         id: user.id,
//         name: user.name,
//         status: user.status || 'Hors ligne',
//         profile: user.avatar || 'default-avatar.png',
//         messages: [] // Sera rempli plus tard
//       }));
      
//       setConversations(conversationsFromBackend);
//       setIsLoading(false);
//     });

//     return () => {
//       socket.off('users_list');
//     };
//   }, [socket]);

//   // Charger l'historique des messages quand on sélectionne une conversation
//   useEffect(() => {
//     if (!socket || !selectedConv) return;

//     // Demander l'historique des messages pour cette conversation
//     socket.emit('get_messages', {
//       recipientId: selectedConv.id,
//       recipientName: selectedConv.name
//     });

//     socket.on('messages_history', (data: any) => {
//       console.log('Historique des messages reçu:', data);
      
//       // Transformer les messages du backend
//       const messagesFromBackend: Message[] = data.messages.map((msg: any) => ({
//         id: msg.id,
//         sender: msg.senderId === 'current_user_id' ? 'me' : 'other', // Ajustez selon votre logique
//         text: msg.text,
//         timestamp: msg.timestamp
//       }));

//       // Mettre à jour la conversation avec les messages
//       setConversations(prevConvs =>
//         prevConvs.map(conv =>
//           conv.id === selectedConv.id
//             ? { ...conv, messages: messagesFromBackend }
//             : conv
//         )
//       );

//       // Mettre à jour selectedConv
//       setSelectedConv(prev =>
//         prev && prev.id === selectedConv.id
//           ? { ...prev, messages: messagesFromBackend }
//           : prev
//       );
//     });

//     return () => {
//       socket.off('messages_history');
//     };
//   }, [socket, selectedConv?.id]); // Se déclenche quand on change de conversation

//   // Écouter les messages entrants en temps réel
//   useEffect(() => {
//     if (!socket) return;

//     socket.on('receive_message', (data: any) => {
//       console.log('Message reçu:', data);
      
//       const newMsg: Message = {
//         id: data.id || Date.now(),
//         sender: data.sender === 'Moi' ? 'me' : 'other',
//         text: data.text,
//         timestamp: data.timestamp || new Date().toISOString()
//       };
      
//       // Mettre à jour conversations
//       setConversations((prevConvs) => 
//         prevConvs.map((conv) => {
//           if (conv.name === data.sender || conv.id === data.senderId) {
//             return {
//               ...conv,
//               messages: [...conv.messages, newMsg]
//             };
//           }
//           return conv;
//         })
//       );

//       // Mettre à jour selectedConv
//       setSelectedConv((prevSelected) => {
//         if (prevSelected && (prevSelected.name === data.sender || prevSelected.id === data.senderId)) {
//           return {
//             ...prevSelected,
//             messages: [...prevSelected.messages, newMsg]
//           };
//         }
//         return prevSelected;
//       });
//     });

//     return () => {
//       socket.off('receive_message');
//     };
//   }, [socket]);

//   // Envoyer un message
//   const handleSend = () => {
//     if (!newMessage.trim() || !selectedConv || !socket) return;

//     const messageData = {
//       recipientId: selectedConv.id,
//       recipientName: selectedConv.name,
//       text: newMessage,
//       timestamp: new Date().toISOString()
//     };

//     // Créer le message pour l'affichage local (optimistic update)
//     const messageToSend: Message = {
//       id: Date.now(), // ID temporaire
//       sender: 'me',
//       text: newMessage,
//       timestamp: messageData.timestamp
//     };

//     // Mettre à jour l'interface immédiatement
//     const updated = conversations.map((conv) =>
//       conv.id === selectedConv.id 
//         ? { ...conv, messages: [...conv.messages, messageToSend] }
//         : conv
//     );

//     setConversations(updated);
//     setSelectedConv(updated.find((c) => c.id === selectedConv.id) || null);

//     // Envoyer au backend via socket
//     socket.emit('send_message', messageData);
    
//     setNewMessage("");
//   };

//   // useEffect(() => {
//   //   setBtnActive(newMessage.trim().length > 0);
//   // }, [newMessage]);

// //  // Écouter les messages entrants
// //   useEffect(() => {
// //     if (!socket) return; // Vérifiez que socket existe

// //     socket.on('receive_message', (data: any) => {
// //       console.log('Message reçu:', data);
      
// //       const newMsg: Message = {
// //         id: Date.now(),
// //         sender: data.sender === 'Moi' ? 'me' : 'other',
// //         text: data.text,
// //         timestamp: data.timestamp || new Date().toISOString()
// //       };
      
// //       setConversations((prevConvs) => 
// //         prevConvs.map((conv) => {
// //           if (conv.name === data.sender || conv.name === data.recipient) {
// //             return {
// //               ...conv,
// //               messages: [...conv.messages, newMsg]
// //             };
// //           }
// //           return conv;
// //         })
// //       );

// //       setSelectedConv((prevSelected) => {
// //         if (prevSelected && (prevSelected.name === data.sender || prevSelected.name === data.recipient)) {
// //           return {
// //             ...prevSelected,
// //             messages: [...prevSelected.messages, newMsg]
// //           };
// //         }
// //         return prevSelected;
// //       });
// //     });

// //     return () => {
// //       socket.off('receive_message');
// //     };
// //   }, [socket]); // Ajoutez socket dans les dépendances

// //   const handleSend = () => {
// //     if (!newMessage.trim() || !selectedConv) return;

// //         const messageToSend: Message = {
// //       id: Date.now(),
// //       sender: 'me',
// //       text: newMessage,
// //       timestamp: new Date().toISOString()
// //     };

// //     const updated = conversations.map((conv) =>
// //       conv.id === selectedConv.id 
// //         ? { ...conv, messages: [...conv.messages, messageToSend] }
// //         : conv
// //     );

// //     setConversations(updated);
// //     setSelectedConv(updated.find((c) => c.id === selectedConv.id) || null);

// //     // Envoyer le message via Socket.IO
// //     sendMessage('send_message', {
// //       recipient: selectedConv.name, // Utiliser un identifiant unique dans une vraie application
// //       text: newMessage,
// //     });
    
// //     setNewMessage("");
// //   };

// //   // +==================== CE VEUX J'AI FAIT ====================+ //

// //   useEffect(() => {
// //     setBtnActive(newMessage.trim().length > 0);
// //   }, [newMessage]);

//   // +==================== FIN ====================+ //


//     // const updated: Conversation[] = conversations.map((conv) =>
//     //   conv.id === selectedConv.id ? {
//     //         ...conv,
//     //         messages: [
//     //           ...conv.messages,
//     //           { id: Date.now(), sender: "me" as const, text: newMessage },
//     //         ],
//     //       }
//     //     : conv
//     // );

//     // setConversations(updated);
//     // setSelectedConv(updated.find((c) => c.id === selectedConv.id) || null);

    
//   // +==================== CE VEUX TU AVAIS FAIT ====================+ //
  
//   // const userAction = document.querySelector('.user-action') ;
//   // const modal = document.querySelector('.modal-user');
//   // const conversationContent = document.querySelector('.chat_content');

//   // userAction?.addEventListener('click', function() {
//   //   if (modal?.classList.contains('active')) {
//   //     // Fermer le modal
//   //     // modal.classList.remove('active');
//   //     // conversationContent?.classList.remove('scaled');
//   //   } else {
//   //     console.log("modale-activer");
          
//   //     // Ouvrir le modal
//   //     modal?.classList.add('active');
//   //     conversationContent?.classList.add('scaled');
//   //   }
//   // });

//   // Fermer le modal en cliquant sur le fond
//   // modal?.addEventListener('click', function(e) {
//   //   if (e.target === modal) {
//   //     modal.classList.remove('active');
//   //     conversationContent?.classList.remove('scaled');
//   //   }
//   // });

//   // +==================== FIN ====================+ //



  
//   // ==========================Fin Message========================

