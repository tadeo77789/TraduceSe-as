// @ubicacion app/state/AuthContext.tsx
/**
 * @file AuthContext.tsx
 * @description Contexto global de autenticación.
 *
 * Provee el estado de autenticación (`user`, `token`, `isAuthenticated`, `isLoading`)
 * y las acciones `login`, `register` y `logout` a toda la app mediante React Context.
 *
 * Al montar, intenta restaurar la sesión guardada en AsyncStorage
 * (claves `@auth_token` y `@auth_user`).
 *
 * @exports AuthProvider - Componente proveedor que envuelve la app.
 * @exports useAuth - Hook para consumir el contexto desde cualquier componente.
 *
 * `login` y `register` llaman al backend real (`/api/auth/*`) y guardan el
 * JWT que este devuelve; el interceptor de `api.service.ts` lo adjunta como
 * header `Authorization` en el resto de peticiones.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'; // Importa React y los hooks necesarios: createContext (crear contexto), useContext (consumir contexto), useState (estado local), useEffect (efectos secundarios), useCallback (memorizar funciones), useMemo (memorizar valores) — fuente: node_modules/react
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage para persistir datos clave-valor de forma asíncrona en el dispositivo (token y usuario) — fuente: node_modules/@react-native-async-storage/async-storage
import { api } from '../../feature/Translation/services/api.service'; // Instancia de Axios apuntando al backend — fuente: app/infrastructure/api.service.ts
import { ENDPOINTS } from '../config/api.config'; // Rutas de la API (login, register, ...) — fuente: app/config/api.config.ts
import { User, AuthState, LoginPayload, RegisterPayload } from '../../shared/types'; // Importa los tipos TypeScript: User (datos del usuario), AuthState (estado de autenticación), LoginPayload (datos del formulario de login), RegisterPayload (datos del formulario de registro) — fuente: app/types/index.ts

/** Forma del usuario que devuelve el backend (tabla public.users). */
interface BackendUser {
  user_id: number;
  name: string;
  email: string;
}

/** Mapea el usuario del backend (user_id/name) al tipo `User` del frontend
 *  (id_usuario/nombre). Los campos que el backend aún no maneja (edad, tema,
 *  idioma) reciben valores por defecto. */
const mapBackendUser = (u: BackendUser, extras?: Partial<User>): User => ({
  id_usuario: u.user_id,
  nombre: u.name,
  edad: extras?.edad ?? 0,
  email: u.email,
  tema: extras?.tema ?? false,
  idioma: extras?.idioma ?? 'es',
  termino_acept: extras?.termino_acept ?? true,
});

interface AuthContextType extends AuthState { // Define la interfaz del contexto de autenticación; extiende AuthState añadiendo las acciones disponibles
  login: (payload: LoginPayload) => Promise<void>; // Acción de inicio de sesión: recibe email y password, devuelve una promesa que resuelve sin valor
  register: (payload: RegisterPayload) => Promise<void>; // Acción de registro: recibe datos del nuevo usuario, devuelve una promesa que resuelve sin valor
  logout: () => Promise<void>; // Acción de cierre de sesión: no recibe parámetros, devuelve una promesa que resuelve sin valor
} // Cierra la interfaz AuthContextType

const AuthContext = createContext<AuthContextType | null>(null); // Crea el objeto de contexto de React tipado como AuthContextType o null; null es el valor por defecto antes de que el proveedor lo inicialice

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => { // Declara y exporta el componente proveedor; acepta children (cualquier nodo React) para envolver la app y proveer el contexto
  const [state, setState] = useState<AuthState>({ // Estado central de autenticación: agrupa user, token, isLoading e isAuthenticated en un único objeto de estado
    user: null, // Valor inicial de user: null porque aún no hay sesión restaurada ni iniciada
    token: null, // Valor inicial de token: null porque aún no hay token disponible
    isLoading: true, // Valor inicial de isLoading: true para bloquear la UI mientras se intenta restaurar la sesión desde AsyncStorage
    isAuthenticated: false, // Valor inicial de isAuthenticated: false porque no hay sesión confirmada al arrancar
  }); // Cierra la inicialización del useState de AuthState

  useEffect(() => { // Efecto que se ejecuta una sola vez al montar el proveedor (array de dependencias vacío); su objetivo es restaurar la sesión persistida
    const loadStoredAuth = async () => { // Define la función asíncrona interna que lee el token y el usuario guardados en AsyncStorage
      try { // Bloque try: intenta leer los valores de AsyncStorage y actualizar el estado
        const [token, userStr] = await Promise.all([
          AsyncStorage.getItem('@auth_token'),
          AsyncStorage.getItem('@auth_user'),
        ]); // Lee token y usuario en paralelo desde AsyncStorage para reducir el tiempo de inicio
        if (token === 'mock-token-123') { // Sesión mock de versiones anteriores: ya no es válida contra el backend real
          await AsyncStorage.multiRemove(['@auth_token', '@auth_user']); // Limpia la sesión obsoleta para forzar un login real
          setState(prev => ({ ...prev, isLoading: false })); // Termina la carga sin sesión activa
        } else if (token && userStr) { // Condición: si ambos valores existen, la sesión anterior es válida y se restaura
          setState({ // Actualiza el estado completo con los datos recuperados de AsyncStorage
            user: JSON.parse(userStr), // Deserializa el JSON del usuario guardado y lo asigna al campo user del estado
            token, // Asigna el token recuperado al campo token del estado
            isLoading: false, // Marca isLoading como false porque la restauración de sesión terminó correctamente
            isAuthenticated: true, // Marca isAuthenticated como true porque se encontró una sesión válida guardada
          }); // Cierra el setState de sesión restaurada
        } else { // Rama else: no hay sesión guardada, solo se desactiva el indicador de carga
          setState(prev => ({ ...prev, isLoading: false })); // Mantiene el resto del estado igual y pone isLoading en false para indicar que la verificación terminó sin sesión
        } // Cierra el bloque else
      } catch { // Bloque catch: captura cualquier error de lectura de AsyncStorage (p. ej. storage corrupto)
        setState(prev => ({ ...prev, isLoading: false })); // Ante cualquier error, desactiva isLoading para no dejar la app bloqueada en pantalla de carga
      } // Cierra el bloque catch
    }; // Cierra la declaración de loadStoredAuth
    loadStoredAuth(); // Invoca la función asíncrona de restauración de sesión al montar el componente
  }, []); // Array de dependencias vacío: el efecto solo se ejecuta una vez, al montar el componente

  /** Persiste la sesión (token + usuario) en AsyncStorage y el estado global. */
  const persistSession = useCallback(async (user: User, token: string) => {
    await AsyncStorage.setItem('@auth_token', token); // Guarda el JWT real para que el interceptor lo adjunte en cada petición
    await AsyncStorage.setItem('@auth_user', JSON.stringify(user)); // Guarda el usuario serializado para restaurar la sesión en reinicios
    setState({ user, token, isLoading: false, isAuthenticated: true }); // Marca la sesión como activa en el estado global
  }, []);

  const login = useCallback(async (payload: LoginPayload) => { // Acción de login real contra el backend
    const { data } = await api.post(ENDPOINTS.login, {
      email: payload.email,
      password: payload.password,
    }); // POST /auth/login → { success, data: { token, user: { user_id, name, email } } }
    const token: string | undefined = data?.data?.token;
    const backendUser: BackendUser | undefined = data?.data?.user;
    if (!token || !backendUser) throw new Error(data?.message ?? 'Respuesta de login inválida');
    await persistSession(mapBackendUser(backendUser), token);
  }, [persistSession]);

  const register = useCallback(async (payload: RegisterPayload) => { // Acción de registro real contra el backend
    const { data } = await api.post(ENDPOINTS.register, {
      name: payload.nombre, // El backend usa `name` (tabla public.users); el frontend maneja `nombre`
      email: payload.email,
      password: payload.password,
    }); // POST /auth/register → { success, data: { user_id, name, email } } (sin token)
    if (!data?.success) throw new Error(data?.message ?? 'No fue posible registrar el usuario');
    // El registro no devuelve token: iniciamos sesión de inmediato con las
    // mismas credenciales para dejar al usuario autenticado.
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

  const logout = useCallback(async () => { // Define la acción de logout memorizada con useCallback; limpia la sesión tanto en AsyncStorage como en el estado
    await AsyncStorage.removeItem('@auth_token'); // Elimina el token de AsyncStorage para que la sesión no pueda restaurarse en el próximo inicio
    await AsyncStorage.removeItem('@auth_user'); // Elimina el objeto usuario de AsyncStorage para limpiar completamente la sesión persistida
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false }); // Restablece el estado de autenticación a sus valores iniciales: sin usuario, sin token, sin sesión activa
  }, []); // Array de dependencias vacío: logout no depende de ningún valor reactivo externo

  const value = useMemo<AuthContextType>( // Crea el valor del contexto memorizado con useMemo para evitar re-renders innecesarios en los consumidores del contexto
    () => ({ ...state, login, register, logout }), // Combina el estado actual (user, token, isLoading, isAuthenticated) con las tres acciones (login, register, logout)
    [state, login, register, logout] // El valor se recalcula solo si cambia el estado o alguna de las funciones memorizadas
  ); // Cierra useMemo

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>; // Renderiza el proveedor del contexto con el valor calculado, envolviendo todos los componentes hijos que podrán consumir el contexto
}; // Cierra el componente AuthProvider

export const useAuth = () => { // Declara y exporta el hook personalizado para consumir el contexto de autenticación desde cualquier componente
  const ctx = useContext(AuthContext); // Obtiene el valor actual del contexto de autenticación; será null si se usa fuera del proveedor
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider'); // Lanza un error descriptivo si el hook se usa fuera del árbol de AuthProvider, evitando fallos silenciosos
  return ctx; // Devuelve el contexto validado con todas las propiedades de AuthContextType (estado + acciones)
}; // Cierra el hook useAuth
