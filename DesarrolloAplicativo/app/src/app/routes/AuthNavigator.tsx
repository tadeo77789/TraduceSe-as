

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LandingScreen } from '../../feature/homescreen/pages/LandingScreen';
import { LoginScreen } from '../../feature/auth/pages/LoginScreen';
import { RegisterScreen } from '../../feature/auth/pages/RegisterScreen';
import { ForgotPasswordScreen } from '../../feature/auth/pages/ForgotPasswordScreen';
import { VerifyCodeScreen } from '../../feature/auth/pages/VerifyCodeScreen';
import { NewPasswordScreen } from '../../feature/auth/pages/NewPasswordScreen';
import { TermsScreen } from '../../feature/Profile/pages/TermsScreen';
import { PrivacyPolicyScreen } from '../../feature/Profile/pages/PrivacyPolicyScreen';

export type AuthStackParams = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: { fromProfile?: boolean } | undefined;
  VerifyCode: { fromProfile?: boolean } | undefined;
  NewPassword: { fromProfile?: boolean } | undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
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
    <Stack.Screen name="Terms" component={TermsScreen} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
  </Stack.Navigator>
);