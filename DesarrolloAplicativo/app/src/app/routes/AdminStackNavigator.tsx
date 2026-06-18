/**
 * @file AdminStackNavigator.tsx
 * @description Stack del tab Admin. Contiene el dashboard (pantalla por defecto)
 * y la pantalla de entrenamiento de la IA. Solo se monta cuando el usuario
 * tiene rol admin (chequeo en `MainTabNavigator`).
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminDashboardScreen } from '../../feature/Admin/pages/AdminDashboardScreen';
import { AdminTrainingScreen } from '../../feature/Admin/pages/AdminTrainingScreen';

export type AdminStackParams = {
  Dashboard: undefined;
  Training: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParams>();

export const AdminStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="Training" component={AdminTrainingScreen} />
  </Stack.Navigator>
);
