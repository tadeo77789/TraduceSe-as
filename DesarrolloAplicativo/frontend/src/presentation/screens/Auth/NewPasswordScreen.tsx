
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../shared/constants/colors';
import { Input } from '../../components/common/Input';
import { useColors } from '../../../shared/state/ThemeContext';
import { useTranslation } from '../../../shared/i18n';

export const NewPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const fromProfile = (route.params as any)?.fromProfile ?? false;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= 768;

  const themedC = useColors();
  const C = fromProfile ? themedC : Colors;
  const rootBg = C.background;
  const { t } = useTranslation();

  const handleConfirm = () => {
    const e: { password?: string; confirm?: string } = {};
    if (!password || password.length < 8) e.password = t('newPasswordErrorShort');
    if (!confirm || password !== confirm) e.confirm = t('newPasswordErrorMismatch');
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (fromProfile) {

        (navigation as any).popToTop();
      } else {

        navigation.navigate('Login' as never);
      }
    }, 1000);
  };

  const Logo = (
    <>
      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color={C.primary} />
      </TouchableOpacity>
      <View style={styles.logoCorner}>
        <LinearGradient colors={[C.primaryLight, C.primary]} style={styles.logoBox}>
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
      <View style={[styles.card, { backgroundColor: C.primaryBg, shadowColor: C.primary }]}>
        <Text style={[styles.title, { color: C.textPrimary }]}>{t('newPasswordTitle')}</Text>

        <Input
          label={t('newPasswordNewLabel')}
          placeholder={t('newPasswordNewPlaceholder')}
          value={password}
          onChangeText={v => { setPassword(v); setErrors(prev => ({ ...prev, password: undefined })); }}
          isPassword
          leftIcon="lock-closed-outline"
          accentColor={C.primary}
          hint={t('newPasswordHint')}
          error={errors.password}
          containerStyle={styles.inputSpacing}
        />

        <Input
          label={t('newPasswordConfirmLabel')}
          placeholder={t('newPasswordConfirmPlaceholder')}
          value={confirm}
          onChangeText={v => { setConfirm(v); setErrors(prev => ({ ...prev, confirm: undefined })); }}
          isPassword
          leftIcon="lock-closed-outline"
          accentColor={C.primary}
          error={errors.confirm}
          containerStyle={styles.inputSpacing}
        />

        <View style={styles.btnWrapper}>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: C.primary }, loading && styles.btnDisabled]}
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
