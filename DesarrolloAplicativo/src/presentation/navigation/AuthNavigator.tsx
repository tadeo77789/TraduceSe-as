// Ubicación: app/presentation/navigation/AuthNavigator.tsx
/**
 * @file AuthNavigator.tsx
 * @description Stack de navegación del flujo de autenticación.
 *
 * Define el tipo `AuthStackParams` con las rutas disponibles y monta
 * el stack sin headers visibles. Ruta inicial: `Landing`.
 *
 * Rutas:
 * - `Landing` → pantalla de bienvenida con slider y CTA.
 * - `Login` → inicio de sesión.
 * - `Register` → creación de cuenta.
 * - `ForgotPassword` → recuperación de contraseña (ingreso de correo).
 * - `VerifyCode` → verificación OTP de 6 dígitos.
 * - `NewPassword` → establecer nueva contraseña.
 */
import React from 'react'; // Importa React; necesario para usar JSX — fuente: node_modules/react
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Importa la función que crea un stack de navegación nativo con animaciones del SO — fuente: node_modules/@react-navigation/native-stack
import { LandingScreen } from '../screens/LandingScreen'; // Importa la pantalla de bienvenida con slider y botones de CTA — fuente: app/presentation/screens/LandingScreen.tsx
import { LoginScreen } from '../screens/Auth/LoginScreen'; // Importa la pantalla de inicio de sesión con formulario de email y contraseña — fuente: app/presentation/screens/Auth/LoginScreen.tsx
import { RegisterScreen } from '../screens/Auth/RegisterScreen'; // Importa la pantalla de creación de cuenta nueva — fuente: app/presentation/screens/Auth/RegisterScreen.tsx
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen'; // Importa la pantalla donde el usuario ingresa su correo para recuperar contraseña — fuente: app/presentation/screens/Auth/ForgotPasswordScreen.tsx
import { VerifyCodeScreen } from '../screens/Auth/VerifyCodeScreen'; // Importa la pantalla de verificación del código OTP de 6 dígitos enviado al correo — fuente: app/presentation/screens/Auth/VerifyCodeScreen.tsx
import { NewPasswordScreen } from '../screens/Auth/NewPasswordScreen'; // Importa la pantalla donde el usuario establece su nueva contraseña tras verificar el OTP — fuente: app/presentation/screens/Auth/NewPasswordScreen.tsx
import { TermsScreen } from '../screens/Profile/TermsScreen';
import { PrivacyPolicyScreen } from '../screens/Profile/PrivacyPolicyScreen';

export type AuthStackParams = { // Define y exporta el tipo TypeScript que mapea cada ruta del stack con sus parámetros esperados
  Landing: undefined; // Ruta 'Landing' no recibe parámetros de navegación
  Login: undefined; // Ruta 'Login' no recibe parámetros de navegación
  Register: undefined; // Ruta 'Register' no recibe parámetros de navegación
  ForgotPassword: { fromProfile?: boolean } | undefined;
  VerifyCode: { fromProfile?: boolean } | undefined;
  NewPassword: { fromProfile?: boolean } | undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
}; // Cierra la definición del tipo AuthStackParams

const Stack = createNativeStackNavigator<AuthStackParams>(); // Crea la instancia del stack navigator tipada con AuthStackParams; expone Stack.Navigator y Stack.Screen

export const AuthNavigator: React.FC = () => ( // Define y exporta el componente funcional AuthNavigator; usa sintaxis de retorno implícito con paréntesis
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
); // Cierra el retorno implícito y la definición del componente AuthNavigator
