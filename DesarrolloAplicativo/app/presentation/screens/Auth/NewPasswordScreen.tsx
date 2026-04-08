/**
 * @file NewPasswordScreen.tsx
 * @description Pantalla para establecer una nueva contraseña — paso 3 del flujo
 * de recuperación.
 *
 * Valida que la contraseña tenga mínimo 8 caracteres y que ambos campos coincidan.
 * Al confirmar navega de regreso a `LoginScreen`.
 *
 * @todo Conectar `handleConfirm` con `ENDPOINTS.resetPassword` para actualizar
 *       la contraseña en el backend.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constants/colors';

import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const NewPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    if (!password || password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener mínimo 8 caracteres');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    // TODO: llamar al backend
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Login' as never);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.logoCorner}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>👌</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Nueva contraseña</Text>

        <Text style={styles.label}>ingresa tu nueva contraseña</Text>
        <Input
          placeholder="contraseña"
          value={password}
          onChangeText={setPassword}
          isPassword
          hint="mínimo 8 caracteres"
          containerStyle={styles.inputGap}
        />

        <Text style={styles.label}>confirmar contraseña</Text>
        <Input
          placeholder="contraseña"
          value={confirm}
          onChangeText={setConfirm}
          isPassword
          containerStyle={styles.inputGap}
        />

        <Button
          title="confirmar"
          onPress={handleConfirm}
          loading={loading}
          style={styles.btn}
        />
      </View>
    </KeyboardAvoidingView>
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
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 6,
  },
  title: {
    fontSize: 26, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', marginBottom: 24,
  },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  inputGap: { marginBottom: 16 },
  btn: { alignSelf: 'center', marginTop: 8, paddingHorizontal: 40 },
});
