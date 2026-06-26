import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../app/providers/ThemeContext';
import { useTranslation, type TranslationKey } from '../../../app/config/i18n';

const SECTION_KEYS: { title: TranslationKey; body: TranslationKey }[] = [
  { title: 'privacySection1Title',  body: 'privacySection1Body'  },
  { title: 'privacySection2Title',  body: 'privacySection2Body'  },
  { title: 'privacySection3Title',  body: 'privacySection3Body'  },
  { title: 'privacySection4Title',  body: 'privacySection4Body'  },
  { title: 'privacySection5Title',  body: 'privacySection5Body'  },
  { title: 'privacySection6Title',  body: 'privacySection6Body'  },
  { title: 'privacySection7Title',  body: 'privacySection7Body'  },
  { title: 'privacySection8Title',  body: 'privacySection8Body'  },
  { title: 'privacySection9Title',  body: 'privacySection9Body'  },
  { title: 'privacySection10Title', body: 'privacySection10Body' },
  { title: 'privacySection11Title', body: 'privacySection11Body' },
];

export const PrivacyPolicyScreen: React.FC = () => {
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
        <Text style={[styles.headerTitle, { color: C.textPrimary }]}>{t('privacyScreenTitle')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={[styles.introCard, { backgroundColor: C.primaryBg, borderColor: C.primary }]}>
          <Ionicons name="shield-checkmark" size={28} color={C.primary} style={styles.introIcon} />
          <Text style={[styles.introTitle, { color: C.primary }]}>{t('privacyIntroTitle')}</Text>
          <Text style={[styles.introSub, { color: C.textSecondary }]}>
            {t('privacyIntroSub')}
          </Text>
          <Text style={[styles.introDate, { color: C.textHint }]}>{t('privacyLastUpdated')}</Text>
        </View>

        <View style={[styles.highlightBox, { backgroundColor: C.surface, borderColor: C.primary }]}>
          <Ionicons name="lock-closed" size={16} color={C.primary} />
          <Text style={[styles.highlightText, { color: C.textSecondary }]}>
            {'  '}{t('privacyHighlight')}
          </Text>
        </View>

        {/* Sections */}
        {SECTION_KEYS.map((s, i) => (
          <View key={i} style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>{t(s.title)}</Text>
            <Text style={[styles.sectionBody, { color: C.textSecondary }]}>{t(s.body)}</Text>
          </View>
        ))}

        <Text style={[styles.footer, { color: C.textHint }]}>
          {t('privacyFooter')}
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
    marginBottom: 12,
  },
  introIcon: { marginBottom: 10 },
  introTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  introSub: { fontSize: 13, textAlign: 'center', marginBottom: 6 },
  introDate: { fontSize: 12 },

  highlightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },

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
