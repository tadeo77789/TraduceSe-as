import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>👌</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>confirma tu correo</Text>
        <Text style={styles.subtitle}>
          Proporcionanos tu correo para enviarte el codigo de verificacion y saber que eres tu
        </Text>

        <Input
          placeholder="ingresa tu correo"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
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
    textAlign: 'center', marginBottom: 16,
  },
  subtitle: {
    fontSize: 14, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 22, marginBottom: 24,
  },
  inputGap: { marginBottom: 20 },
  btn: { alignSelf: 'center', paddingHorizontal: 32 },
});
