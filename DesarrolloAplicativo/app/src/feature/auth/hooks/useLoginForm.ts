
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
    if (!email.trim()) e.email = t('loginEmailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = t('loginEmailInvalid');
    if (!password) e.password = t('loginPasswordRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [email, password, t]);

  const handleLogin = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (error: any) {
      const hasResponse = !!error?.response;
      if (__DEV__) console.warn('[login]', error?.response?.status, error?.message);
      Alert.alert(t('error'), hasResponse ? t('loginErrorMsg') : t('loginNetworkError'));
    } finally {
      setLoading(false);
    }
  }, [validate, login, email, password, t]);

  return { email, setEmail, password, setPassword, loading, errors, handleLogin };
}
