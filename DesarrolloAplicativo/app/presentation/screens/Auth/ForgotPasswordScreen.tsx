/**
 * @file ForgotPasswordScreen.tsx
 * @description Pantalla de recuperación de contraseña — paso 1: ingreso de correo.
 *
 * El usuario ingresa su correo y presiona "Enviar código". La app simula
 * el envío y navega a `VerifyCodeScreen`.
 *
 * @todo Conectar `handleConfirm` con el endpoint real del backend
 *       (`ENDPOINTS.forgotPassword`) para enviar el código OTP.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';

import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!email) { Alert.alert('Error', 'Ingresa tu correo'); return; }
    setLoading(true);
    // TODO: llamar al backend para enviar código
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('VerifyCode' as never);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Logo */}
      <View style={styles.logoCorner}>
        <LinearGradient
          colors={['#9333EA', '#7C3AED']}
          style={styles.logoBox}
        >
          <Text style={styles.logoEmoji}>👌</Text>
        </LinearGradient>
        <Text style={styles.brandName}>TraduceSeña</Text>
      </View>

      <View style={styles.card}>
        {/* Ícono ilustrativo */}
        <LinearGradient colors={['#E9D5FF', '#DDD6FE']} style={styles.iconCircle}>
          <Ionicons name="mail-unread-outline" size={32} color={Colors.primary} />
        </LinearGradient>

        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresa tu correo y te enviaremos un código de verificación
        </Text>

        <Input
          label="Correo electrónico"
          placeholder="correo@ejemplo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          leftIcon="mail-outline"
          containerStyle={styles.inputGap}
        />

        <Button
          title="Enviar código"
          onPress={handleConfirm}
          loading={loading}
          fullWidth
          style={styles.btn}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray, padding: 24, paddingTop: 52 },
  logoCorner: { marginBottom: 28, flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 46, height: 46, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  logoEmoji: { fontSize: 24 },
  brandName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.3 },
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 8,
  },
  iconCircle: {
    width: 76, height: 76, borderRadius: 38,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: {
    fontSize: 24, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', marginBottom: 10,
  },
  subtitle: {
    fontSize: 14, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 22, marginBottom: 28,
  },
  inputGap: { marginBottom: 24, width: '100%' },
  btn: { width: '100%' },
});
