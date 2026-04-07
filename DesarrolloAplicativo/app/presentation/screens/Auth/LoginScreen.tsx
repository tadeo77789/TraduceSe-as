import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useLoginForm } from '../../../hooks/useLoginForm';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { email, setEmail, password, setPassword, loading, errors, handleLogin } = useLoginForm();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo arriba */}
        <View style={styles.logoCorner}>
          <LinearGradient
            colors={['#9333EA', '#7C3AED']}
            style={styles.logoBox}
          >
            <Text style={styles.logoEmoji}>👌</Text>
          </LinearGradient>
          <Text style={styles.brandName}>TraduceSeña</Text>
        </View>

        {/* Card de formulario */}
        <View style={styles.card}>
          {/* Avatar */}
          <LinearGradient
            colors={['#E9D5FF', '#DDD6FE']}
            style={styles.avatarCircle}
          >
            <Ionicons name="person" size={36} color={Colors.primary} />
          </LinearGradient>

          <Text style={styles.cardTitle}>Bienvenido</Text>
          <Text style={styles.cardSubtitle}>Inicia sesión en tu cuenta</Text>

          {/* Campos */}
          <Input
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            leftIcon="mail-outline"
            error={errors.email}
            containerStyle={styles.inputSpacing}
          />

          <Input
            label="Contraseña"
            placeholder="Tu contraseña"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon="lock-closed-outline"
            error={errors.password}
            containerStyle={styles.inputSpacing}
          />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
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

          {/* Separador */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>o continúa con</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Social login */}
          <TouchableOpacity style={styles.socialBtn}>
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.socialText}>Continuar con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialBtn, styles.facebookBtn]}>
            <Ionicons name="logo-facebook" size={20} color="#fff" />
            <Text style={[styles.socialText, styles.facebookText]}>Continuar con Facebook</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 52 },
  logoCorner: { marginBottom: 28, flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoEmoji: { fontSize: 24 },
  brandName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.3 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 28,
  },
  inputSpacing: { width: '100%', marginBottom: 14 },
  forgotText: {
    alignSelf: 'flex-end',
    color: Colors.primary,
    fontSize: 13,
    marginBottom: 24,
    fontWeight: '600',
  },
  authRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
    justifyContent: 'center',
  },
  authBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 13,
    minHeight: 48,
    justifyContent: 'center',
  },
  authBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  loginBtnStyle: { paddingHorizontal: 24 },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    gap: 10,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  separatorText: { fontSize: 12, color: Colors.textHint, fontWeight: '500' },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#fff',
    paddingVertical: 13,
    width: '100%',
    marginBottom: 10,
  },
  facebookBtn: {
    backgroundColor: Colors.facebook,
    borderColor: Colors.facebook,
  },
  socialText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  facebookText: { color: '#fff' },
});
