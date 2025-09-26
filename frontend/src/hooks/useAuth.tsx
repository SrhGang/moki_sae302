import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {

  const navigate = useNavigate();

  useEffect(() => {
  }, []);

  const apiCall = (response: any, successCallback: Function, errorMessage: string) => {

  };

  const login = async () => {
 
  };

  const logout = () => {
    navigate('/login');
  };

  return { login, logout };
};

export default useAuth;