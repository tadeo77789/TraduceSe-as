// Ubicación: app/presentation/navigation/AppNavigator.tsx
/**
 * @file AppNavigator.tsx
 * @description Navegador raíz de la aplicación.
 *
 * Envuelve toda la navegación en `NavigationContainer` y decide qué stack
 * mostrar según el estado de autenticación:
 * - `isLoading = true` → spinner de carga mientras se restaura la sesión.
 * - `isAuthenticated = true` → `MainTabNavigator` (app principal).
 * - `isAuthenticated = false` → `AuthNavigator` (flujo de login/registro).
 */
import React from 'react'; // Importa React; necesario para usar JSX — fuente: node_modules/react
import { ActivityIndicator, View, StyleSheet } from 'react-native'; // Importa componentes nativos: ActivityIndicator (spinner), View (contenedor), StyleSheet (estilos) — fuente: node_modules/react-native
import { NavigationContainer } from '@react-navigation/native'; // Importa el contenedor raíz de navegación que envuelve toda la app — fuente: node_modules/@react-navigation/native
import { useAuth } from '../../state/AuthContext'; // Importa el hook de autenticación que provee isAuthenticated e isLoading — fuente: app/state/AuthContext.tsx
import { AuthNavigator } from './AuthNavigator'; // Importa el stack de navegación del flujo de autenticación (Login, Register, etc.) — fuente: app/presentation/navigation/AuthNavigator.tsx
import { MainStackNavigator } from './MainStackNavigator'; // Importa el stack raíz para usuarios autenticados (tabs + flujo de contraseña) — fuente: app/presentation/navigation/MainStackNavigator.tsx
import { Colors } from '../../constants/colors'; // Importa la paleta de colores centralizada de la app — fuente: app/constants/colors.ts

export const AppNavigator: React.FC = () => { // Define y exporta el componente funcional AppNavigator; es el navegador raíz que renderiza toda la app
  const { isAuthenticated, isLoading } = useAuth(); // Extrae del contexto de auth: isAuthenticated (si hay sesión activa) e isLoading (si se está restaurando la sesión desde AsyncStorage)

  if (isLoading) { // Rama condicional: se ejecuta solo mientras la sesión se está restaurando del almacenamiento local
    return ( // Retorna la pantalla de carga antes de saber si el usuario está autenticado
      <View style={styles.loading}>{/* Contenedor centrado que ocupa toda la pantalla mientras carga */}
        <ActivityIndicator size="large" color={Colors.primary} />{/* Spinner de carga grande con el color primario de la app (#7C3AED) */}
      </View> // Cierra el View de pantalla de carga
    ); // Cierra el return del bloque isLoading
  } // Cierra el bloque condicional de carga

  return ( // Retorna el árbol de navegación principal una vez que se conoce el estado de autenticación
    <NavigationContainer // Contenedor raíz obligatorio de React Navigation; gestiona el estado de la pila de navegación
      documentTitle={{ formatter: () => 'Traduce Señas' }}
    >
      {isAuthenticated ? <MainStackNavigator /> : <AuthNavigator />}{/* Condicional: si hay sesión activa muestra la app principal (MainStackNavigator), si no muestra el flujo de auth (AuthNavigator) */}
    </NavigationContainer> // Cierra el NavigationContainer raíz
  ); // Cierra el return principal del componente
}; // Cierra la definición del componente AppNavigator

const styles = StyleSheet.create({ // Crea el objeto de estilos estático para el componente; StyleSheet.create optimiza el rendimiento
  loading: { // Estilos del contenedor de la pantalla de carga
    flex: 1, // Ocupa todo el espacio disponible de la pantalla en el eje principal
    alignItems: 'center', // Centra el spinner horizontalmente
    justifyContent: 'center', // Centra el spinner verticalmente
    backgroundColor: Colors.primaryBg, // Establece el color de fondo usando el token de color de fondo primario de la app
  }, // Cierra el objeto de estilos 'loading'
}); // Cierra StyleSheet.create
