import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LandingScreen } from '../screens/LandingScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { VerifyCodeScreen } from '../screens/Auth/VerifyCodeScreen';
import { NewPasswordScreen } from '../screens/Auth/NewPasswordScreen';

export type AuthStackParams = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyCode: undefined;
  NewPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParams>();

export const AuthNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Landing" component={LandingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
    <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
  </Stack.Navigator>
);
