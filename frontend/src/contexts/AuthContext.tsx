// contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { AccessKey, User, AuthState  } from '../types';


// ================== TYPES ==================
interface AuthContextState extends AuthState {
  keys: AccessKey;
  isInitialized: boolean; 
  isLoading: boolean;
}

interface AuthContextValue extends AuthContextState {
  // Actions
  setKeys: (keys: AccessKey) => void;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  updateUserState: (updates: Partial<Pick<AuthState, 'user' | 'error'>>) => void;
}

// ================== CONSTANTS ==================
const STORAGE_KEYS = {
  USER_DATA: process.env.EXPO_PUBLIC_USER_DATA_KEY || 'userData',
  ACCESS_KEY: process.env.EXPO_PUBLIC_ACCESS_KEY || 'accessKey',
} as const;

// ================== REDUCER ==================
type AuthAction =
  | { type: 'SET_KEYS'; payload: AccessKey }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_AUTH' }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'UPDATE_USER_STATE'; payload: Partial<Pick<AuthState, 'user' | 'error'>> };

const initialState: AuthContextState = {
  keys: {} as AccessKey,
  user: null,
  error: null,
  isInitialized: false,
  isLoading: false,
};


const authReducer = (state: AuthContextState, action: AuthAction): AuthContextState => {
  
  
  switch (action.type) {
    case 'SET_KEYS': {

      return {
        ...state,
        keys: { ...action.payload },
      };
    }
    case 'SET_USER': {

      return {
        ...state,
        user: action.payload,
      };
    }
    case 'SET_ERROR': {
      if (state.error === action.payload) return state;
      return {
        ...state,
        error: action.payload,
      };
    }
    case 'SET_LOADING': {
      if (state.isLoading === action.payload) return state;
      return {
        ...state,
        isLoading: action.payload,
      };
    }
    case 'CLEAR_AUTH':
      return {
        ...initialState,
        isInitialized: true,
      };
    case 'SET_INITIALIZED': {
      if (state.isInitialized === action.payload) return state;
      return {
        ...state,
        isInitialized: action.payload,
      };
    }
    case 'UPDATE_USER_STATE': {
      const newState = {
        ...state,
        ...action.payload,
      };
    
      
      return newState;
    }
    default:
      return state;
  }
};

// ================== STORAGE UTILITIES ==================
export const saveUserToStorage = async (userData: User, accessKey: AccessKey): Promise<void> => {
  try {

    const userJson = JSON.stringify(userData);
    const keyJson = JSON.stringify(accessKey);
    
    await Promise.all([
      localStorage.setItem(STORAGE_KEYS.USER_DATA, userJson),
      localStorage.setItem(STORAGE_KEYS.ACCESS_KEY, keyJson),
    ]);
    
    // Verify the data was saved
    const [savedUser, savedKeys] = await Promise.all([
      localStorage.getItem(STORAGE_KEYS.USER_DATA),
      localStorage.getItem(STORAGE_KEYS.ACCESS_KEY),
    ]);
  } catch (error) {
    
    throw error;
  }
};

export const loadUserFromStorage = async (): Promise<{ user: User | null; accessKey: AccessKey | null }> => {
  try {
    
    
    const [userJson, accessKeyJson] = await Promise.all([
      localStorage.getItem(STORAGE_KEYS.USER_DATA),
      localStorage.getItem(STORAGE_KEYS.ACCESS_KEY),
    ]);
    
    if (!userJson || !accessKeyJson) {
      
      return { user: null, accessKey: null };
    }
    
    let user: User;
    let accessKey: AccessKey;
    
    try {
      user = JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Erreur parsing user data:', error);
      return { user: null, accessKey: null };
    }
    
    try {
      accessKey = JSON.parse(accessKeyJson) as AccessKey;
    } catch (error) {
      console.error('Erreur parsing access key:', error);
      return { user: null, accessKey: null };
    }
    
    // Migration des anciennes données si nécessaire
    if (user && (user as any).isVerified !== undefined) {
      
      const migratedUser: User = {
        ...user,
      };
      delete (migratedUser as any).isVerified;
      
      // Sauvegarder les données migrées
      await saveUserToStorage(migratedUser, accessKey);
      return { user: migratedUser, accessKey };
    }
    
    return { user, accessKey };
  } catch (error) {
    
    return { user: null, accessKey: null };
  }
};

export const clearStorageData = async (): Promise<void> => {
  try {
    
    
    await Promise.all([
      localStorage.removeItem(STORAGE_KEYS.ACCESS_KEY),
      localStorage.removeItem(STORAGE_KEYS.USER_DATA),
    ]);
    
    
  } catch (error) {
    
    throw error;
  }
};

// ================== CONTEXT ==================
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ================== PROVIDER ==================

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ================== ACTIONS (MÉMORISÉES) ==================
  // ✅ Mémoriser setKeys pour éviter les re-créations
  const setKeys = useCallback(async (keys: AccessKey) => {
    
    // Sauvegarder dans le state
    dispatch({ type: 'SET_KEYS', payload: keys });
    
    // Sauvegarder dans le stockage
    try {
      await localStorage.setItem(STORAGE_KEYS.ACCESS_KEY, JSON.stringify(keys));
      
    } catch (error) {
      
    }
  }, [state.keys]);

  // ✅ Mémoriser les autres actions
  const setUser = useCallback(async (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
    if (user) {
      const accessKey = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESS_KEY) || '{}');
      await saveUserToStorage(user, accessKey);
    }
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const clearAuth = useCallback(() => {
    dispatch({ type: 'CLEAR_AUTH' });
  }, []);

  const updateUserState = useCallback((updates: Partial<Pick<AuthState, 'user'| 'error'>>) => {
    
    dispatch({ type: 'UPDATE_USER_STATE', payload: updates });
  }, []);

  // ================== INITIALIZATION ==================
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user, accessKey } = await loadUserFromStorage();
        console.log("{ user, accessKey } : ", { user, accessKey });
        
        if (user && accessKey) {
          dispatch({ type: 'SET_USER', payload: user });
          dispatch({ type: 'SET_KEYS', payload: accessKey });
        }

      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Erreur lors du chargement des données d\'authentification' });
      } finally {
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      }
    };

    initializeAuth();
  }, []); // ✅ Tableau vide pour ne s'exécuter qu'une seule fois

  // ================== VALUES (MÉMORISÉES) ==================
  // ✅ Mémoriser la valeur du contexte pour éviter les re-renders
  const value: AuthContextValue = useMemo(() => ({
    ...state,
    setKeys,
    setUser,
    setError,
    setLoading,
    clearAuth,
    updateUserState,
  }), [
    state,
    setKeys,
    setUser,
    setError,
    setLoading,
    clearAuth,
    updateUserState,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ================== HOOK ==================
export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// ================== UTILITIES ==================
/**
 * Vérifie si les clés d'accès sont valides
 */
export const validateKeys = (keys: AccessKey | null): boolean => {
  if (!keys?.accessToken || !keys?.refreshToken ) {
    return false;keys
  }

  return true;
};

// ✅ Mémoriser la fonction waitForValidKeys
let waitForValidKeysCache: Promise<AccessKey> | null = null;

/**
 * Fonction d'attente pour des clés valides
 */
export const waitForValidKeys = async (timeout = 5000): Promise<AccessKey> => {
  
  
  // ✅ Éviter les appels multiples simultanés
  if (waitForValidKeysCache) {
    
    return waitForValidKeysCache;
  }
  
  const startTime = Date.now();

  waitForValidKeysCache = new Promise(async (resolve, reject) => {
    const checkKeys = async () => {
      try {
        // 1. Lecture depuis le stockage
        const storedKeys = await localStorage.getItem(STORAGE_KEYS.ACCESS_KEY);
        
        
        if (!storedKeys) {
          throw new Error('Aucune clé trouvée dans le stockage');
        }

        const keys: AccessKey = JSON.parse(storedKeys);
        

        // 2. Validation
        if (validateKeys(keys)) {
          
          waitForValidKeysCache = null; // Nettoyer le cache
          resolve(keys);
          return true;
        }

        // 3. Vérification du timeout
        if (Date.now() - startTime > timeout) {
          throw new Error(`Timeout (${timeout}ms) atteint`);
        }

        return false;

      } catch (error) {
        if (Date.now() - startTime > timeout) {
          
          waitForValidKeysCache = null; // Nettoyer le cache
          reject(error);
          return true;
        }
        return false;
      }
    };

    // Premier essai immédiat
    if (await checkKeys()) return;

    // Puis vérification périodique
    const interval = setInterval(async () => {
      if (await checkKeys()) {
        clearInterval(interval);
      }
    }, 300);
    
    // Nettoyage en cas de timeout
    setTimeout(() => {
      clearInterval(interval);
      if (waitForValidKeysCache) {
        
        waitForValidKeysCache = null;
        reject(new Error('Timeout global atteint'));
      }
    }, timeout);
  });

  return waitForValidKeysCache;
};
