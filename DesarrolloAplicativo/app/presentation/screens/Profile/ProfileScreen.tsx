/**
 * @file ProfileScreen.tsx
 * @description Pantalla de perfil del usuario autenticado.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../shared/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../shared/state/AuthContext';
import { useTheme, useColors, type ColorAccent } from '../../../shared/state/ThemeContext';
import { useLanguage, LANGUAGE_NAMES, type LanguageCode } from '../../../shared/state/LanguageContext';
import { useTranslation } from '../../../shared/i18n';

const LANG_CODES: LanguageCode[] = ['es', 'en', 'fr', 'pt'];

// Opciones de color de acento
const COLOR_ACCENTS: { key: ColorAccent; label: string; color: string; dark: string }[] = [
  { key: 'purple', label: 'Morado', color: '#7C3AED', dark: '#9D60F5' },
  { key: 'green',  label: 'Verde',  color: '#4CAF82', dark: '#5DBF92' },
];

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, resetTheme, colorAccent, setColorAccent } = useTheme();
  const C = useColors();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const USER_STATS = [
    { label: t('profileTranslations'), value: '1,248', icon: 'swap-horizontal-outline' as const, color: C.primary },
    { label: t('profileLearned'), value: '84', icon: 'hand-left-outline' as const, color: '#D97706' },
  ];

  const displayName = user?.email?.split('@')[0] ?? 'Usuario';
  const displayEmail = user?.email ?? 'usuario@traducsenas.com';

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (confirm(t('profileConfirmLogout'))) {
        resetTheme();
        await logout();
      }
    } else {
      Alert.alert(t('logout'), t('profileConfirmLogout'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('profileLogout'), style: 'destructive', onPress: async () => { resetTheme(); await logout(); } },
      ]);
    }
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      if (confirm(t('profileConfirmDelete'))) {
        alert(t('profileAccountDeleted'));
      }
    } else {
      Alert.alert(
        t('profileDeleteAccount'),
        t('profileConfirmDelete'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('delete'), style: 'destructive', onPress: () => Alert.alert(t('profileAccountDeleted')) },
        ]
      );
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: C.backgroundGray }]}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, isWide && styles.contentWide]} showsVerticalScrollIndicator={false}>
        <View style={[styles.innerWrapper, isWide && styles.innerWrapperWide]}>

          {/* Avatar + nombre */}
          <View style={styles.avatarSection}>
            <LinearGradient colors={[C.primaryLight, C.primary]} style={[styles.avatarCircle, { shadowColor: C.primary }]}>
              <Ionicons name="person" size={44} color="#fff" />
            </LinearGradient>
            <Text style={[styles.userName, { color: C.textPrimary }]}>{displayName}</Text>
            <Text style={[styles.userEmail, { color: C.textSecondary }]}>{displayEmail}</Text>
          </View>

          {/* Estadísticas */}
          <View style={styles.statsRow}>
            {USER_STATS.map((stat, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: C.surface }]}>
                <Ionicons name={stat.icon} size={18} color={stat.color} />
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: C.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Cuenta */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>{t('profileAccount')}</Text>
            <View style={[styles.sectionCard, { backgroundColor: C.surface }]}>
              <Input label={t('email')} value={displayEmail} editable={false} rightIcon="mail-outline" containerStyle={styles.inputStyle} />
              <Input label={t('password')} value="••••••••" isPassword editable={false} containerStyle={styles.inputStyle} />
              <TouchableOpacity style={styles.forgotRow} onPress={() => (navigation.navigate as any)('ForgotPassword', { fromProfile: true })}>
                <Ionicons name="key-outline" size={14} color={C.primary} />
                <Text style={[styles.forgotLink, { color: C.primary }]}>{t('profileChangePassword')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferencias */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>{t('profilePreferences')}</Text>
            <View style={[styles.sectionCard, { backgroundColor: C.surface }]}>

              {/* Color de la app */}
              <Text style={[styles.prefGroupLabel, { color: C.textSecondary }]}>Color de la app</Text>
              <View style={styles.accentRow}>
                {COLOR_ACCENTS.map(accent => {
                  const isSelected = colorAccent === accent.key;
                  const accentColor = isDark ? accent.dark : accent.color;
                  return (
                    <TouchableOpacity
                      key={accent.key}
                      onPress={() => setColorAccent(accent.key)}
                      style={[
                        styles.accentChip,
                        { borderColor: isSelected ? accentColor : C.border, backgroundColor: C.surface },
                        isSelected && { backgroundColor: accentColor + '18' },
                      ]}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.accentDot, { backgroundColor: accentColor }]}>
                        {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
                      </View>
                      <Text style={[styles.accentLabel, { color: isSelected ? accentColor : C.textSecondary }, isSelected && { fontWeight: '700' }]}>
                        {accent.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.divider, { backgroundColor: C.border }]} />

              {/* Modo oscuro */}
              <View style={styles.prefRow}>
                <View style={styles.prefLeft}>
                  <View style={[styles.prefIcon, { backgroundColor: C.primaryBg }]}>
                    <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={C.primary} />
                  </View>
                  <Text style={[styles.themeLabel, { color: C.textPrimary }]}>
                    {t('profileThemeLabel')} {isDark ? t('profileThemeDark') : t('profileThemeLight')}
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: C.toggleOff, true: C.primary }}
                  thumbColor="#fff"
                />
              </View>

              <View style={[styles.divider, { backgroundColor: C.border }]} />

              {/* Notificaciones */}
              <View style={styles.prefRow}>
                <View style={styles.prefLeft}>
                  <View style={[styles.prefIcon, { backgroundColor: isDark ? 'rgba(16,185,129,0.18)' : '#D1FAE5' }]}>
                    <Ionicons name="notifications-outline" size={18} color="#059669" />
                  </View>
                  <Text style={[styles.themeLabel, { color: C.textPrimary }]}>{t('profileNotifications')}</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: C.toggleOff, true: '#059669' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={[styles.divider, { backgroundColor: C.border }]} />

              {/* Idioma */}
              <Text style={[styles.idiomaLabel, { color: C.textSecondary }]}>{t('profileLanguage')}</Text>
              <View style={styles.idiomaRow}>
                {LANG_CODES.map(code => (
                  <TouchableOpacity
                    key={code}
                    onPress={() => setLanguage(code)}
                    style={[
                      styles.idiomaChip,
                      { backgroundColor: C.surface, borderColor: C.border },
                      language === code && [styles.idiomaChipActive, { backgroundColor: C.primaryBg, borderColor: C.primary }],
                    ]}
                  >
                    <Text style={[styles.idiomaText, { color: C.textSecondary }, language === code && { color: C.primary, fontWeight: '700' }]}>
                      {LANGUAGE_NAMES[code]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Acerca de */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>{t('profileAbout')}</Text>
            <View style={[styles.sectionCard, { backgroundColor: C.surface }]}>
              {[
                { icon: 'information-circle-outline', label: t('profileAppVersion'), value: '1.0.0', onPress: undefined },
                { icon: 'document-text-outline', label: t('profileTerms'), value: '', onPress: () => (navigation as any).navigate('Terms') },
                { icon: 'shield-checkmark-outline', label: t('profilePrivacy'), value: '', onPress: () => (navigation as any).navigate('PrivacyPolicy') },
              ].map((item, i) => (
                <View key={i}>
                  {i > 0 && <View style={[styles.divider, { backgroundColor: C.border }]} />}
                  <TouchableOpacity style={styles.infoRow} onPress={item.onPress} disabled={!item.onPress}>
                    <Ionicons name={item.icon as any} size={18} color={C.textSecondary} />
                    <Text style={[styles.infoLabel, { color: C.textPrimary }]}>{item.label}</Text>
                    <Text style={[styles.infoValue, { color: C.textSecondary }]}>{item.value}</Text>
                    {!item.value && <Ionicons name="chevron-forward" size={16} color={C.textHint} />}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Acciones */}
          <View style={styles.actionsSection}>
            <Button title={t('profileLogout')} onPress={handleLogout} fullWidth />
            <Button title={t('profileDeleteAccount')} onPress={handleDeleteAccount} variant="danger" fullWidth />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  contentWide: { alignItems: 'center', paddingVertical: 36 },
  innerWrapper: { width: '100%' },
  innerWrapperWide: { width: '100%', maxWidth: 640 },

  avatarSection: { alignItems: 'center', marginBottom: 24, paddingTop: 12 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10 },
  userName: { fontSize: 22, fontWeight: '800', marginBottom: 5, textTransform: 'capitalize' },
  userEmail: { fontSize: 14, marginBottom: 12 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 18, padding: 16, alignItems: 'center', gap: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, textAlign: 'center', lineHeight: 15 },

  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10, marginLeft: 4 },
  sectionCard: { borderRadius: 22, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 4 },
  inputStyle: { marginBottom: 14 },
  forgotRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 4 },
  forgotLink: { fontSize: 13, fontWeight: '600' },

  // Color accent
  prefGroupLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, marginBottom: 12 },
  accentRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  accentChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 2 },
  accentDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  accentLabel: { fontSize: 14 },

  prefRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  prefIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  themeLabel: { fontSize: 15, fontWeight: '500' },
  divider: { height: 1, marginVertical: 14 },
  idiomaLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, marginBottom: 12 },
  idiomaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  idiomaChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  idiomaChipActive: {},
  idiomaText: { fontSize: 13, fontWeight: '500' },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 6 },
  infoLabel: { flex: 1, fontSize: 15 },
  infoValue: { fontSize: 13 },

  actionsSection: { gap: 14 },
});
