// Archivo: app/presentation/screens/Admin/AdminDashboardScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { useColors } from '../../../state/ThemeContext';
import { useTranslation } from '../../../i18n';
import { useAuth } from '../../../state/AuthContext';
import { getSampleCounts, signVisionProvider } from '../../../services/vision';
import { useLanguage } from '../../../state/LanguageContext';
import type { AdminStackParams } from '../../navigation/AdminStackNavigator';

const ALPHABET_LSC = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'H', 'I', 'J', 'K', 'L', 'M', 'N',
  'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z', '5',
];

type Nav = NativeStackNavigationProp<AdminStackParams, 'Dashboard'>;

export const AdminDashboardScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const C = useColors();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigation = useNavigation<Nav>();

  const [sampleCounts, setSampleCounts] = useState<Record<string, number>>({});

  const refresh = useCallback(async () => {
    setSampleCounts(await getSampleCounts());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Refrescar al volver a la pantalla
  useEffect(() => {
    const unsub = navigation.addListener('focus', refresh);
    return unsub;
  }, [navigation, refresh]);

  const totalSamples = Object.values(sampleCounts).reduce((a, b) => a + b, 0);
  const lettersTrained = ALPHABET_LSC.filter(l => (sampleCounts[l] ?? 0) > 0).length;
  const coverage = Math.round((lettersTrained / ALPHABET_LSC.length) * 100);
  const aiActive = totalSamples > 0;

  const maxCount = Math.max(1, ...Object.values(sampleCounts));

  const appVersion = '1.0.0';
  const platformLabel = Platform.OS === 'web' ? 'Web' : Platform.OS === 'ios' ? 'iOS' : 'Android';

  return (
    <View style={[styles.root, { backgroundColor: C.backgroundGray }]}>
      <AppHeader />
      <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
        <View style={[styles.inner, isTablet && styles.innerWide]}>

          <View style={styles.titleRow}>
            <LinearGradient colors={[C.primary, C.primaryDark]} style={styles.titleIcon}>
              <Ionicons name="speedometer" size={20} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: C.textPrimary }]}>{t('adminDashboardTitle')}</Text>
              <Text style={[styles.subtitle, { color: C.textSecondary }]}>{t('adminDashboardSubtitle')}</Text>
            </View>
          </View>

          {/* ── Estado de la IA ── */}
          <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles" size={16} color={C.primary} />
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>{t('adminAiState')}</Text>
            </View>

            <View style={styles.metricsRow}>
              <View style={[styles.metricCard, { backgroundColor: C.primaryBg }]}>
                <Text style={[styles.metricValue, { color: C.primary }]}>{totalSamples}</Text>
                <Text style={[styles.metricLabel, { color: C.primary }]}>{t('trainTotalSamples')}</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: C.primaryBg }]}>
                <Text style={[styles.metricValue, { color: C.primary }]}>{lettersTrained}/{ALPHABET_LSC.length}</Text>
                <Text style={[styles.metricLabel, { color: C.primary }]}>{t('trainLettersCovered')}</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: C.primaryBg }]}>
                <Text style={[styles.metricValue, { color: C.primary }]}>{coverage}%</Text>
                <Text style={[styles.metricLabel, { color: C.primary }]}>{t('adminCoverage')}</Text>
              </View>
            </View>

            <View style={[styles.statusPill, { backgroundColor: aiActive ? '#D1FAE5' : C.inputBg }]}>
              <View style={[styles.statusDot, { backgroundColor: aiActive ? '#059669' : C.textHint }]} />
              <Text style={[styles.statusText, { color: aiActive ? '#059669' : C.textSecondary }]}>
                {aiActive ? t('adminAiActive') : t('adminAiInactive')}
              </Text>
            </View>

            {/* Barras por letra */}
            <Text style={[styles.subSectionTitle, { color: C.textSecondary }]}>{t('adminSamplesPerLetter')}</Text>
            <View style={styles.barsList}>
              {ALPHABET_LSC.map(letter => {
                const count = sampleCounts[letter] ?? 0;
                const pct = (count / maxCount) * 100;
                return (
                  <View key={letter} style={styles.barRow}>
                    <Text style={[styles.barLabel, { color: C.textPrimary }]}>{letter}</Text>
                    <View style={[styles.barTrack, { backgroundColor: C.inputBg }]}>
                      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: count > 0 ? C.primary : 'transparent' }]} />
                    </View>
                    <Text style={[styles.barCount, { color: C.textSecondary }]}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── Sistema ── */}
          <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="hardware-chip-outline" size={16} color={C.primary} />
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>{t('adminSystem')}</Text>
            </View>
            <SystemRow label={t('adminAppVersion')} value={appVersion} C={C} />
            <SystemRow label={t('adminPlatform')} value={platformLabel} C={C} />
            <SystemRow label={t('adminLanguage')} value={language.toUpperCase()} C={C} />
            <SystemRow label={t('adminVisionProvider')} value={signVisionProvider.name} C={C} />
            <SystemRow label={t('adminAdminUser')} value={user?.email ?? '—'} C={C} />
          </View>

          {/* ── Acciones rápidas ── */}
          <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash-outline" size={16} color={C.primary} />
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>{t('adminQuickActions')}</Text>
            </View>

            <TouchableOpacity
              style={[styles.actionRow, { backgroundColor: C.primaryBg }]}
              onPress={() => navigation.navigate('Training')}
              activeOpacity={0.85}
            >
              <Ionicons name="school" size={20} color={C.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: C.primary }]}>{t('adminGoToTraining')}</Text>
                <Text style={[styles.actionDesc, { color: C.primary }]}>{t('adminGoToTrainingDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.primary} />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

interface SystemRowProps {
  label: string;
  value: string;
  C: ReturnType<typeof useColors>;
}

const SystemRow: React.FC<SystemRowProps> = ({ label, value, C }) => (
  <View style={[styles.systemRow, { borderBottomColor: C.border }]}>
    <Text style={[styles.systemLabel, { color: C.textSecondary }]}>{label}</Text>
    <Text style={[styles.systemValue, { color: C.textPrimary }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40, alignItems: 'center' },
  contentDesktop: { paddingHorizontal: 48, paddingVertical: 32 },
  inner: { width: '100%', gap: 16 },
  innerWide: { maxWidth: 820, alignSelf: 'center' },

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  titleIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },

  section: { borderRadius: 18, padding: 16, borderWidth: 1.5, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  subSectionTitle: { fontSize: 11, fontWeight: '700', marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  metricsRow: { flexDirection: 'row', gap: 8 },
  metricCard: { flex: 1, padding: 12, borderRadius: 14, alignItems: 'center', gap: 4 },
  metricValue: { fontSize: 20, fontWeight: '800' },
  metricLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },

  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },

  barsList: { gap: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 22, fontSize: 12, fontWeight: '800' },
  barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barCount: { width: 24, fontSize: 11, fontWeight: '700', textAlign: 'right' },

  systemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  systemLabel: { fontSize: 12, fontWeight: '600' },
  systemValue: { fontSize: 13, fontWeight: '700' },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14 },
  actionTitle: { fontSize: 14, fontWeight: '700' },
  actionDesc: { fontSize: 11, fontWeight: '500', opacity: 0.85 },
});
