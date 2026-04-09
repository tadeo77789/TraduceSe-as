/**
 * @file LoginScreen.tsx
 * @description Pantalla de inicio de sesión.
 *
 * Usa `useLoginForm` para manejar el estado, la validación y el submit.
 * Soporta dos layouts:
 * - **Web (≥ 768 px)**: panel imagen a la izquierda + formulario a la derecha.
 * - **Móvil**: formulario a pantalla completa con fondo lavanda.
 *
 * Incluye campos de correo y contraseña, link a "Olvidé mi contraseña",
 * botones de acceso social (Google y Facebook — pendiente integración) y
 * link de navegación a la pantalla de registro.
 */
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

// Logo oficial de Google (SVG multicolor) como data URI — sólo funciona en web
const GOOGLE_LOGO_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' +
  '<path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>' +
  '<path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>' +
  '<path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>' +
  '<path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>' +
  '</svg>'
)}` ;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { email, setEmail, password, setPassword, loading, errors, handleLogin } = useLoginForm();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const BackButton = (
    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
      <Ionicons name="chevron-back" size={22} color={Colors.primary} />
    </TouchableOpacity>
  );

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
        <Text style={styles.forgotText}>¿Has olvidado tu contraseña?</Text>
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
        {Platform.OS === 'web'
          ? <Image source={{ uri: GOOGLE_LOGO_URI }} style={styles.googleLogoImg} />
          : <Ionicons name="logo-google" size={20} color="#4285F4" />}
        <Text style={styles.googleText}>Continuar con Google</Text>
      </TouchableOpacity>

      {/* Facebook */}
      <TouchableOpacity style={styles.facebookBtn}>
        <Ionicons name="logo-facebook" size={20} color="#fff" />
        <Text style={styles.facebookText}>Continuar con Facebook</Text>
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
          {BackButton}
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
      {BackButton}
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
  googleLogoImg: { width: 20, height: 20 },
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
