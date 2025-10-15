import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const[message, setMessage] = useState<string>();

  const navigate = useNavigate();

  useEffect(() => {
  }, []);

  const apiCall = (endpoint: any, successCallback: Function, errorMessage: string) => {
    
  };

  const signup = async (username:string, password:string) => {
    if (!username || !password){ 
      setMessage("Veuillez renseigner le mot de passe et le nom d'utilisateur.")
      return;
    }
  
 try {
      const response = fetch('http://10.51.84.189:3000/api/signup', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({username, password})
      });
      console.log(await response);
      
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
      const response = fetch('http://10.51.84.189:3000/api/login', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({username, password})
      });
      console.log(await response);
      
    } catch (e) {
      
    }
  };

  const logout = () => {
    navigate('/login');
  };

  return { signup, login, logout, message };
};

export default useAuth;