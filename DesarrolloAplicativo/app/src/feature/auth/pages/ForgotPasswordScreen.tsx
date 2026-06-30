
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  Alert, useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams } from '../../../app/routes/AuthNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../shared/constants/colors';
import { Input } from '../../../shared/components/common/Input';
import { useColors } from '../../../app/providers/ThemeContext';
import { useTranslation } from '../../../app/config/i18n';

type NavigationProps = NativeStackNavigationProp<AuthStackParams>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute();
  const fromProfile = (route.params as any)?.fromProfile ?? false;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= 768;

  const themedC = useColors();
  const C = fromProfile ? themedC : Colors;
  const rootBg = C.background;
  const { t } = useTranslation();

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const handleConfirm = async () => {
    if (!email.trim()) {
      setEmailError(t('forgotErrorEmpty'));
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError(t('loginEmailInvalid'));
      return;
    }
    setEmailError(undefined);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigation.navigate('VerifyCode', { fromProfile });
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
          <Text style={[styles.title, { color: C.textPrimary }]}>
            {fromProfile ? t('forgotTitleFromProfile') : t('forgotTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: C.textSecondary }]}>
            {fromProfile ? t('forgotSubtitleFromProfile') : t('forgotSubtitle')}
          </Text>

          <Input
            label={t('forgotEmailLabel')}
            placeholder={t('forgotEmailPlaceholder')}
            value={email}
            onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(undefined); }}
            keyboardType="email-address"
            leftIcon="mail-outline"
            accentColor={C.primary}
            error={emailError}
            containerStyle={styles.inputSpacing}
          />

          <View style={styles.btnWrapper}>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: C.primary }, loading && styles.btnDisabled]}
              onPress={handleConfirm}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>
                {loading ? t('forgotBtnLoading') : t('forgotBtn')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {!fromProfile && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.linkRow}
          >
            <Text style={[styles.linkText, { color: C.textSecondary }]}>
              {t('forgotRemembered')}{' '}
              <Text style={styles.linkAccent}>{t('forgotLoginLink')}</Text>
            </Text>
          </TouchableOpacity>
        )}
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
    width: 42,
    height: 42,
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
    elevation: 3,
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 22,
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

  linkRow: { alignItems: 'center', marginTop: 22 },
  linkText: { fontSize: 13, color: Colors.textSecondary },
  linkAccent: { color: Colors.primary, fontWeight: '700' },
});
