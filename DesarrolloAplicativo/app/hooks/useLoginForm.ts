/**
 * @file useLoginForm.ts
 * @description Hook personalizado para el formulario de inicio de sesión.
 *
 * Gestiona el estado de los campos `email` y `password`, la validación
 * (formato de correo y campo vacío), el estado de carga y los mensajes de error.
 * Llama a `AuthContext.login` al enviar el formulario.
 *
 * @returns email, setEmail, password, setPassword, loading, errors, handleLogin
 */
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../state/AuthContext';

interface LoginErrors {
  email?: string;
  password?: string;
}

export function useLoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const validate = useCallback((): boolean => {
    const e: LoginErrors = {};
    if (!email) e.email = 'El correo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Correo inválido';
    if (!password) e.password = 'La contraseña es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email, password });
    } catch {
      Alert.alert('Error', 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  }, [validate, login, email, password]);

  return { email, setEmail, password, setPassword, loading, errors, handleLogin };
}
