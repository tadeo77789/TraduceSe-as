import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState, LoginPayload, RegisterPayload } from '../types';

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('@auth_token');
        const userStr = await AsyncStorage.getItem('@auth_user');
        if (token && userStr) {
          setState({
            user: JSON.parse(userStr),
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    loadStoredAuth();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    // TODO: conectar con el backend real
    const mockUser: User = {
      id_usuario: 1,
      nombre: 'Usuario',
      edad: 25,
      email: payload.email,
      tema: false,
      idioma: 'es',
      termino_acept: true,
    };
    const mockToken = 'mock-token-123';
    await AsyncStorage.setItem('@auth_token', mockToken);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(mockUser));
    setState({ user: mockUser, token: mockToken, isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    // TODO: conectar con el backend real
    const mockUser: User = {
      id_usuario: 1,
      nombre: payload.nombre,
      edad: payload.edad,
      email: payload.email,
      tema: false,
      idioma: 'es',
      termino_acept: payload.termino_acept,
    };
    const mockToken = 'mock-token-123';
    await AsyncStorage.setItem('@auth_token', mockToken);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(mockUser));
    setState({ user: mockUser, token: mockToken, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('@auth_token');
    await AsyncStorage.removeItem('@auth_user');
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ ...state, login, register, logout }),
    [state, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
