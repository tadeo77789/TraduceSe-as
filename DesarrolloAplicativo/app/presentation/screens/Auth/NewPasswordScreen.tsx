/**
 * @file NewPasswordScreen.tsx
 * @description Pantalla para establecer una nueva contraseña — paso 3 del flujo
 * de recuperación.
 *
 * @todo Conectar `handleConfirm` con `ENDPOINTS.resetPassword` para actualizar
 *       la contraseña en el backend.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  Alert, useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/colors';
import { Input } from '../../components/common/Input';
import { useColors, useTheme } from '../../../state/ThemeContext';
import { useTranslation } from '../../../i18n';

export const NewPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= 768;
  const C = useColors();
  const { isDark } = useTheme();
  const rootBg = isDark ? '#0F0B1A' : '#EDE9FE';
  const { t } = useTranslation();

  const handleConfirm = () => {
    if (!password || password.length < 8) {
      Alert.alert(t('error'), t('newPasswordErrorShort'));
      return;
    }
    if (password !== confirm) {
      Alert.alert(t('error'), t('newPasswordErrorMismatch'));
      return;
    }
    setLoading(true);
    // TODO: llamar al backend
    setTimeout(() => {
      setLoading(false);
      const routeNames: string[] = (navigation as any).getState()?.routeNames ?? [];
      if (routeNames.includes('Login')) {
        // AuthNavigator: ir a Login
        navigation.navigate('Login' as never);
      } else {
        // MainStackNavigator: volver a MainTabs (Profile tab activo)
        (navigation as any).popToTop();
      }
    }, 1000);
  };

  const Logo = (
    <>
      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color={Colors.primary} />
      </TouchableOpacity>
      <View style={styles.logoCorner}>
        <LinearGradient colors={['#9333EA', '#7C3AED']} style={styles.logoBox}>
          <Text style={styles.logoEmoji}>👌</Text>
        </LinearGradient>
        <Text style={[styles.brandName, { color: C.textPrimary }]}>TraduceSeña</Text>
      </View>
    </>
  );

  const FormPanel = (
    <ScrollView
      contentContainerStyle={styles.formScroll}
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
      overScrollMode="never"
      bounces={false}
    >
      <View style={styles.formInner}>
      <View style={[styles.card, { backgroundColor: C.surface }]}>
        <Text style={[styles.title, { color: C.textPrimary }]}>{t('newPasswordTitle')}</Text>

        <Input
          label={t('newPasswordNewLabel')}
          placeholder={t('newPasswordNewPlaceholder')}
          value={password}
          onChangeText={setPassword}
          isPassword
          leftIcon="lock-closed-outline"
          accentColor={Colors.primary}
          hint={t('newPasswordHint')}
          containerStyle={styles.inputSpacing}
        />

        <Input
          label={t('newPasswordConfirmLabel')}
          placeholder={t('newPasswordConfirmPlaceholder')}
          value={confirm}
          onChangeText={setConfirm}
          isPassword
          leftIcon="lock-closed-outline"
          accentColor={Colors.primary}
          containerStyle={styles.inputSpacing}
        />

        <View style={styles.btnWrapper}>
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? t('newPasswordBtnLoading') : t('newPasswordBtn')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </ScrollView>
  );

  if (isWide) {
    return (
      <View style={[styles.wideRoot, { backgroundColor: rootBg }]}>
        {Logo}
        <View style={styles.formPanel}>
          {FormPanel}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.mobileRoot, { backgroundColor: rootBg }]}
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
    paddingHorizontal: 16,
    paddingVertical: 48,
    justifyContent: 'center',
  },
  formInner: {},

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
    left: 68,
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

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 24,
  },

  inputSpacing: { marginBottom: 14 },

  // Botón confirmar
  btnWrapper: { alignItems: 'center', marginTop: 20 },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 48,
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
});
