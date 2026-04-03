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
import { Colors } from '../../../constants/colors';

import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../../state/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { register } = useAuth();

  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    password: '',
    terminos: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!form.correo) e.correo = 'El correo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.correo)) e.correo = 'Correo inválido';
    if (!form.password) e.password = 'La contraseña es obligatoria';
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (!form.terminos) e.terminos = 'Debes aceptar los términos';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        nombre: form.nombre,
        edad: 0,
        email: form.correo,
        password: form.password,
        termino_acept: form.terminos,
      });
    } catch {
      Alert.alert('Error', 'No se pudo crear la cuenta. Intenta de nuevo.');
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
        {/* Logo */}
        <View style={styles.logoCorner}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>👌</Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Crea tu Cuenta</Text>

          <Input
            label="nombre"
            placeholder="escribe tu nombre completo"
            value={form.nombre}
            onChangeText={v => set('nombre', v)}
            error={errors.nombre}
            containerStyle={styles.inputGap}
          />

          <Input
            label="correo"
            placeholder="introduzca su correo electronico"
            value={form.correo}
            onChangeText={v => set('correo', v)}
            keyboardType="email-address"
            error={errors.correo}
            containerStyle={styles.inputGap}
          />

          <Input
            label="contraseña"
            placeholder="crea tu contraseña"
            value={form.password}
            onChangeText={v => set('password', v)}
            isPassword
            hint="mínimo 8 caracteres"
            error={errors.password}
            containerStyle={styles.inputGap}
          />

          {/* Checkbox términos */}
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => set('terminos', !form.terminos)}
          >
            <View style={[styles.checkbox, form.terminos && styles.checkboxChecked]}>
              {form.terminos && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.termsText}>acepto términos y condiciones de esta aplicacion</Text>
          </TouchableOpacity>
          {errors.terminos && <Text style={styles.errorText}>{errors.terminos}</Text>}

          <Button
            title="registrarse"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerBtn}
          />

          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.loginLink}>¿Ya tienes cuenta? Inicia sesión</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGap: { marginBottom: 14 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
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
  errorText: { fontSize: 12, color: Colors.error, marginBottom: 8 },
  registerBtn: {
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
  loginLink: {
    textAlign: 'center',
    marginTop: 16,
    color: Colors.primary,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
