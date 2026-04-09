/**
 * @file ProfileStackNavigator.tsx
 * @description Stack anidado dentro del tab Profile.
 *
 * Permite al usuario autenticado navegar al flujo de cambio de contraseña
 * (ForgotPassword → VerifyCode → NewPassword) sin salir de la app.
 *
 * Rutas:
 * - `ProfileMain`    → pantalla principal del perfil.
 * - `ForgotPassword` → ingreso de correo para envío de código.
 * - `VerifyCode`     → verificación OTP de 6 dígitos.
 * - `NewPassword`    → establecer nueva contraseña.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { VerifyCodeScreen } from '../screens/Auth/VerifyCodeScreen';
import { NewPasswordScreen } from '../screens/Auth/NewPasswordScreen';

export type ProfileStackParams = {
  ProfileMain: undefined;
  ForgotPassword: undefined;
  VerifyCode: undefined;
  NewPassword: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParams>();

export const ProfileStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
    <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
  </Stack.Navigator>
);
