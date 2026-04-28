/**
 * @file ProfileScreen.tsx
 * @description Pantalla de perfil del usuario autenticado.
 *
 * Muestra:
 * - Avatar con degradado, nombre (extraído del email), email y badge de nivel.
 * - Mini-estadísticas: traducciones y señas aprendidas.
 * - Sección "Cuenta": correo y contraseña (solo lectura) + link de cambio de contraseña.
 * - Sección "Preferencias": toggle de tema claro/oscuro, toggle de notificaciones
 *   y selector de idioma de la app (Español, Inglés, Francés, Português).
 * - Sección "Acerca de": versión, términos y condiciones, política de privacidad.
 * - Botones de "Cerrar sesión" y "Eliminar cuenta" con confirmación.
 *
 * Usa `useAuth` para obtener el usuario y ejecutar `logout`, y `useTheme` para
 * el toggle de tema. La confirmación de acciones críticas usa `Alert` en móvil
 * y `confirm()` en web.
 *
 * @todo Conectar los campos de cuenta con `ENDPOINTS.updateProfile`.
 * @todo Implementar cambio de contraseña real.
 */
import React from 'react';
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
import { Colors } from '../../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../state/AuthContext';
import { useTheme, useColors } from '../../../state/ThemeContext';
import { useLanguage, LANGUAGE_NAMES, type LanguageCode } from '../../../state/LanguageContext';
import { useTranslation } from '../../../i18n';

const LANG_CODES: LanguageCode[] = ['es', 'en', 'fr', 'pt'];

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, resetTheme } = useTheme();
  const C = useColors();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const USER_STATS = [
    { label: t('profileTranslations'), value: '1,248', icon: 'swap-horizontal-outline' as const, color: Colors.primary },
    { label: t('profileLearned'), value: '84', icon: 'hand-left-outline' as const, color: '#D97706' },
  ];

  const displayName = user?.email?.split('@')[0] ?? 'Usuario';
  const displayEmail = user?.email ?? 'usuario@traducsenas.com';

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-restricted-globals
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
      // eslint-disable-next-line no-restricted-globals
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
          <LinearGradient colors={['#9333EA', '#7C3AED']} style={styles.avatarCircle}>
            <Ionicons name="person" size={44} color="#fff" />
          </LinearGradient>
          <Text style={[styles.userName, { color: C.textPrimary }]}>{displayName}</Text>
          <Text style={[styles.userEmail, { color: C.textSecondary }]}>{displayEmail}</Text>
        </View>
        {/* Estadísticas del usuario */}
        <View style={styles.statsRow}>
          {USER_STATS.map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: C.surface }]}>
              <Ionicons name={stat.icon} size={18} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: C.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Sección de cuenta */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>{t('profileAccount')}</Text>
          <View style={[styles.sectionCard, { backgroundColor: C.surface }]}>
            <Input
              label={t('email')}
              value={displayEmail}
              editable={false}
              rightIcon="lock-closed-outline"
              containerStyle={styles.inputStyle}
            />
            <Input
              label={t('password')}
              value="••••••••"
              isPassword
              editable={false}
              containerStyle={styles.inputStyle}
            />
            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => (navigation.navigate as any)('ForgotPassword', { fromProfile: true })}
            >
              <Ionicons name="key-outline" size={14} color={Colors.primary} />
              <Text style={styles.forgotLink}>{t('profileChangePassword')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferencias */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>{t('profilePreferences')}</Text>
          <View style={[styles.sectionCard, { backgroundColor: C.surface }]}>
            {/* Tema */}
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <View style={[styles.prefIcon, { backgroundColor: C.primaryBg }]}>
                  <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={Colors.primary} />
                </View>
                <Text style={[styles.themeLabel, { color: C.textPrimary }]}>{t('profileThemeLabel')} {isDark ? t('profileThemeDark') : t('profileThemeLight')}</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: Colors.toggleOff, true: Colors.toggleOn }}
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
                value={true}
                trackColor={{ false: Colors.toggleOff, true: '#059669' }}
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
                    language === code && [styles.idiomaChipActive, { backgroundColor: C.primaryBg }],
                  ]}
                >
                  <Text style={[styles.idiomaText, { color: C.textSecondary }, language === code && styles.idiomaTextActive]}>
                    {LANGUAGE_NAMES[code]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Información de la app */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>{t('profileAbout')}</Text>
          <View style={[styles.sectionCard, { backgroundColor: C.surface }]}>
            {[
              { icon: 'information-circle-outline', label: t('profileAppVersion'), value: '1.0.0' },
              { icon: 'document-text-outline', label: t('profileTerms'), value: '' },
              { icon: 'shield-checkmark-outline', label: t('profilePrivacy'), value: '' },
            ].map((item, i) => (
              <View key={i}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: C.border }]} />}
                <TouchableOpacity style={styles.infoRow}>
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

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 24, paddingTop: 12 },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 5, textTransform: 'capitalize' },
  userEmail: { fontSize: 14, color: Colors.textSecondary, marginBottom: 12 },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
  },
  levelText: { fontSize: 13, fontWeight: '700', color: '#D97706' },

  // Stats del usuario
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', lineHeight: 15 },

  // Sections
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 10, marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#fff', borderRadius: 22, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
  },
  inputStyle: { marginBottom: 14 },
  forgotRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 4 },
  forgotLink: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  prefRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 6,
  },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  prefIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  themeLabel: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },
  idiomaLabel: {
    fontSize: 12, fontWeight: '700', color: Colors.textSecondary,
    letterSpacing: 0.4, marginBottom: 12,
  },
  idiomaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  idiomaChip: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff',
  },
  idiomaChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  idiomaText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  idiomaTextActive: { color: Colors.primary, fontWeight: '700' },

  // Acerca de
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 6 },
  infoLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  infoValue: { fontSize: 13, color: Colors.textSecondary },

  actionsSection: { gap: 14 },
});
