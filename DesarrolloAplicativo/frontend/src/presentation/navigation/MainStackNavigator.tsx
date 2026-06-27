
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { VerifyCodeScreen } from '../screens/Auth/VerifyCodeScreen';
import { NewPasswordScreen } from '../screens/Auth/NewPasswordScreen';

export type MainStackParams = {
  MainTabs: undefined;
  ForgotPassword: { fromProfile?: boolean } | undefined;
  VerifyCode: { fromProfile?: boolean } | undefined;
  NewPassword: { fromProfile?: boolean } | undefined;
};

const Stack = createNativeStackNavigator<MainStackParams>();

export const MainStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
    <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
  </Stack.Navigator>
);
