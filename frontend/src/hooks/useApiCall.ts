import { useCallback } from "react";
import { useAuthContext } from "../contexts/AuthContext";

export const useApiCall = () => {
  const { keys } = useAuthContext();

  // Fonction de base (prototype conceptuel)
  const baseApiCall = useCallback(async <T>(
    endpoint: string, 
    options: RequestInit & { withAuth?: boolean; withTimeout?: boolean } = {}
  ): Promise<T> => {
    const { withAuth = true, withTimeout = false, ...fetchOptions } = options;
    
    // console.log('API Call to:', endpoint);
    // console.log('Options:', options);
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    // Ajouter les headers existants s'ils existent
    if (fetchOptions.headers) {
      Object.assign(headers, fetchOptions.headers);
    }
    
    if (withAuth && keys?.accessToken) {
      headers.Authorization = `Bearer ${keys.accessToken}`;
    } else {
      // console.log('⚠️ No access token available for authenticated request');
      if (withAuth) {
        throw new Error('No access token available for authenticated request');
      }
    }

    const config: RequestInit = { ...fetchOptions, headers };
    
    if (withTimeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 30000);
      config.signal = controller.signal;
    }

    // console.log('Request config:', config);

    const response = await fetch(`http://localhost:3000${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    // console.log('API Response:', data);
    return data;
  }, [ keys]);

  return { apiCall: baseApiCall };
};
