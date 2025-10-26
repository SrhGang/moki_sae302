import React, { useEffect, useState } from "react";
import "../styles/dashboard.css";
import { useAuthContext } from "contexts/AuthContext";
import useAuth from "../hooks/useAuth" 
import { useNavigate } from "react-router-dom";
import Avatars from "../components/Avatars";

interface Message {
  id: number;
  sender: "me" | "other";
  text: string;
}

interface Conversation {
  id: number;
  name: string;
  status: string;
  messages: Message[];
}

const Dashboard: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      name: "Ruben Merrick",
      status: "Nouveau message",
      messages: [],
    },
    {
      id: 2,
      name: "Adeline Griffis",
      status: "Nouveau message",
      messages: [],
    },
    {
      id: 3,
      name: "Lyda Townsend",
      status: "Vu",
      messages: [
        { id: 1, sender: "other" as const, text: "Salut !" },
        { id: 2, sender: "me" as const, text: "Coucou 😊" },
      ],
    },
  ]);
  const { keys, user } = useAuthContext();
  const navigate = useNavigate();
  const { protect } = useAuth();

   useEffect(()=> {
    if(!keys.accessToken || !keys.refreshToken) {
      navigate('/login');
    }
    
    protect();

    // if (!user?.profileImage) {
    //   navigate('/avatar')
    // }

  }, []);



  const [selectedConv, setSelectedConv] = useState<Conversation | null>(
    conversations[2]
  );
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConv) return;

    const updated: Conversation[] = conversations.map((conv) =>
      conv.id === selectedConv.id
        ? {
            ...conv,
            messages: [
              ...conv.messages,
              { id: Date.now(), sender: "me" as const, text: newMessage },
            ],
          }
        : conv
    );

    setConversations(updated);
    setSelectedConv(updated.find((c) => c.id === selectedConv.id) || null);
    setNewMessage("");
  };

  const userAction = document.querySelector('.user-action') ;
  const modal = document.querySelector('.modal-user');
  const conversationContent = document.querySelector('.chat_content');

  userAction?.addEventListener('click', function() {
    if (modal?.classList.contains('active')) {
      // Fermer le modal
      // modal.classList.remove('active');
      // conversationContent?.classList.remove('scaled');
    } else {
      console.log("modale-activer");
          
      // Ouvrir le modal
      modal?.classList.add('active');
      conversationContent?.classList.add('scaled');
    }
  });

  // Fermer le modal en cliquant sur le fond
  modal?.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.remove('active');
      conversationContent?.classList.remove('scaled');
    }
  });

  if (!user?.profileImage) {
    return (
      <Avatars />
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">

        <div className="sidebar_message">
          
          <i className="icon icon_message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="32" height="32" fill="none"/><path d="M45.15,230.11A8,8,0,0,1,32,224V64a8,8,0,0,1,8-8H216a8,8,0,0,1,8,8V192a8,8,0,0,1-8,8H80Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>
          </i>
          <h3>Message</h3> 
          
        </div>

        <div className="sidebar__search">
          <input className="input_search" type="text" placeholder="Recherche..." />
          <i className="icon icon-search">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
          </i>
        </div>

        <div style={{flex:1, overflowY:"auto"}}>
            <div className="sidebar__list">
            {conversations.map((conv) => (
                <div
                key={conv.id}
                className={`conversation ${
                    selectedConv?.id === conv.id ? "conversation--active" : ""
                }`}
                onClick={() => setSelectedConv(conv)}
                >
                <div className="conversation__avatar"></div>
                <div className="conversation__info">
                    <span className="conversation__name">{conv.name}</span>
                    <span className="conversation__status">{conv.status}</span>
                </div>
                </div>
            ))}
            </div>
        </div>

        <div className="sidebar__profile">
          <div className="sidebar__profile-avatar"></div>
          <div className="sidebar__profile-info">
            <span className="sidebar__profile-name">Moi</span>
            <span className="sidebar__profile-status">En ligne</span>
          </div>
            <div className="user-action">
              <i className="icon icon-menu">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256">
                <path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM128,72a12,12,0,1,0-12-12A12,12,0,0,0,128,72Zm0,112a12,12,0,1,0,12,12A12,12,0,0,0,128,184Z"></path></svg>
              </i>
          </div>

        </div>
      </div>

      {/* Chat area */}
      <div className="chat">
        <div className="modal-user">
          <div className="modal-user-content">
            <div className="modal-card">
              <section className="modal-card-titre semi-bold"> {user?.username} </section>

              <section className="modal-btns">
                <span>Marquer hors ligne</span>
                <span>Se déconnecter</span>
              </section>
            </div>

            <div className="modal-card">
              <section className="modal-card-titre semi-bold">Groupe</section>

                <section className="modal-btns">
                  <span>Créer un groupe</span>
                  <span>Rejoindre un groupe</span>
                </section>
            </div>
          </div>
        </div>

        {selectedConv ? (
          <>
          <div className="chat_content">
            <div className="chat__header">
              <div className="chat__header-avatar">
                <img src="http://localhost:3000/static/media/peeps-avatar-alpha-2.6a6c9d37640551233228.png" alt="" />
              </div>
              <div>
                <p className="chat__header-name">{selectedConv.name}</p>
                <p className="chat__header-status">{selectedConv.status}</p>
              </div>
            </div>

            <div className="chat__messages">
              {selectedConv.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message message--${msg.sender}`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="chat__input">
              <input
                type="text"
                placeholder="Messages"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend} className="btn-send">
                <i className="icon icon-arrow-top">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z"></path></svg>
                </i>
               </button> 
            </div>
          </div>
          </>
        ) : (
          <div className="chat__empty">Sélectionnez une conversation</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
