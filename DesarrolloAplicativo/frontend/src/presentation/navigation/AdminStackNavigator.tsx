
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminDashboardScreen } from '../screens/Admin/AdminDashboardScreen';
import { AdminTrainingScreen } from '../screens/Admin/AdminTrainingScreen';

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
