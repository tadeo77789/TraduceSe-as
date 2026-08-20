
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ListRenderItem,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../../shared/components/common/AppHeader';
import { Colors } from '../../../shared/constants/colors';
import { useColors, useTheme } from '../../../app/providers/ThemeContext';
import { useTranslation, type TranslationKey } from '../../../app/config/i18n';

interface LetterItem { letter: string; imageUrl: string }

const ALPHABET: LetterItem[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  .split('')
  .map(letter => ({
    letter,
    imageUrl: `https://www.lifeprint.com/asl101/images-handshapes/${letter.toLowerCase()}.gif`,
  }));

const ACCENTS = [
  { bg: '#EDE9FE', fg: '#7C3AED' },
  { bg: '#DBEAFE', fg: '#2563EB' },
  { bg: '#D1FAE5', fg: '#059669' },
  { bg: '#FEF3C7', fg: '#D97706' },
  { bg: '#FCE7F3', fg: '#DB2777' },
  { bg: '#FFE4E6', fg: '#E11D48' },
];

const DARK_ACCENTS = [
  { bg: '#2D1F4E', fg: '#9F71ED' },
  { bg: '#162644', fg: '#60A5FA' },
  { bg: '#0D2B1E', fg: '#34D399' },
  { bg: '#2A1C08', fg: '#FCD34D' },
  { bg: '#2A0F23', fg: '#F472B6' },
  { bg: '#2A0A10', fg: '#FB7185' },
];

// Clips MP4 por letra (Metro exige require con ruta literal)
const LETTER_VIDEOS: Record<string, number> = {
  A: require('../../../assets/clips/letra_A.mp4'),
  B: require('../../../assets/clips/letra_B.mp4'),
  C: require('../../../assets/clips/letra_C.mp4'),
  D: require('../../../assets/clips/letra_D.mp4'),
  E: require('../../../assets/clips/letra_E.mp4'),
  F: require('../../../assets/clips/letra_F.mp4'),
  G: require('../../../assets/clips/letra_G.mp4'),
  H: require('../../../assets/clips/letra_H.mp4'),
  I: require('../../../assets/clips/letra_I.mp4'),
  J: require('../../../assets/clips/letra_J.mp4'),
  K: require('../../../assets/clips/letra_K.mp4'),
  L: require('../../../assets/clips/letra_L.mp4'),
  M: require('../../../assets/clips/letra_M.mp4'),
  N: require('../../../assets/clips/letra_N.mp4'),
  O: require('../../../assets/clips/letra_O.mp4'),
  P: require('../../../assets/clips/letra_P.mp4'),
  Q: require('../../../assets/clips/letra_Q.mp4'),
  R: require('../../../assets/clips/letra_R.mp4'),
  S: require('../../../assets/clips/letra_S.mp4'),
  T: require('../../../assets/clips/letra_T.mp4'),
  U: require('../../../assets/clips/letra_U.mp4'),
  V: require('../../../assets/clips/letra_V.mp4'),
  W: require('../../../assets/clips/letra_W.mp4'),
  X: require('../../../assets/clips/letra_X.mp4'),
  Y: require('../../../assets/clips/letra_Y.mp4'),
  Z: require('../../../assets/clips/letra_Z.mp4'),
};

export const AlphabetScreen: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const C = useColors();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const PALETTE = isDark
    ? [{ bg: C.primaryBg, fg: C.primary }, ...DARK_ACCENTS.slice(1)]
    : [{ bg: C.primaryBg, fg: C.primary }, ...ACCENTS.slice(1)];
  const videoRef      = useRef<any>(null);
  const backdropAnim  = useRef(new Animated.Value(0)).current;

  const [selected,   setSelected]   = useState<LetterItem | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [sheetOpen,  setSheetOpen]  = useState(false);

  const COLS      = width >= 1024 ? 9 : width >= 768 ? 7 : 5;
  const GAP       = 10;
  const H_PAD     = 20;
  const ITEM_SIZE = Math.floor((width - H_PAD * 2 - (COLS - 1) * GAP) / COLS);
  const ITEM_H    = ITEM_SIZE + 28;

  const VIEWER_H = height < 600 ? 240 : 300;

  const sheetAnim = useRef(new Animated.Value(500)).current;

  const openSheet = useCallback(() => {
    setSheetOpen(true);
    Animated.parallel([
      Animated.spring(sheetAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 180,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [sheetAnim, backdropAnim]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(sheetAnim, {
        toValue: 500,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSheetOpen(false);
      setSelected(null);
      setVideoReady(false);
    });
  }, [sheetAnim, backdropAnim]);

  // reinicia el estado de carga al cambiar de letra
  useEffect(() => { setVideoReady(false); }, [selected?.letter]);

  const replayVideo = useCallback(() => {
    const v: any = videoRef.current;
    if (!v) return;
    if (Platform.OS === 'web') { v.currentTime = 0; v.play?.(); }
    else { v.replayAsync?.(); }
  }, []);

  const navigateLetter = useCallback((direction: 'prev' | 'next') => {
    if (!selected) return;
    const idx = ALPHABET.findIndex(a => a.letter === selected.letter);
    const nextIdx = direction === 'next'
      ? (idx + 1) % ALPHABET.length
      : (idx - 1 + ALPHABET.length) % ALPHABET.length;
    setSelected(ALPHABET[nextIdx]);
  }, [selected]);

  const handleSelect = useCallback((item: LetterItem) => {
    setSelected(item);
    openSheet();
  }, [openSheet]);

  const renderItem: ListRenderItem<LetterItem> = useCallback(({ item, index }) => {
    const ac = PALETTE[index % PALETTE.length];
    return (
      <TouchableOpacity
        style={[
          styles.letterCard,
          { backgroundColor: ac.bg, width: ITEM_SIZE, height: ITEM_H },
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.75}
      >
        <View style={{ width: ITEM_SIZE - 10, height: ITEM_SIZE - 10, borderRadius: 10, overflow: 'hidden', backgroundColor: ac.bg }}>
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>
        <View style={[
          styles.letterBadge,
          isDark
            ? { borderWidth: 1.5, borderColor: ac.fg }
            : { backgroundColor: ac.fg },
        ]}>
          <Text style={[styles.letterBadgeText, isDark && { color: ac.fg }]}>
            {item.letter}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [handleSelect, ITEM_SIZE, ITEM_H, PALETTE]);

  const getItemLayout = useCallback((_: unknown, i: number) => ({
    length: ITEM_H, offset: ITEM_H * Math.floor(i / COLS), index: i,
  }), [ITEM_H, COLS]);

  const selIdx    = selected ? ALPHABET.findIndex(a => a.letter === selected.letter) : 0;
  const selAccent = PALETTE[selIdx % PALETTE.length];

  return (
    <View style={[styles.root, { backgroundColor: C.backgroundGray }]}>
      <AppHeader />

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>{t('alphabetTitle')}</Text>
          <Text style={[styles.sectionSub, { color: C.textSecondary }]}>{t('appTagline')}</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: C.primaryBg }]}>
          <Text style={[styles.countText, { color: C.primary }]}>26 {t('alphabetLetters')}</Text>
        </View>
      </View>

      <FlatList
        data={ALPHABET}
        key={COLS}
        numColumns={COLS}
        keyExtractor={(item) => item.letter}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={26}
        showsVerticalScrollIndicator={false}
      />

      {sheetOpen && (
        <Animated.View
          style={[styles.modalOverlay, { opacity: backdropAnim, pointerEvents: 'box-none' }]}
        >

          <TouchableWithoutFeedback onPress={closeSheet}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.sheet,
              { transform: [{ translateY: sheetAnim }], backgroundColor: C.surface, shadowColor: C.primary },
            ]}
          >

          <LinearGradient
            colors={[selAccent.bg, C.surface] as [string, string]}
            style={styles.sheetHeader}
          >

            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: C.inputBg }]}
              onPress={() => navigateLetter('prev')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={16} color={C.textSecondary} />
            </TouchableOpacity>

            <View style={[
              styles.sheetLetterBadge,
              isDark
                ? { borderWidth: 2, borderColor: selAccent.fg, backgroundColor: selAccent.bg }
                : { backgroundColor: selAccent.fg },
            ]}>
              <Text style={[styles.sheetLetter, isDark && { color: selAccent.fg }]}>
                {selected?.letter ?? ''}
              </Text>
            </View>

            <View style={styles.sheetTitleBlock}>
              <Text style={[styles.sheetTitle, { color: C.textPrimary }]}>
                {t('alphabetSign')} <Text style={{ color: selAccent.fg }}>{selected?.letter ?? ''}</Text>
              </Text>
              <Text style={[styles.sheetSubtitle, { color: C.textSecondary }]}>LSC</Text>
            </View>

            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: C.inputBg }]}
              onPress={() => navigateLetter('next')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={16} color={C.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: C.inputBg }]} onPress={closeSheet}>
              <Ionicons name="close" size={18} color={C.textSecondary} />
            </TouchableOpacity>
          </LinearGradient>

          <View style={[styles.viewerWrap, { width: VIEWER_H * 0.75, height: VIEWER_H, backgroundColor: C.inputBg, shadowColor: C.primary }]}>
            {selected && (Platform.OS === 'web'
              ? React.createElement('video', {
                  ref: videoRef,
                  src: Image.resolveAssetSource(LETTER_VIDEOS[selected.letter]).uri,
                  autoPlay: true,
                  loop: true,
                  muted: true,
                  playsInline: true,
                  onLoadedData: () => setVideoReady(true),
                  style: { width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'transparent' },
                })
              : (
                <Video
                  ref={videoRef}
                  source={LETTER_VIDEOS[selected.letter]}
                  style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  shouldPlay
                  isMuted
                  onReadyForDisplay={() => setVideoReady(true)}
                />
              ))}

            {!videoReady && (
              <View style={[styles.loadingOverlay, { backgroundColor: C.inputBg }]}>
                <View style={[styles.loadingPill, { backgroundColor: C.surface, shadowColor: C.primary }]}>
                  <ActivityIndicator size="small" color={C.primary} />
                  <Text style={[styles.loadingText, { color: C.primary }]}>{t('loading')}</Text>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.replayBtn,
              { backgroundColor: selAccent.bg, borderColor: selAccent.fg, opacity: videoReady ? 1 : 0.4 },
            ]}
            onPress={replayVideo}
            disabled={!videoReady}
            activeOpacity={0.75}
          >
            <Ionicons name="refresh" size={15} color={selAccent.fg} />
            <Text style={[styles.replayText, { color: selAccent.fg }]}>{t('alphabetRepeat')}</Text>
          </TouchableOpacity>

          <View style={[styles.tipRow, { borderLeftColor: selAccent.fg, backgroundColor: C.inputBg }]}>
            <View style={[styles.tipIcon, { backgroundColor: selAccent.fg }]}>
              <Ionicons name="hand-left" size={13} color="#fff" />
            </View>
            <Text style={[styles.tipText, { color: C.textPrimary }]} numberOfLines={2}>
              {selected ? t(`alphabetTip${selected.letter}` as TranslationKey) : ''}
            </Text>
          </View>

            <Text style={[styles.closeHint, { color: C.textSecondary }]}>{t('alphabetTouchOutside')}</Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray ?? '#F8F9FC' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: Colors.primaryBg ?? '#EDE9FE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },

  gridContent: { paddingHorizontal: 20 },
  gridRow: { gap: 10, marginBottom: 10 },

  letterCard: {
    alignItems: 'center',
    borderRadius: 16,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  letterBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 5,
  },
  letterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.50)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sheet: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 20,
    overflow: 'hidden',
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    paddingBottom: 16,
  },
  sheetLetterBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  sheetLetter: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 34,
  },
  sheetTitleBlock: { flex: 1 },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  replayText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  viewerWrap: {
    alignSelf: 'center',
    marginTop: 4,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#ECEEF5',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ECEEF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },

  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FC',
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  tipIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
    lineHeight: 19,
  },

  closeHint: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textSecondary,
    paddingVertical: 12,
  },
});
