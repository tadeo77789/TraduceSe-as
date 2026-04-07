import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../state/AuthContext';

interface RegisterForm {
  nombre: string;
  correo: string;
  password: string;
  terminos: boolean;
}

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

export function useRegisterForm() {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterForm>({
    nombre: '',
    correo: '',
    password: '',
    terminos: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});

  const setField = useCallback(<K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const validate = useCallback((): boolean => {
    const e: RegisterErrors = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!form.correo) e.correo = 'El correo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.correo)) e.correo = 'Correo inválido';
    if (!form.password) e.password = 'La contraseña es obligatoria';
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (!form.terminos) e.terminos = 'Debes aceptar los términos';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const handleRegister = useCallback(async () => {
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
  }, [validate, register, form]);

  return { form, setField, loading, errors, handleRegister };
}
