/**
 * @file RegisterScreen.tsx
 * @description Pantalla de creación de cuenta.
 *
 * Usa `useRegisterForm` para manejar el estado y la validación del formulario.
 * Campos: nombre, correo, contraseña y checkbox de aceptación de términos.
 *
 * Soporta dos layouts:
 * - **Web (≥ 768 px)**: formulario centrado con ancho máximo de 480 px.
 * - **Móvil**: formulario a pantalla completa con fondo lavanda.
 *
 * El logo aparece en la esquina superior izquierda en ambos layouts.
 * Incluye link de navegación a la pantalla de login.
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
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/colors';
import { Input } from '../../components/common/Input';
import { useRegisterForm } from '../../../hooks/useRegisterForm';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { form, setField, loading, errors, handleRegister } = useRegisterForm();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const FormPanel = (
    <ScrollView
      contentContainerStyle={styles.formScroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Card formulario */}
      <View style={styles.card}>
        {/* Título */}
        <Text style={styles.title}>Crea tu Cuenta</Text>

        <Input
          label="Nombre"
          placeholder="Escribe tu nombre completo"
          value={form.nombre}
          onChangeText={v => setField('nombre', v)}
          leftIcon="person-outline"
          error={errors.nombre}
          containerStyle={styles.inputSpacing}
        />

        <Input
          label="Correo"
          placeholder="Introduce tu correo electrónico"
          value={form.correo}
          onChangeText={v => setField('correo', v)}
          keyboardType="email-address"
          leftIcon="mail-outline"
          error={errors.correo}
          containerStyle={styles.inputSpacing}
        />

        <Input
          label="Contraseña"
          placeholder="Crea tu contraseña"
          value={form.password}
          onChangeText={v => setField('password', v)}
          isPassword
          leftIcon="lock-closed-outline"
          hint="Mínimo 8 caracteres"
          error={errors.password}
          containerStyle={styles.inputSpacing}
        />

        {/* Checkbox términos */}
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setField('terminos', !form.terminos)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, form.terminos && styles.checkboxChecked]}>
            {form.terminos && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
          <Text style={styles.termsText}>
            Acepto los{' '}
            <Text style={styles.termsLink}>términos y condiciones</Text>
            {' '}de esta aplicación
          </Text>
        </TouchableOpacity>
        {errors.terminos ? <Text style={styles.errorText}>{errors.terminos}</Text> : null}

        {/* Botón registrarse */}
        <View style={styles.btnWrapper}>
          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerBtnText}>{loading ? 'Creando...' : 'Registrarse'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Link inicia sesión */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Login' as never)}
        style={styles.loginRow}
      >
        <Text style={styles.loginText}>
          ¿Ya tienes cuenta?{' '}
          <Text style={styles.loginLink}>Inicia sesión</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

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

  // ── Layout web: centrado ──
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

  // ── Layout móvil ──
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
    left: 68,          // desplazado para no solaparse con el back button
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

  // Título
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 24,
  },

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

  inputSpacing: { marginBottom: 14 },

  // Checkbox
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  termsLink: { color: Colors.primary, fontWeight: '600' },
  errorText: { fontSize: 12, color: Colors.error, marginTop: 4, fontWeight: '500' },

  // Botón
  btnWrapper: { alignItems: 'center', marginTop: 20 },
  registerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 48,
  },
  registerBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },

  // Link login
  loginRow: { alignItems: 'center', marginTop: 22 },
  loginText: { fontSize: 13, color: Colors.textSecondary },
  loginLink: { color: Colors.primary, fontWeight: '700' },
});
