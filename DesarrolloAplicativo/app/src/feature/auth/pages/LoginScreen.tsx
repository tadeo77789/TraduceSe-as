
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../shared/constants/colors';
import { Input } from '../../../shared/components/common/Input';
import { useLoginForm } from '../hooks/useLoginForm';
import { googleIcon, facebookIcon } from '../../../assets/icons/socialIcons';
import { useTranslation } from '../../../app/config/i18n';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { email, setEmail, password, setPassword, loading, errors, handleLogin } = useLoginForm();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= 1024;
  const { t } = useTranslation();

  const BackButton = (
    <TouchableOpacity
      style={[styles.backBtn, { top: insets.top + 10 }]}
      onPress={() => navigation.goBack()}
    >
      <Ionicons name="chevron-back" size={22} color={Colors.primary} />
    </TouchableOpacity>
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
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={38} color={Colors.primary} />
        </View>

        <Input
          placeholder={t('loginEmailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          leftIcon="mail-outline"
          error={errors.email}
          accentColor={Colors.primary}
          containerStyle={styles.inputSpacing}
        />

        <Input
          placeholder={t('loginPasswordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          isPassword
          leftIcon="lock-closed-outline"
          error={errors.password}
          accentColor={Colors.primary}
          containerStyle={styles.inputSpacing}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword' as never)}
          style={styles.forgotRow}
        >
          <Text style={styles.forgotText}>{t('loginForgotPassword')}</Text>
        </TouchableOpacity>

        <View style={styles.authRow}>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register' as never)}
          >
            <Text style={styles.registerBtnText}>{t('register')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>
              {loading ? t('loginSubmitLoading') : t('loginSubmitBtn')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.googleBtn}>
          <Image source={googleIcon} style={styles.socialLogoImg} resizeMode="contain" />
          <Text style={styles.googleText}>{t('loginContinueGoogle')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.facebookBtn}>
          <Image source={facebookIcon} style={styles.facebookLogoImg} resizeMode="contain" />
          <Text style={styles.facebookText}>{t('loginContinueFacebook')}</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          <Text>{t('loginAcceptTerms')}</Text>
          <Text>{' '}</Text>
          <Text style={styles.legalLink} onPress={() => navigation.navigate('Terms' as never)}>
            {t('loginTermsLink')}
          </Text>
          <Text>{' '}{t('loginAnd')}{' '}</Text>
          <Text style={styles.legalLink} onPress={() => navigation.navigate('PrivacyPolicy' as never)}>
            {t('loginPrivacyLink')}
          </Text>
          <Text>{'.'}</Text>
        </Text>
      </View>
    </ScrollView>
  );

  if (isWide) {
    return (
      <View style={styles.wideRoot}>
        <View style={styles.imagePanel}>
          <Image
            source={require('../../../assets/images/login.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>{'👌 TraduceSeña'}</Text>
            <Text style={styles.imageTagline}>{'Comunícate sin barreras'}</Text>
          </View>
        </View>

        <View style={styles.formPanel}>
          {BackButton}
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
      {BackButton}
      {FormPanel}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wideRoot: { flex: 1, flexDirection: 'row' },
  imagePanel: { flex: 1, overflow: 'hidden', position: 'relative' },
  heroImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  imageBadge: {
    position: 'absolute',
    bottom: 40,
    left: 40,
  },
  imageBadgeText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.3,
  },
  imageTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
    fontWeight: '500',
  },
  formPanel: {
    width: 420,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
  },

  mobileRoot: { flex: 1, backgroundColor: '#EDE9FE' },

  formScroll: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingVertical: 48,
    justifyContent: 'center',
  },
  formInner: {},

  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },

  inputSpacing: { width: '100%', marginBottom: 14 },

  forgotRow: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },

  authRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  registerBtn: {
    flex: 1,
    backgroundColor: '#C4B5FD',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: {
    color: '#5B21B6',
    fontSize: 14,
    fontWeight: '700',
  },
  loginBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: { opacity: 0.6 },

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

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  socialLogoImg: { width: 20, height: 20 },
  facebookLogoImg: { width: 30, height: 30, marginVertical: -5 },
  googleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3C4043',
  },
  facebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#1877F2',
    borderRadius: 12,
    paddingVertical: 14,
  },
  facebookText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  legalText: {
    marginTop: 24,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
