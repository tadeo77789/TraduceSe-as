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
import { useAuth } from '../providers/AuthContext'; // Importa el hook de autenticación que provee isAuthenticated e isLoading — fuente: app/state/AuthContext.tsx
import { AuthNavigator } from './AuthNavigator'; // Importa el stack de navegación del flujo de autenticación (Login, Register, etc.) — fuente: app/presentation/navigation/AuthNavigator.tsx
import { MainStackNavigator } from './MainStackNavigator'; // Importa el stack raíz para usuarios autenticados (tabs + flujo de contraseña) — fuente: app/presentation/navigation/MainStackNavigator.tsx
import { Colors } from '../../shared/constants/colors'; // Importa la paleta de colores centralizada de la app — fuente: app/constants/colors.ts

export const AppNavigator: React.FC = () => { 
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) { 
    return ( 
      <View style={styles.loading}>
        {/* Contenedor centrado que ocupa toda la pantalla mientras carga */}
        <ActivityIndicator size="large" color={Colors.primary} />
      </View> 
    ); 
  } 

  return ( 
    <NavigationContainer 
      documentTitle={{ formatter: () => 'Traduce Señas' }}
    >
      {isAuthenticated ? <MainStackNavigator /> : <AuthNavigator />}
      {/* Condicional: si hay sesión activa muestra la app principal (MainStackNavigator), si no muestra el flujo de auth (AuthNavigator) */}
    </NavigationContainer> 
  ); 
}; 

const styles = StyleSheet.create({
  loading: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: Colors.primaryBg, 
  }, 
}); 