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
import { useAuth } from '../../../app/providers/AuthContext';
import { useTranslation } from '../../../app/config/i18n';

interface LoginErrors {
  email?: string;
  password?: string;
}

export function useLoginForm() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const validate = useCallback((): boolean => {
    const e: LoginErrors = {};
    if (!email) e.email = t('loginEmailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t('loginEmailInvalid');
    if (!password) e.password = t('loginPasswordRequired');
    else if (password.length < 8) e.password = t('registerPasswordShort');
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [email, password, t]);

  const handleLogin = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email, password });
    } catch {
      Alert.alert(t('error'), t('loginErrorMsg'));
    } finally {
      setLoading(false);
    }
  }, [validate, login, email, password, t]);

  return { email, setEmail, password, setPassword, loading, errors, handleLogin };
}
