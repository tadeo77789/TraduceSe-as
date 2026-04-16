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
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../../state/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainStackNavigator } from './MainStackNavigator';
import { Colors } from '../../constants/colors';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStackNavigator /> : <AuthNavigator />}
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
