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
 * @todo Reemplazar los datos mock de `login` y `register` con llamadas reales al backend.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'; // Importa React y los hooks necesarios: createContext (crear contexto), useContext (consumir contexto), useState (estado local), useEffect (efectos secundarios), useCallback (memorizar funciones), useMemo (memorizar valores) — fuente: node_modules/react
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage para persistir datos clave-valor de forma asíncrona en el dispositivo (token y usuario) — fuente: node_modules/@react-native-async-storage/async-storage
import { User, AuthState, LoginPayload, RegisterPayload } from '../types'; // Importa los tipos TypeScript: User (datos del usuario), AuthState (estado de autenticación), LoginPayload (datos del formulario de login), RegisterPayload (datos del formulario de registro) — fuente: app/types/index.ts

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
        const token = await AsyncStorage.getItem('@auth_token'); // Lee el token JWT guardado bajo la clave '@auth_token'; devuelve string o null si no existe
        const userStr = await AsyncStorage.getItem('@auth_user'); // Lee el objeto usuario serializado como JSON guardado bajo la clave '@auth_user'; devuelve string o null si no existe
        if (token && userStr) { // Condición: si ambos valores existen, la sesión anterior es válida y se restaura
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

  const login = useCallback(async (payload: LoginPayload) => { // Define la acción de login memorizada con useCallback; solo se recrea si cambian sus dependencias (ninguna en este caso)
    // TODO: conectar con el backend real
    const mockUser: User = { // Crea un objeto de usuario simulado para desarrollo mientras no hay backend disponible
      id_usuario: 1, // ID de usuario hardcodeado para el mock
      nombre: 'Usuario', // Nombre de usuario hardcodeado para el mock
      edad: 25, // Edad hardcodeada para el mock
      email: payload.email, // Usa el email real ingresado por el usuario en el formulario de login
      tema: false, // Tema inicial en claro (false = light) para el usuario mock
      idioma: 'es', // Idioma predeterminado español para el usuario mock
      termino_acept: true, // Términos y condiciones aceptados por defecto en el mock
    }; // Cierra el objeto mockUser
    const mockToken = 'mock-token-123'; // Token de autenticación simulado; reemplazar con el JWT real que devuelva el backend
    await AsyncStorage.setItem('@auth_token', mockToken); // Guarda el token simulado en AsyncStorage bajo la clave '@auth_token' para persistir la sesión
    await AsyncStorage.setItem('@auth_user', JSON.stringify(mockUser)); // Serializa y guarda el usuario mock en AsyncStorage bajo la clave '@auth_user'
    setState({ user: mockUser, token: mockToken, isLoading: false, isAuthenticated: true }); // Actualiza el estado global: establece el usuario, el token, desactiva la carga y marca la sesión como autenticada
  }, []); // Array de dependencias vacío: login no depende de ningún valor reactivo externo

  const register = useCallback(async (payload: RegisterPayload) => { // Define la acción de registro memorizada con useCallback; construye un usuario mock a partir del payload recibido
    // TODO: conectar con el backend real
    const mockUser: User = { // Crea un objeto de usuario simulado usando los datos reales ingresados en el formulario de registro
      id_usuario: 1, // ID de usuario hardcodeado para el mock; el backend real asignará el ID real
      nombre: payload.nombre, // Nombre real ingresado por el usuario en el formulario de registro
      edad: payload.edad, // Edad real ingresada por el usuario en el formulario de registro
      email: payload.email, // Correo electrónico real ingresado por el usuario en el formulario de registro
      tema: false, // Tema inicial en claro (false = light) para el nuevo usuario
      idioma: 'es', // Idioma predeterminado español para el nuevo usuario
      termino_acept: payload.termino_acept, // Refleja si el usuario aceptó los términos y condiciones en el formulario
    }; // Cierra el objeto mockUser del registro
    const mockToken = 'mock-token-123'; // Token de autenticación simulado para el registro; reemplazar con el JWT real del backend
    await AsyncStorage.setItem('@auth_token', mockToken); // Guarda el token simulado en AsyncStorage para persistir la nueva sesión tras el registro
    await AsyncStorage.setItem('@auth_user', JSON.stringify(mockUser)); // Serializa y guarda el nuevo usuario en AsyncStorage para restaurar la sesión en reinicios
    setState({ user: mockUser, token: mockToken, isLoading: false, isAuthenticated: true }); // Actualiza el estado global con el nuevo usuario registrado y lo marca como autenticado
  }, []); // Array de dependencias vacío: register no depende de ningún valor reactivo externo

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
