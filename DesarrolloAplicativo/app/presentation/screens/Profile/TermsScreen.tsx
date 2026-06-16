import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../shared/state/ThemeContext';
import { useTranslation, type TranslationKey } from '../../../shared/i18n';

const SECTION_KEYS: { title: TranslationKey; body: TranslationKey }[] = [
  { title: 'termsSection1Title', body: 'termsSection1Body' },
  { title: 'termsSection2Title', body: 'termsSection2Body' },
  { title: 'termsSection3Title', body: 'termsSection3Body' },
  { title: 'termsSection4Title', body: 'termsSection4Body' },
  { title: 'termsSection5Title', body: 'termsSection5Body' },
  { title: 'termsSection6Title', body: 'termsSection6Body' },
  { title: 'termsSection7Title', body: 'termsSection7Body' },
  { title: 'termsSection8Title', body: 'termsSection8Body' },
  { title: 'termsSection9Title', body: 'termsSection9Body' },
];

export const TermsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const C = useColors();
  const { t } = useTranslation();
  const isWide = width >= 768;

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={C.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.textPrimary }]}>{t('termsScreenTitle')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={[styles.introCard, { backgroundColor: C.primaryBg, borderColor: C.primary }]}>
          <Ionicons name="document-text" size={28} color={C.primary} style={styles.introIcon} />
          <Text style={[styles.introTitle, { color: C.primary }]}>{t('termsIntroTitle')}</Text>
          <Text style={[styles.introSub, { color: C.textSecondary }]}>
            {t('termsIntroSub')}
          </Text>
          <Text style={[styles.introDate, { color: C.textHint }]}>{t('termsLastUpdated')}</Text>
        </View>

        {/* Sections */}
        {SECTION_KEYS.map((s, i) => (
          <View key={i} style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>{t(s.title)}</Text>
            <Text style={[styles.sectionBody, { color: C.textSecondary }]}>{t(s.body)}</Text>
          </View>
        ))}

        <Text style={[styles.footer, { color: C.textHint }]}>
          {t('termsFooter')}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  headerSpacer: { width: 36 },

  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  scrollContentWide: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 680,
  },

  introCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  introIcon: { marginBottom: 10 },
  introTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  introSub: { fontSize: 13, textAlign: 'center', marginBottom: 6 },
  introDate: { fontSize: 12 },

  section: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
});
