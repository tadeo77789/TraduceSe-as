
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from '../../../shared/components/common/AppHeader';
import { useColors } from '../../../app/providers/ThemeContext';
import { useTranslation } from '../../../app/config/i18n';
import { useSignAgent } from '../../Translation/hooks/useSignAgent';
import {
  recordSample,
  getSampleCounts,
  clearTrainingData,
  beginGestureCapture,
  recordGesture,
  getGestureCounts,
  clearGestureLabel,
} from '../../../feature/Translation/services/vision';
import { showInfo, showError, showConfirm } from '../../../shared/utils/dialogs';
import type { AdminStackParams } from '../../../app/routes/AdminStackNavigator';

type Nav = NativeStackNavigationProp<AdminStackParams, 'Training'>;

const ALPHABET_LSC = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'H', 'I', 'J', 'K', 'L', 'M', 'N',
  'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z', '5',
];

export const AdminTrainingScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const C = useColors();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const {
    status: agentStatus,
    lastResult: agentLastResult,
    start: agentStart,
    stop: agentStop,
  } = useSignAgent(cameraRef, { intervalMs: 1500, minConfidence: 0.7 });

  const [isActive, setIsActive] = useState(false);
  const [sampleCounts, setSampleCounts] = useState<Record<string, number>>({});
  const [gestureWord, setGestureWord] = useState('');
  const [gestureCounts, setGestureCounts] = useState<Record<string, number>>({});
  const [recordingGesture, setRecordingGesture] = useState(false);

  const refreshCounts = useCallback(async () => {
    setSampleCounts(await getSampleCounts());
    setGestureCounts(await getGestureCounts());
  }, []);

  useEffect(() => { refreshCounts(); }, [refreshCounts]);
  useEffect(() => () => { agentStop(); }, [agentStop]);

  const startCamera = useCallback(async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        showError(t('cameraPermissionMsg'), t('cameraPermissionTitle'));
        return;
      }
    }
    setIsActive(true);
    agentStart();
  }, [permission, requestPermission, t, agentStart]);

  const stopCamera = useCallback(() => {
    agentStop();
    setIsActive(false);
  }, [agentStop]);

  const handleRecordSample = useCallback(async (label: string) => {
    const features = agentLastResult?.features;
    if (!features || features.length === 0) {
      showInfo(t('trainNoHand'));
      return;
    }
    await recordSample(label, features);
    await refreshCounts();
  }, [t, refreshCounts, agentLastResult]);

  const GESTURE_CAPTURE_MS = 2400;

  const handleRecordGesture = useCallback(async () => {
    const label = gestureWord.trim().toUpperCase();
    if (!label) {
      showInfo(t('trainGestureNeedLabel'));
      return;
    }
    if (!isActive) {
      showInfo(t('tapStartCamera'));
      return;
    }
    setRecordingGesture(true);
    beginGestureCapture();
    await new Promise(resolve => setTimeout(resolve, GESTURE_CAPTURE_MS));
    const ok = await recordGesture(label);
    setRecordingGesture(false);
    if (!ok) {
      showError(t('trainGestureNoMotion'));
      return;
    }
    await refreshCounts();
    showInfo(t('trainGestureSaved').replace('{label}', label));
  }, [gestureWord, isActive, t, refreshCounts]);

  const handleDeleteGesture = useCallback(async (label: string) => {
    const ok = await showConfirm({
      title: t('trainGestureDeleteTitle'),
      message: t('trainGestureDeleteConfirm').replace('{label}', label),
      icon: 'warning',
      confirmText: t('trainConfirmDelete'),
      cancelText: t('cancel'),
      destructive: true,
    });
    if (!ok) return;
    await clearGestureLabel(label);
    await refreshCounts();
  }, [t, refreshCounts]);

  const handleClearTraining = useCallback(async () => {
    const total = Object.values(sampleCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return;

    const firstOk = await showConfirm({
      title: t('trainClearAll'),
      message: t('trainClearConfirm'),
      icon: 'warning',
      confirmText: t('trainContinue'),
      cancelText: t('cancel'),
      destructive: true,
    });
    if (!firstOk) return;

    const secondOk = await showConfirm({
      title: t('trainClearAll'),
      message: t('trainClearConfirmSecond').replace('{count}', String(total)),
      icon: 'warning',
      confirmText: t('trainConfirmDelete'),
      cancelText: t('cancel'),
      destructive: true,
    });
    if (!secondOk) return;

    await clearTrainingData();
    await refreshCounts();
  }, [sampleCounts, t, refreshCounts]);

  const cameraGranted = permission?.granted ?? false;
  const totalSamples = Object.values(sampleCounts).reduce((a, b) => a + b, 0);
  const lettersTrained = Object.keys(sampleCounts).filter(k => sampleCounts[k] > 0).length;

  const STATUS_LABEL: Record<string, string> = {
    idle: t('tapStartCamera'),
    starting: t('agentStarting'),
    detecting: t('agentDetecting'),
    low_confidence: t('agentLowConfidence'),
    no_hands: t('agentNoHands'),
    error: t('agentError'),
  };

  return (
    <View style={[styles.root, { backgroundColor: C.backgroundGray }]}>
      <AppHeader showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
        <View style={[styles.inner, isTablet && styles.innerWide]}>

          {Platform.OS === 'web' && (
            <TouchableOpacity
              style={[styles.backRow, { backgroundColor: C.surface, borderColor: C.border }]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color={C.primary} />
              <Text style={[styles.backText, { color: C.primary }]}>{t('adminBack')}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[styles.metricValue, { color: C.primary }]}>{totalSamples}</Text>
              <Text style={[styles.metricLabel, { color: C.textSecondary }]}>{t('trainTotalSamples')}</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[styles.metricValue, { color: C.primary }]}>{lettersTrained}/{ALPHABET_LSC.length}</Text>
              <Text style={[styles.metricLabel, { color: C.textSecondary }]}>{t('trainLettersCovered')}</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[styles.metricValue, { color: C.primary }]}>
                {agentLastResult?.text || '—'}
              </Text>
              <Text style={[styles.metricLabel, { color: C.textSecondary }]}>{t('trainLastDetected')}</Text>
            </View>
          </View>

          <View style={[styles.cameraCard, { shadowColor: C.primary }]}>
            {isActive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>{t('live')}</Text>
              </View>
            )}
            {isActive && cameraGranted ? (
              <CameraView ref={cameraRef} style={styles.cameraImage} facing="front" />
            ) : (
              <Image
                source={require('../../../assets/images/camera_placeholder.jpg')}
                style={styles.cameraImage}
                resizeMode="cover"
              />
            )}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={styles.cameraOverlay} />
            <View style={styles.cameraLabel}>
              <Ionicons name="camera-outline" size={14} color="#fff" />
              <Text style={styles.cameraLabelText}>
                {isActive ? STATUS_LABEL[agentStatus] : t('tapStartCamera')}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={isActive ? stopCamera : startCamera} activeOpacity={0.85} style={[styles.actionBtnWrapper, { shadowColor: C.primary }]}>
            <LinearGradient
              colors={isActive ? ['#DC2626', '#B91C1C'] : [C.primary + 'EE', C.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.actionBtn}
            >
              <Ionicons name={isActive ? 'stop-circle-outline' : 'play-circle-outline'} size={22} color="#fff" />
              <Text style={styles.actionBtnText}>{isActive ? t('stopCamera') : t('startCamera')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={[styles.trainPanel, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={styles.trainHeader}>
              <Ionicons name="school" size={18} color={C.primary} />
              <Text style={[styles.trainTitle, { color: C.textPrimary }]}>{t('trainTitle')}</Text>
            </View>
            <Text style={[styles.trainHintText, { color: C.textSecondary }]}>{t('trainHint')}</Text>

            <View style={styles.alphabetGrid}>
              {ALPHABET_LSC.map(letter => {
                const count = sampleCounts[letter] ?? 0;
                const trained = count > 0;
                return (
                  <TouchableOpacity
                    key={letter}
                    style={[
                      styles.letterBtn,
                      {
                        backgroundColor: trained ? C.primaryBg : C.backgroundGray,
                        borderColor: trained ? C.primary : C.border,
                        opacity: isActive ? 1 : 0.5,
                      },
                    ]}
                    onPress={() => handleRecordSample(letter)}
                    activeOpacity={0.7}
                    disabled={!isActive}
                  >
                    <Text style={[styles.letterBtnText, { color: trained ? C.primary : C.textPrimary }]}>{letter}</Text>
                    {count > 0 && (
                      <View style={[styles.letterCountBadge, { backgroundColor: C.primary }]}>
                        <Text style={styles.letterCountText}>{count}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.clearBtn, { borderColor: '#DC2626' }]}
              onPress={handleClearTraining}
              activeOpacity={0.85}
              disabled={totalSamples === 0}
            >
              <Ionicons name="trash-outline" size={14} color="#DC2626" />
              <Text style={styles.clearBtnText}>{t('trainClearAll')}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.trainPanel, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={styles.trainHeader}>
              <Ionicons name="hand-right" size={18} color={C.primary} />
              <Text style={[styles.trainTitle, { color: C.textPrimary }]}>{t('trainGestureTitle')}</Text>
            </View>
            <Text style={[styles.trainHintText, { color: C.textSecondary }]}>{t('trainGestureHint')}</Text>

            <View style={styles.gestureRow}>
              <TextInput
                style={[styles.gestureInput, { backgroundColor: C.backgroundGray, borderColor: C.border, color: C.textPrimary }]}
                placeholder={t('trainGesturePlaceholder')}
                placeholderTextColor={C.textHint}
                value={gestureWord}
                onChangeText={setGestureWord}
                autoCapitalize="characters"
                editable={!recordingGesture}
              />
              <TouchableOpacity
                style={[
                  styles.gestureRecordBtn,
                  { backgroundColor: recordingGesture ? '#DC2626' : C.primary, opacity: isActive ? 1 : 0.5 },
                ]}
                onPress={handleRecordGesture}
                activeOpacity={0.85}
                disabled={!isActive || recordingGesture}
              >
                <Ionicons name={recordingGesture ? 'radio-button-on' : 'videocam-outline'} size={16} color="#fff" />
                <Text style={styles.gestureRecordText}>
                  {recordingGesture ? t('trainGestureRecording') : t('trainGestureRecord')}
                </Text>
              </TouchableOpacity>
            </View>

            {Object.keys(gestureCounts).length > 0 && (
              <View style={styles.gestureList}>
                {Object.entries(gestureCounts).map(([label, count]) => (
                  <View key={label} style={[styles.gestureChip, { backgroundColor: C.primaryBg, borderColor: C.primary }]}>
                    <Text style={[styles.gestureChipText, { color: C.primary }]}>{label} × {count}</Text>
                    <TouchableOpacity onPress={() => handleDeleteGesture(label)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Ionicons name="close-circle" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40, alignItems: 'center' },
  contentDesktop: { paddingHorizontal: 48, paddingVertical: 32 },
  inner: { width: '100%', gap: 18 },
  innerWide: { maxWidth: 760, alignSelf: 'center' },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignSelf: 'flex-start' },
  backText: { fontSize: 14, fontWeight: '700' },

  metricsRow: { flexDirection: 'row', gap: 10 },
  metricCard: { flex: 1, padding: 14, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', gap: 4 },
  metricValue: { fontSize: 22, fontWeight: '800' },
  metricLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  cameraCard: { width: '100%', height: 240, borderRadius: 24, overflow: 'hidden', backgroundColor: '#1a1a2e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
  cameraImage: { width: '100%', height: '100%' },
  cameraOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  liveBadge: { position: 'absolute', top: 14, left: 14, zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(220,38,38,0.9)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  cameraLabel: { position: 'absolute', bottom: 14, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 10 },
  cameraLabelText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '500' },

  actionBtnWrapper: { borderRadius: 18, overflow: 'hidden', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 28, gap: 10, borderRadius: 18 },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },

  trainPanel: { borderRadius: 20, padding: 16, borderWidth: 1.5, gap: 14 },
  trainHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trainTitle: { fontSize: 15, fontWeight: '700' },
  trainHintText: { fontSize: 12, lineHeight: 17 },
  alphabetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  letterBtn: { width: 42, height: 42, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  letterBtnText: { fontSize: 15, fontWeight: '800' },
  letterCountBadge: { position: 'absolute', top: -5, right: -5, minWidth: 16, height: 16, paddingHorizontal: 4, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  letterCountText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed' },
  clearBtnText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },

  gestureRow: { flexDirection: 'row', gap: 8 },
  gestureInput: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontWeight: '600' },
  gestureRecordBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 14, borderRadius: 12 },
  gestureRecordText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  gestureList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  gestureChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  gestureChipText: { fontSize: 12, fontWeight: '700' },
});
