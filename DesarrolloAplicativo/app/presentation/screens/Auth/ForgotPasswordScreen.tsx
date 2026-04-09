/**
 * @file ForgotPasswordScreen.tsx
 * @description Pantalla de recuperación de contraseña — paso 1: ingreso de correo.
 *
 * @todo Conectar `handleConfirm` con el endpoint real del backend
 *       (`ENDPOINTS.forgotPassword`) para enviar el código OTP.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  Alert, useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/colors';
import { Input } from '../../components/common/Input';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const handleConfirm = async () => {
    if (!email) { Alert.alert('Error', 'Ingresa tu correo'); return; }
    setLoading(true);
    // TODO: llamar al backend para enviar código
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('VerifyCode' as never);
    }, 1000);
  };

  const Logo = (
    <>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color={Colors.primary} />
      </TouchableOpacity>
      <View style={styles.logoCorner}>
        <LinearGradient colors={['#9333EA', '#7C3AED']} style={styles.logoBox}>
          <Text style={styles.logoEmoji}>👌</Text>
        </LinearGradient>
        <Text style={styles.brandName}>TraduceSeña</Text>
      </View>
    </>
  );

  const FormPanel = (
    <ScrollView
      contentContainerStyle={styles.formScroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
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
          containerStyle={styles.inputSpacing}
        />

        <View style={styles.btnWrapper}>
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Enviando...' : 'Enviar código'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.linkRow}
      >
        <Text style={styles.linkText}>
          ¿Recordaste tu contraseña?{' '}
          <Text style={styles.linkAccent}>Inicia sesión</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (isWide) {
    return (
      <View style={styles.wideRoot}>
        {Logo}
        <View style={styles.formPanel}>
          {FormPanel}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.mobileRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {Logo}
      {FormPanel}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // ── Web ──
  wideRoot: { flex: 1, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' },
  formPanel: { width: 480 },

  // ── Móvil ──
  mobileRoot: { flex: 1, backgroundColor: '#EDE9FE' },

  // ── Formulario ──
  formScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 48,
  },

  // Botón volver
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  // Logo
  logoCorner: {
    position: 'absolute',
    top: 20,
    left: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoEmoji: { fontSize: 22 },
  brandName: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.2 },

  // Card
  card: {
    backgroundColor: '#DDD6FE',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 22,
  },

  inputSpacing: { marginBottom: 14 },

  // Botón enviar
  btnWrapper: { alignItems: 'center', marginTop: 20 },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 48,
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },

  // Link inferior
  linkRow: { alignItems: 'center', marginTop: 22 },
  linkText: { fontSize: 13, color: Colors.textSecondary },
  linkAccent: { color: Colors.primary, fontWeight: '700' },
});
