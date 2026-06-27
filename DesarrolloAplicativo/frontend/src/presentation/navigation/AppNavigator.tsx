

import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../../shared/state/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainStackNavigator } from './MainStackNavigator';
import { Colors } from '../../shared/constants/colors';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>{/* Contenedor centrado que ocupa toda la pantalla mientras carga */}
        <ActivityIndicator size="large" color={Colors.primary} />{/* Spinner de carga grande con el color primario de la app (#7C3AED) */}
      </View>
    );
  }

  return (
    <NavigationContainer
      documentTitle={{ formatter: () => 'Traduce Señas' }}
    >
      {isAuthenticated ? <MainStackNavigator /> : <AuthNavigator />}{/* Condicional: si hay sesión activa muestra la app principal (MainStackNavigator), si no muestra el flujo de auth (AuthNavigator) */}
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
