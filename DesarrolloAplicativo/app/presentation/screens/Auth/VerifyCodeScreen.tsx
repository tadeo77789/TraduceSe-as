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
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constants/colors';

import { Button } from '../../components/common/Button';

const CODE_LENGTH = 6;

export const VerifyCodeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const inputs = useRef<TextInput[]>([]);

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

  return (
    <View style={styles.root}>
      {/* Logo */}
      <View style={styles.logoCorner}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>👌</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>confirma tu cuenta</Text>
        <Text style={styles.subtitle}>
          Te hemos enviado un código de verificación a tu correo electrónico. Ingresa ese código en
          el campo correspondiente para continuar con el proceso y establecer una nueva contraseña.
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

        <Button
          title="confirmar"
          onPress={handleConfirm}
          loading={loading}
          style={styles.btn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background, padding: 20, paddingTop: 48 },
  logoCorner: { marginBottom: 24 },
  logoBox: {
    width: 44, height: 44, backgroundColor: Colors.primary,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 22 },
  card: {
    backgroundColor: Colors.primaryBg, borderRadius: 20, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 6, alignItems: 'center',
  },
  title: {
    fontSize: 24, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', marginBottom: 16,
  },
  subtitle: {
    fontSize: 13, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 20, marginBottom: 28,
  },
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  otpInput: {
    width: 44, height: 52, backgroundColor: Colors.background,
    borderRadius: 10, fontSize: 20, fontWeight: '700',
    color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border,
  },
  otpFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  btn: { paddingHorizontal: 40 },
});
