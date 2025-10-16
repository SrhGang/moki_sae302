// src/types/index.ts


// ================== Auth Types ==================

export interface AccessKey {
  accessToken: string;
  refreshToken: string;
  iat?: number;
  exp?: number;
}

export interface User {
  username: string;
  profileImage?: string;
}

export interface AuthState {
  error: string | null;
  user: User | null;
}

export interface LoginResult {
  success: boolean;
  token: AccessKey;
  user?: User;
  error?: string;
  code?: string;
}

