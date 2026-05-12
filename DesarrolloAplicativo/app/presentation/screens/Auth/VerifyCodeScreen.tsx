/**
 * @file VerifyCodeScreen.tsx
 * @description Pantalla de verificación OTP — paso 2 del flujo de recuperación de contraseña.
 *
 * Muestra 6 campos individuales de un dígito. El foco avanza automáticamente
 * al siguiente campo al ingresar un dígito, y retrocede con Backspace.
 * Al confirmar el código completo, navega a `NewPasswordScreen`.
 *
 * @todo Conectar `handleConfirm` con `ENDPOINTS.verifyCode` para validar
 *       el código OTP contra el backend.
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  Alert, useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams } from '../../navigation/AuthNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/colors';
import { useColors, useTheme } from '../../../state/ThemeContext';
import { useTranslation } from '../../../i18n';

const CODE_LENGTH = 6;
  
type NavigationProps = NativeStackNavigationProp<AuthStackParams>;

export const VerifyCodeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute();
  const fromProfile = (route.params as any)?.fromProfile ?? false;
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const inputs = useRef<TextInput[]>([]);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= 768;
  const C = useColors();
  const { isDark } = useTheme();
  const rootBg = isDark ? '#0F0B1A' : '#EDE9FE';
  const { t } = useTranslation();

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1); // Filtra cualquier carácter que no sea dígito (teclado físico/web pueden ignorar keyboardType) y deja solo el último
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = () => {
    const fullCode = code.join('');
    if (fullCode.length < CODE_LENGTH) {
      Alert.alert(t('error'), t('verifyErrorIncomplete'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('NewPassword', { fromProfile });
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
        <Text style={[styles.title, { color: C.textPrimary }]}>{t('verifyTitle')}</Text>
        <Text style={[styles.subtitle, { color: C.textSecondary }]}>
          {t('verifySubtitle')}
        </Text>

        {/* OTP inputs */}
        <View style={styles.otpRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={el => { if (el) inputs.current[i] = el; }}
              style={[
                styles.otpInput,
                { backgroundColor: C.inputBg, borderColor: C.border, color: C.textPrimary },
                digit ? { borderColor: Colors.primary, backgroundColor: '#EDE9FE' } : null,
              ]}
              value={digit}
              onChangeText={text => handleChange(text, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <View style={styles.btnWrapper}>
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? t('verifyBtnLoading') : t('verifyBtn')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.linkRow}
      >
        <Text style={[styles.linkText, { color: C.textSecondary }]}>
          {t('verifyResend')}{' '}
          <Text style={styles.linkAccent}>{t('verifyResendLink')}</Text>
        </Text>
      </TouchableOpacity>
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
    top: 11,
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
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },

  // OTP
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  otpInput: {
    width: 44,
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 10,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center', // Centra el dígito horizontalmente (en web el prop textAlign no siempre se aplica al <input> nativo)
    textAlignVertical: 'center', // Centra el dígito verticalmente en Android
    paddingVertical: 0, // Elimina el padding vertical default del <input> en web que descentra el texto
    paddingHorizontal: 0, // Elimina el padding horizontal default del <input> en web
    lineHeight: Platform.OS === 'web' ? 50 : undefined, // En web fuerza la altura de línea ≈ height para centrar verticalmente
    includeFontPadding: false, // Quita el padding extra de fuente en Android
  },
  otpFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#EDE9FE',
  },

  // Botón confirmar
  btnWrapper: { alignItems: 'center', marginTop: 4 },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 48,
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },

  // Link inferior
  linkRow: { alignItems: 'center', marginTop: 22 },
  linkText: { fontSize: 13, color: Colors.textSecondary },
  linkAccent: { color: Colors.primary, fontWeight: '700' },
});
