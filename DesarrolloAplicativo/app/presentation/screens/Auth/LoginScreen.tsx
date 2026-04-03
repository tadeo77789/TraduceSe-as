import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../../state/AuthContext';


export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'El correo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Correo inválido';
    if (!password) e.password = 'La contraseña es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email, password });
    } catch {
      Alert.alert('Error', 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo arriba */}
        <View style={styles.logoCorner}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>👌</Text>
          </View>
        </View>

        {/* Card de formulario */}
        <View style={styles.card}>
          {/* Avatar */}
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={36} color={Colors.primaryLighter} />
          </View>

          {/* Campos */}
          <Input
            label="Correo electrónico"
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            leftIcon="mail-outline"
            error={errors.email}
            containerStyle={styles.inputSpacing}
          />

          <Input
            label="Contraseña"
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon="lock-closed-outline"
            error={errors.password}
            containerStyle={styles.inputSpacing}
          />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
            <Text style={styles.forgotText}>Has olvidado tu contraseña</Text>
          </TouchableOpacity>

          {/* Botones Registrar / Ingresar */}
          <View style={styles.authRow}>
            <TouchableOpacity
              style={styles.authBtn}
              onPress={() => navigation.navigate('Register' as never)}
            >
              <Text style={styles.authBtnText}>Registrarse</Text>
            </TouchableOpacity>
            <Button
              title="Ingresar"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtnStyle}
            />
          </View>

          {/* Social login */}
          <TouchableOpacity style={styles.socialBtn}>
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.socialText}>google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialBtn, styles.facebookBtn]}>
            <Ionicons name="logo-facebook" size={20} color="#fff" />
            <Text style={[styles.socialText, styles.facebookText]}>facebook</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: 20, paddingTop: 48 },
  logoCorner: { marginBottom: 24 },
  logoBox: {
    width: 44,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 22 },
  card: {
    backgroundColor: Colors.primaryBg,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryHeader,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  inputSpacing: { width: '100%', marginBottom: 12 },
  forgotText: {
    alignSelf: 'flex-end',
    color: Colors.primary,
    fontSize: 13,
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  authRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
    justifyContent: 'center',
  },
  authBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  authBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  loginBtnStyle: { paddingHorizontal: 20 },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 10,
  },
  facebookBtn: {
    backgroundColor: Colors.facebook,
    borderColor: Colors.facebook,
  },
  socialText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  facebookText: { color: '#fff' },
});
