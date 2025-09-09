import { useState, useEffect } from 'react';
import { Confidentials, AuthState } from 'types';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    auth: { accessToken: '' },
    accessToken: '',
    loading: true,
    nextStep: false,
    error: '',
    successMessage: '',
    codeSent: false,
    isAuthenticated: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (accessToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setState((prevState) => ({
            ...prevState,
            user: parsedUser,
            accessToken,
            loading: false,
            isAuthenticated: true,
          }));
        } else {
          setState((prevState) => ({
            ...prevState,
            loading: false,
          }));
        }
      } catch (err) {
        console.error('Error fetching from localStorage', err);
        setState((prevState) => ({
          ...prevState,
          loading: false,
        }));
      }
    };

    initializeAuth();
  }, []);

  const handleResponse = (response: any, successCallback: Function, errorMessage: string) => {
    if (response.status === 200) {
      successCallback();
    } else {
      setState((prevState) => ({
        ...prevState,
        nextStep: false,
        isAuthenticated: false,
        error: errorMessage,
      }));
    }
  };

  const login = async (credentials: Confidentials) => {
    try {
      const response = await axiosInstance.post('', credentials);// AJOUTER L'URL
      handleResponse(response, () => {
        const { message, data } = response.data;
        const { username, role, isVerified, isDeleted, email } = data;

        setState((prevState) => ({
          ...prevState,
          user: { username, role, isVerified, isDeleted, email },
          nextStep: true,
          codeSent: true,
          successMessage: message,
        }));
      }, 'Échec de la connexion.');
    } catch (err: any) {
      console.error('Login failed:', err);
      setState((prevState) => ({
        ...prevState,
        nextStep: false,
        codeSent: false,
        error: err.response?.data?.message || 'Échec de la connexion.',
      }));
    }
  };

  const verifyCode = async (email: string, verificationCode: string) => {
    try {
      const response = await axios.post(
        '', // AJOUTER L'URL
        { email, code: verificationCode },
        { headers: { 'Content-Type': 'application/json' } }
      );
      handleResponse(response, () => {
        const { token: accessToken } = response.data;
        setState((prevState) => ({
          ...prevState,
          auth: { accessToken },
          accessToken,
          isAuthenticated: true,
          nextStep: true,
          successMessage: 'Authentification réussie.',
        }));

        localStorage.setItem('accessToken', accessToken);
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        } else {
          console.warn('Aucun utilisateur trouvé pour stocker dans localStorage');
        }
      }, 'Échec de la vérification du code.');
    } catch (err: any) {
      console.error('Code verification failed:', err);
      setState((prevState) => ({
        ...prevState,
        nextStep: false,
        isAuthenticated: false,
        error: err.response?.data?.message || 'Échec de la vérification du code.',
      }));
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setState({
      user: null,
      auth: { accessToken: '' },
      accessToken: '',
      loading: false,
      nextStep: false,
      error: '',
      successMessage: '',
      codeSent: false,
      isAuthenticated: false,
    });
    navigate('/login');
  };

  return { ...state, login, logout, verifyCode };
};

export default useAuth;