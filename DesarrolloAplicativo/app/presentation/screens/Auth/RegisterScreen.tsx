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
import { Colors } from '../../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useRegisterForm } from '../../../hooks/useRegisterForm';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { form, setField, loading, errors, handleRegister } = useRegisterForm();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoCorner}>
          <LinearGradient
            colors={['#9333EA', '#7C3AED']}
            style={styles.logoBox}
          >
            <Text style={styles.logoEmoji}>👌</Text>
          </LinearGradient>
          <Text style={styles.brandName}>TraduceSeña</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>Únete y empieza a comunicarte</Text>

          <Input
            label="Nombre completo"
            placeholder="Tu nombre completo"
            value={form.nombre}
            onChangeText={v => setField('nombre', v)}
            leftIcon="person-outline"
            error={errors.nombre}
            containerStyle={styles.inputGap}
          />

          <Input
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            value={form.correo}
            onChangeText={v => setField('correo', v)}
            keyboardType="email-address"
            leftIcon="mail-outline"
            error={errors.correo}
            containerStyle={styles.inputGap}
          />

          <Input
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChangeText={v => setField('password', v)}
            isPassword
            leftIcon="lock-closed-outline"
            hint="mínimo 8 caracteres"
            error={errors.password}
            containerStyle={styles.inputGap}
          />

          {/* Checkbox términos */}
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setField('terminos', !form.terminos)}
          >
            <View style={[styles.checkbox, form.terminos && styles.checkboxChecked]}>
              {form.terminos && <Ionicons name="checkmark" size={13} color="#fff" />}
            </View>
            <Text style={styles.termsText}>
              Acepto los{' '}
              <Text style={styles.termsLink}>términos y condiciones</Text>
            </Text>
          </TouchableOpacity>
          {errors.terminos && <Text style={styles.errorText}>{errors.terminos}</Text>}

          <Button
            title="Crear cuenta"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            style={styles.registerBtn}
          />

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>¿ya tienes cuenta?</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.loginBtnText}>Inicia sesión</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  inputGap: { marginBottom: 16 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  termsLink: { color: Colors.primary, fontWeight: '600' },
  errorText: { fontSize: 12, color: Colors.error, marginBottom: 8, fontWeight: '500' },
  registerBtn: { marginTop: 20 },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  separatorText: { fontSize: 12, color: Colors.textHint, fontWeight: '500' },
  loginBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  loginBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
});
