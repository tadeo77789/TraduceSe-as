
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../shared/constants/colors';
import { Input } from '../../components/common/Input';
import { useRegisterForm } from '../../../shared/hooks/useRegisterForm';
import { useTranslation } from '../../../shared/i18n';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { form, setField, loading, errors, handleRegister } = useRegisterForm();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= 768;
  const { t } = useTranslation();

  const FormPanel = (
    <ScrollView
      contentContainerStyle={styles.formScroll}
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
      overScrollMode="never"
      bounces={false}
    >
      <View style={styles.formInner}>
      {/* Card formulario */}
      <View style={styles.card}>
        <Text style={styles.title}>{t('registerTitle')}</Text>

        <Input
          label={t('registerNameLabel')}
          placeholder={t('registerNamePlaceholder')}
          value={form.nombre}
          onChangeText={v => setField('nombre', v)}
          leftIcon="person-outline"
          error={errors.nombre}
          accentColor={Colors.primary}
          containerStyle={styles.inputSpacing}
        />

        <Input
          label={t('email')}
          placeholder={t('registerEmailPlaceholder')}
          value={form.correo}
          onChangeText={v => setField('correo', v)}
          keyboardType="email-address"
          leftIcon="mail-outline"
          error={errors.correo}
          accentColor={Colors.primary}
          containerStyle={styles.inputSpacing}
        />

        <Input
          label={t('password')}
          placeholder={t('registerPasswordPlaceholder')}
          value={form.password}
          onChangeText={v => setField('password', v)}
          isPassword
          leftIcon="lock-closed-outline"
          hint={t('registerPasswordHint')}
          error={errors.password}
          accentColor={Colors.primary}
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
            {t('registerTerms')}
            <Text style={styles.termsLink}>{t('registerTermsLink')}</Text>
            {t('registerTermsEnd')}
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
            <Text style={styles.registerBtnText}>{loading ? t('registerBtnLoading') : t('registerBtn')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Link inicia sesión */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Login' as never)}
        style={styles.loginRow}
      >
        <Text style={styles.loginText}>
          {t('registerHasAccount')}{' '}
          <Text style={styles.loginLink}>{t('registerLoginLink')}</Text>
        </Text>
      </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const Logo = (
    <>
      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => navigation.goBack()}>
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

  wideRoot: { flex: 1, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' },
  formPanel: { width: 480 },

  mobileRoot: { flex: 1, backgroundColor: '#EDE9FE' },

  formScroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 48,
    justifyContent: 'center',
  },
  formInner: {},

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

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 24,
  },

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

  btnWrapper: { alignItems: 'center', marginTop: 20 },
  registerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 48,
  },
  registerBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },

  loginRow: { alignItems: 'center', marginTop: 22 },
  loginText: { fontSize: 13, color: Colors.textSecondary },
  loginLink: { color: Colors.primary, fontWeight: '700' },
});
