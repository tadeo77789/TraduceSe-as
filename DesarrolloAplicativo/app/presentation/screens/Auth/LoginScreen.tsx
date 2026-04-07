import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Input } from '../../components/common/Input';
import { useLoginForm } from '../../../hooks/useLoginForm';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { email, setEmail, password, setPassword, loading, errors, handleLogin } = useLoginForm();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const FormPanel = (
    <ScrollView
      contentContainerStyle={styles.formScroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar */}
      <View style={styles.avatarCircle}>
        <Ionicons name="person" size={38} color={Colors.primary} />
      </View>

      {/* Inputs */}
      <Input
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        leftIcon="mail-outline"
        error={errors.email}
        containerStyle={styles.inputSpacing}
      />

      <Input
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        isPassword
        leftIcon="lock-closed-outline"
        error={errors.password}
        containerStyle={styles.inputSpacing}
      />

      {/* Olvidé contraseña */}
      <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword' as never)}
        style={styles.forgotRow}
      >
        <Text style={styles.forgotText}>Has olvidado tu contraseña</Text>
      </TouchableOpacity>

      {/* Registrarse / Ingresar */}
      <View style={styles.authRow}>
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => navigation.navigate('Register' as never)}
        >
          <Text style={styles.registerBtnText}>Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginBtnText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
        </TouchableOpacity>
      </View>

      {/* Google */}
      <TouchableOpacity style={styles.googleBtn}>
        <Ionicons name="logo-google" size={20} color="#DB4437" />
        <Text style={styles.googleText}>google</Text>
      </TouchableOpacity>

      {/* Facebook */}
      <TouchableOpacity style={styles.facebookBtn}>
        <Ionicons name="logo-facebook" size={20} color="#fff" />
        <Text style={styles.facebookText}>facebook</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ── Layout web: imagen izquierda + formulario derecha ──
  if (isWide) {
    return (
      <View style={styles.wideRoot}>
        {/* Panel imagen */}
        <View style={styles.imagePanel}>
          <Image
            source={require('../../../assets/images/slide1.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>👌 TraduceSeña</Text>
            <Text style={styles.imageTagline}>Comunícate sin barreras</Text>
          </View>
        </View>

        {/* Panel formulario */}
        <View style={styles.formPanel}>
          {FormPanel}
        </View>
      </View>
    );
  }

  // ── Layout móvil: fondo lavanda full screen ──
  return (
    <KeyboardAvoidingView
      style={styles.mobileRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {FormPanel}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // ── Web ──
  wideRoot: { flex: 1, flexDirection: 'row' },
  imagePanel: { flex: 1, overflow: 'hidden', position: 'relative' },
  heroImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(109,40,217,0.35)',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 40,
    left: 40,
  },
  imageBadgeText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.3,
  },
  imageTagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    fontWeight: '500',
  },
  formPanel: {
    width: 420,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
  },

  // ── Móvil ──
  mobileRoot: { flex: 1, backgroundColor: '#EDE9FE' },

  // ── Formulario (compartido) ──
  formScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 0,
  },

  // Avatar
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },

  // Inputs
  inputSpacing: { width: '100%', marginBottom: 14 },

  // Olvidé contraseña
  forgotRow: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Botones auth
  authRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  registerBtn: {
    flex: 1,
    backgroundColor: '#C4B5FD',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: {
    color: '#5B21B6',
    fontSize: 14,
    fontWeight: '700',
  },
  loginBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: { opacity: 0.6 },

  // Social
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  googleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3C4043',
  },
  facebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#1877F2',
    borderRadius: 12,
    paddingVertical: 14,
  },
  facebookText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
