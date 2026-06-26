/**
 * @file services/api.service.ts
 * @description Instancia global de Axios para el backend. Agrega el JWT del
 * `AuthContext` (si existe en AsyncStorage) como header `Authorization`.
 * Tambien expone un helper para inferir el `user_id` actual desde
 * AsyncStorage — util mientras el AuthContext sigue en mock y el backend
 * acepta `user_id` por body/query como fallback.
 */
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT } from '../../../app/config/api.config';
import type { User } from '../../../shared/types';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@auth_token');
    // El token mock no es un JWT real — no lo enviamos para no disparar 401
    // cuando se conecte el authMiddleware.
    if (token && token !== 'mock-token-123') {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Si AsyncStorage falla, seguimos sin token.
  }
  return config;
});

/** Devuelve el user_id actual leyendo el objeto `@auth_user` de AsyncStorage.
 *  Mientras el AuthContext sea mock, devuelve el id_usuario del mock (1). */
export const getCurrentUserId = async (): Promise<number | null> => {
  try {
    const raw = await AsyncStorage.getItem('@auth_user');
    if (!raw) return null;
    const user = JSON.parse(raw) as Partial<User>;
    return typeof user?.id_usuario === 'number' ? user.id_usuario : null;
  } catch {
    return null;
  }
};
