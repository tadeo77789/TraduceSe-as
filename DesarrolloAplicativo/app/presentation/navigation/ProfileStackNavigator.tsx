/**
 * @file ProfileStackNavigator.tsx
 * @description Stack del tab Profile.
 *
 * Solo contiene la pantalla principal del perfil. El flujo de cambio de
 * contraseña (ForgotPassword → VerifyCode → NewPassword) vive en
 * MainStackNavigator, por encima de los tabs, para que la barra inferior
 * no sea visible durante ese flujo.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';

export type ProfileStackParams = {
  ProfileMain: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParams>();

export const ProfileStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
  </Stack.Navigator>
);
