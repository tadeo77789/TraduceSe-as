

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../infrastructure/api.service';
import { ENDPOINTS } from '../config/api.config';
import { User, AuthState, LoginPayload, RegisterPayload } from '../types';


interface BackendUser {
  user_id: number;
  name: string;
  email: string;
}


const mapBackendUser = (u: BackendUser, extras?: Partial<User>): User => ({
  id_usuario: u.user_id,
  nombre: u.name,
  edad: extras?.edad ?? 0,
  email: u.email,
  tema: extras?.tema ?? false,
  idioma: extras?.idioma ?? 'es',
  termino_acept: extras?.termino_acept ?? true,
});

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
        const [token, userStr] = await Promise.all([
          AsyncStorage.getItem('@auth_token'),
          AsyncStorage.getItem('@auth_user'),
        ]);
        if (token === 'mock-token-123') {
          await AsyncStorage.multiRemove(['@auth_token', '@auth_user']);
          setState(prev => ({ ...prev, isLoading: false }));
        } else if (token && userStr) {
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

  
  const persistSession = useCallback(async (user: User, token: string) => {
    await AsyncStorage.setItem('@auth_token', token);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(user));
    setState({ user, token, isLoading: false, isAuthenticated: true });
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { data } = await api.post(ENDPOINTS.login, {
      email: payload.email,
      password: payload.password,
    });
    const token: string | undefined = data?.data?.token;
    const backendUser: BackendUser | undefined = data?.data?.user;
    if (!token || !backendUser) throw new Error(data?.message ?? 'Respuesta de login inválida');
    await persistSession(mapBackendUser(backendUser), token);
  }, [persistSession]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { data } = await api.post(ENDPOINTS.register, {
      name: payload.nombre,
      email: payload.email,
      password: payload.password,
    });
    if (!data?.success) throw new Error(data?.message ?? 'No fue posible registrar el usuario');
    
    
    const { data: loginData } = await api.post(ENDPOINTS.login, {
      email: payload.email,
      password: payload.password,
    });
    const token: string | undefined = loginData?.data?.token;
    const backendUser: BackendUser | undefined = loginData?.data?.user;
    if (!token || !backendUser) throw new Error(loginData?.message ?? 'Registro exitoso pero el login falló');
    await persistSession(
      mapBackendUser(backendUser, { edad: payload.edad, termino_acept: payload.termino_acept }),
      token,
    );
  }, [persistSession]);

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
