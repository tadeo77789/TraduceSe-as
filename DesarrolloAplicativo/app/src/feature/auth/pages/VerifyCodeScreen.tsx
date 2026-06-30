
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
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
import { useColors } from '../../../app/providers/ThemeContext';
import { useTranslation } from '../../../app/config/i18n';

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

  const themedC = useColors();
  const C = fromProfile ? themedC : Colors;
  const rootBg = C.background;
  const { t } = useTranslation();

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
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
        <Text style={[styles.title, { color: C.textPrimary }]}>{t('verifyTitle')}</Text>
        <Text style={[styles.subtitle, { color: C.textSecondary }]}>
          {t('verifySubtitle')}
        </Text>

        <View style={styles.otpRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={el => { if (el) inputs.current[i] = el; }}
              style={[
                styles.otpInput,
                { backgroundColor: C.inputBg, borderColor: C.border, color: C.textPrimary },
                digit ? { borderColor: C.primary, backgroundColor: C.primaryBg } : null,
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
            style={[styles.submitBtn, { backgroundColor: C.primary }, loading && styles.btnDisabled]}
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
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    lineHeight: Platform.OS === 'web' ? 50 : undefined,
    includeFontPadding: false,
  },
  otpFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#EDE9FE',
  },

  btnWrapper: { alignItems: 'center', marginTop: 4 },
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
