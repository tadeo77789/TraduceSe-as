/**
 * @file VerifyCodeScreen.tsx
 * @description Pantalla de verificación OTP — paso 2 del flujo de recuperación de contraseña.
 *
 * Muestra 6 campos individuales de un dígito. El foco avanza automáticamente
 * al siguiente campo al ingresar un dígito, y retrocede con Backspace.
 * Al confirmar el código completo, navega a `NewPasswordScreen`.
 *
 * @todo Conectar `handleConfirm` con `ENDPOINTS.verifyCode` para validar
 *       el código OTP contra el backend.
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  Alert, useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/colors';

const CODE_LENGTH = 6;

export const VerifyCodeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const inputs = useRef<TextInput[]>([]);
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = () => {
    const fullCode = code.join('');
    if (fullCode.length < CODE_LENGTH) {
      Alert.alert('Error', 'Ingresa el código completo');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('NewPassword' as never);
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
        <Text style={styles.title}>Confirma tu cuenta</Text>
        <Text style={styles.subtitle}>
          Te hemos enviado un código de verificación a tu correo electrónico. Ingrésalo para continuar.
        </Text>

        {/* OTP inputs */}
        <View style={styles.otpRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={el => { if (el) inputs.current[i] = el; }}
              style={[styles.otpInput, digit ? styles.otpFilled : null]}
              value={digit}
              onChangeText={text => handleChange(text.slice(-1), i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <View style={styles.btnWrapper}>
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Verificando...' : 'Confirmar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.linkRow}
      >
        <Text style={styles.linkText}>
          ¿No recibiste el código?{' '}
          <Text style={styles.linkAccent}>Reenviar</Text>
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
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },

  // OTP
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  otpInput: {
    width: 44,
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 10,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  otpFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#EDE9FE',
  },

  // Botón confirmar
  btnWrapper: { alignItems: 'center', marginTop: 4 },
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
