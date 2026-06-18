/**
 * @file ProfileStackNavigator.tsx
 * @description Stack del tab Profile.
 *
 * Contiene la pantalla principal del perfil y las pantallas de información
 * legal (Términos y Condiciones, Política de Privacidad). El flujo de cambio
 * de contraseña vive en MainStackNavigator para ocultar la barra inferior.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../../feature/Profile/pages/ProfileScreen';
import { TermsScreen } from '../../feature/Profile/pages/TermsScreen';
import { PrivacyPolicyScreen } from '../../feature/Profile/pages/PrivacyPolicyScreen';

export type ProfileStackParams = {
  ProfileMain: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParams>();

export const ProfileStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="Terms" component={TermsScreen} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
  </Stack.Navigator>
);
