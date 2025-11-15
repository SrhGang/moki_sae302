import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './useSocket';

import { useAuthContext } from "contexts/AuthContext";
import { useApiCall } from "hooks/useApiCall";
import { AccessKey, LoginResult, User } from '../types/index';

const useAuth = () => {
  const[message, setMessage] = useState<string>();

  const navigate = useNavigate();
  const {apiCall} = useApiCall();
  const { setKeys, setUser, clearAuth } = useAuthContext();
  const { sendMessage } = useSocket();

  useEffect(() => {
    // Vérifie l'authentification au chargement
    const checkAuth = async () => {
      try {
        const test = await protect();
      } catch (error) {
        // logout();
      }
    };
    checkAuth();
  }, []);



  const signup = async (username:string, password:string) => {
    if (!username || !password){ 
      setMessage("Veuillez renseigner le mot de passe et le nom d'utilisateur.")
      return;
    }
  
    try {
      const response = await apiCall("/api/signup", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({username, password})
      });
        
    } catch (e) {
        
    }
    return { login, logout, message };
  }

  const login = async (username:string, password:string) => {
    if(!username || !password){
      setMessage("Nom d'ultilisateur ou mot de passe incorrect.")
      return;
    }

    try {

      const response: LoginResult = await apiCall("/api/login", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({username, password}),
        withAuth: false
      });
      console.log( response);
      const newKeys: AccessKey = response.token;
      await setKeys(newKeys);

      return response.code;
      
    } catch (e) {
      
    }
  };

  const protect = async () => {
    try {
      const getUser: User = await apiCall('/api/protect/', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
      });

      sendMessage('protect', getUser.username);

      setUser(getUser);
      console.log('/api/protect/ :', getUser);

      return getUser;
    } catch (e) {
      logout();
    }
  }

  const logout = () => {
    clearAuth(); // Nettoie les données d'authentification
    localStorage.clear(); // Nettoie le localStorage
    navigate('/login');
  };

  return { signup, login, logout, protect, message };
};

export default useAuth;