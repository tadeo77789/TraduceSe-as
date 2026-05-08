// Archivo: app/presentation/screens/Translation/TranslationScreen.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';
import { useColors } from '../../../state/ThemeContext';
import { useTranslation } from '../../../i18n';
import { useSignAgent } from '../../../hooks/useSignAgent';
import type { SignAgentStatus } from '../../../types';

type Mode = 'sena_texto' | 'texto_sena';

export const TranslationScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const C = useColors();
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const {
    status: agentStatus,
    lastResult: agentLastResult,
    transcript: agentTranscript,
    start: agentStart,
    stop: agentStop,
    reset: agentReset,
  } = useSignAgent(cameraRef, { intervalMs: 1500, minConfidence: 0.7 });

  const TIPS = [
    { icon: 'hand-left-outline' as const, text: t('tip1') },
    { icon: 'sunny-outline' as const, text: t('tip2') },
    { icon: 'reload-outline' as const, text: t('tip3') },
  ];

  const [mode, setMode] = useState<Mode>('sena_texto');
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = useCallback(async () => {
    if (mode === 'sena_texto') {
      if (!isActive) {
        // Solicitar permiso de cámara si no está concedido
        if (!permission?.granted) {
          const res = await requestPermission();
          if (!res.granted) {
            if (Platform.OS === 'web') {
              alert(t('cameraPermissionMsg'));
            } else {
              Alert.alert(t('cameraPermissionTitle'), t('cameraPermissionMsg'));
            }
            return;
          }
        }
        setIsActive(true);
        agentReset();
        agentStart();
      } else {
        agentStop();
        setIsActive(false);
        setResult('');
      }
    } else {
      if (!text.trim()) { Alert.alert('', t('textEmptyAlert')); return; }
      setLoading(true);
      setTimeout(() => {
        setResult(t('translationResult') + text);
        setLoading(false);
      }, 1200);
    }
  }, [mode, text, isActive, permission, requestPermission, t, agentStart, agentStop, agentReset]);

  const switchMode = useCallback((m: Mode) => {
    setMode(m);
    setResult('');
    setText('');
    setIsActive(false);
    agentStop();
    agentReset();
  }, [agentStop, agentReset]);

  useEffect(() => () => { agentStop(); }, [agentStop]);

  const statusLabelKey: Record<SignAgentStatus, string> = {
    idle: 'tapStartCamera',
    starting: 'agentStarting',
    detecting: 'agentDetecting',
    low_confidence: 'agentLowConfidence',
    no_hands: 'agentNoHands',
    error: 'agentError',
  };

  const cameraStatusLabel = isActive
    ? t(statusLabelKey[agentStatus] as Parameters<typeof t>[0])
    : t('tapStartCamera');

  const signResult = mode === 'sena_texto' ? agentTranscript : result;
  const confidencePct = agentLastResult ? Math.round(agentLastResult.confidence * 100) : 0;

  const cameraGranted = permission?.granted ?? false;

  return (
    <View style={[styles.root, { backgroundColor: C.backgroundGray }]}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]} showsVerticalScrollIndicator={false}>
        <View style={[styles.innerWrapper, isTablet && styles.innerWrapperWide]}>

          {/* ── Toggle de modo ── */}
          <View style={[styles.modeToggle, { backgroundColor: C.surface, borderColor: C.border, shadowColor: C.primary }]}>
            <TouchableOpacity style={[styles.modeBtn, mode === 'sena_texto' && styles.modeBtnActive]} onPress={() => switchMode('sena_texto')} activeOpacity={0.8}>
              {mode === 'sena_texto' && (
                <LinearGradient colors={[C.primary + 'EE', C.primary]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              )}
              <Ionicons name="hand-left-outline" size={18} color={mode === 'sena_texto' ? '#fff' : C.textSecondary} />
              <Text style={[styles.modeBtnText, mode === 'sena_texto' && styles.modeBtnTextActive]}>{t('modeCamera')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modeBtn, mode === 'texto_sena' && styles.modeBtnActive]} onPress={() => switchMode('texto_sena')} activeOpacity={0.8}>
              {mode === 'texto_sena' && (
                <LinearGradient colors={[C.primary + 'EE', C.primary]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              )}
              <Ionicons name="text-outline" size={18} color={mode === 'texto_sena' ? '#fff' : C.textSecondary} />
              <Text style={[styles.modeBtnText, mode === 'texto_sena' && styles.modeBtnTextActive]}>{t('modeText')}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Área de cámara / entrada ── */}
          {mode === 'sena_texto' ? (
            <View style={[styles.cameraCard, { shadowColor: C.primary }]}>
              {/* Badge EN VIVO */}
              {isActive && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>{t('live')}</Text>
                </View>
              )}

              {/* Cámara real o placeholder */}
              {isActive && cameraGranted ? (
                <CameraView ref={cameraRef} style={styles.cameraImage} facing="front" />
              ) : (
                <Image
                  source={require('../../../assets/images/camera_placeholder.jpg')}
                  style={styles.cameraImage}
                  resizeMode="cover"
                />
              )}

              {/* Overlay degradado */}
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={styles.cameraOverlay} />

              {/* Marco de detección */}
              <View style={styles.detectionFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>

              {/* Label inferior */}
              <View style={styles.cameraLabel}>
                <Ionicons name="camera-outline" size={14} color="#fff" />
                <Text style={styles.cameraLabelText}>{cameraStatusLabel}</Text>
                {isActive && agentLastResult && agentLastResult.confidence > 0 && (
                  <Text style={styles.cameraConfidence}>· {confidencePct}%</Text>
                )}
              </View>
            </View>
          ) : (
            <View style={[styles.inputCard, { backgroundColor: C.surface }]}>
              <View style={styles.inputCardHeader}>
                <Ionicons name="create-outline" size={16} color={C.primary} />
                <Text style={[styles.inputCardTitle, { color: C.textPrimary }]}>{t('writeTextLabel')}</Text>
              </View>
              <TextInput
                style={[styles.textArea, { color: C.textPrimary, backgroundColor: C.backgroundGray, borderColor: C.border }]}
                value={text}
                onChangeText={setText}
                placeholder={t('textPlaceholder')}
                placeholderTextColor={C.textHint}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.charCount}>
                <Text style={[styles.charCountText, { color: C.textHint }]}>{text.length} {t('characters')}</Text>
              </View>
            </View>
          )}

          {/* ── Tips (solo modo seña) ── */}
          {mode === 'sena_texto' && (
            <View style={styles.tipsRow}>
              {TIPS.map((tip, i) => (
                <View key={i} style={[styles.tipChip, { backgroundColor: C.primaryBg }]}>
                  <Ionicons name={tip.icon} size={13} color={C.primary} />
                  <Text style={[styles.tipText, { color: C.primary }]}>{tip.text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Resultado ── */}
          <View style={[styles.resultCard, { backgroundColor: C.surface, borderColor: C.border, shadowColor: C.primary }]}>
            <View style={[styles.resultHeader, { borderBottomColor: C.border }]}>
              <LinearGradient colors={[C.primaryBg, C.primaryBg]} style={styles.resultIconBg}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={C.primary} />
              </LinearGradient>
              <Text style={[styles.resultTitle, { color: C.textPrimary }]}>{t('sectionTranslation')}</Text>
              {signResult ? (
                <View style={styles.detectedBadge}>
                  <View style={styles.detectedDot} />
                  <Text style={styles.detectedText}>{t('done')}</Text>
                </View>
              ) : (
                <View style={[styles.waitingBadge, { backgroundColor: C.inputBg }]}>
                  <Text style={[styles.waitingText, { color: C.textHint }]}>{t('waiting')}</Text>
                </View>
              )}
            </View>
            <View style={styles.resultBody}>
              {signResult ? (
                <>
                  <Text style={[styles.resultText, { color: C.textPrimary }]}>{signResult}</Text>
                  <View style={styles.resultActions}>
                    <TouchableOpacity
                      style={[styles.copyBtn, { backgroundColor: C.primaryBg }]}
                      onPress={() => Alert.alert(t('copied'), t('copiedToClipboard'))}
                    >
                      <Ionicons name="copy-outline" size={14} color={C.primary} />
                      <Text style={[styles.copyBtnText, { color: C.primary }]}>{t('copy')}</Text>
                    </TouchableOpacity>
                    {mode === 'sena_texto' && (
                      <TouchableOpacity
                        style={[styles.copyBtn, { backgroundColor: C.inputBg }]}
                        onPress={agentReset}
                      >
                        <Ionicons name="trash-outline" size={14} color={C.textSecondary} />
                        <Text style={[styles.copyBtnText, { color: C.textSecondary }]}>{t('agentClear')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.resultEmpty}>
                  <Ionicons name="scan-outline" size={32} color={C.primaryLighter} />
                  <Text style={[styles.resultEmptyText, { color: C.textHint }]}>
                    {mode === 'sena_texto'
                      ? t('resultPlaceholderSigns')
                      : t('resultPlaceholderText')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Botón principal ── */}
          <TouchableOpacity onPress={handleAction} activeOpacity={0.85} disabled={loading} style={[styles.actionBtnWrapper, { shadowColor: C.primary }]}>
            <LinearGradient
              colors={isActive ? ['#DC2626', '#B91C1C'] : [C.primary + 'EE', C.primary, C.primaryDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.actionBtn}
            >
              {loading ? (
                <Text style={styles.actionBtnText}>{t('translating')}</Text>
              ) : mode === 'sena_texto' ? (
                <>
                  <Ionicons name={isActive ? 'stop-circle-outline' : 'play-circle-outline'} size={22} color="#fff" />
                  <Text style={styles.actionBtnText}>{isActive ? t('stopCamera') : t('startCamera')}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="language-outline" size={22} color="#fff" />
                  <Text style={styles.actionBtnText}>{t('translate')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
};

const CORNER_SIZE = 20;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40, alignItems: 'center' },
  contentDesktop: { paddingHorizontal: 48, paddingVertical: 32 },
  innerWrapper: { width: '100%', gap: 18 },
  innerWrapperWide: { maxWidth: 760, alignSelf: 'center' },

  // Toggle
  modeToggle: { flexDirection: 'row', borderRadius: 18, borderWidth: 1.5, overflow: 'hidden', alignSelf: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  modeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, paddingHorizontal: 24, gap: 8, overflow: 'hidden' },
  modeBtnActive: {},
  modeBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  modeBtnTextActive: { color: '#fff' },

  // Cámara
  cameraCard: { width: '100%', height: 280, borderRadius: 24, overflow: 'hidden', backgroundColor: '#1a1a2e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
  cameraImage: { width: '100%', height: '100%' },
  cameraOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  liveBadge: { position: 'absolute', top: 14, left: 14, zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(220,38,38,0.9)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  detectionFrame: { position: 'absolute', top: '20%', left: '25%', right: '25%', bottom: '25%', zIndex: 5 },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: 'rgba(255,255,255,0.85)' },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderBottomRightRadius: 4 },
  cameraLabel: { position: 'absolute', bottom: 14, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 10 },
  cameraLabelText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '500' },
  cameraConfidence: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700' },

  // Input card
  inputCard: { borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  inputCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  inputCardTitle: { fontSize: 15, fontWeight: '700' },
  textArea: { fontSize: 15, minHeight: 120, borderRadius: 14, padding: 14, borderWidth: 1, lineHeight: 23 },
  charCount: { alignItems: 'flex-end', marginTop: 10 },
  charCountText: { fontSize: 11 },

  // Tips
  tipsRow: { gap: 10 },
  tipChip: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  tipText: { fontSize: 13, fontWeight: '500', flex: 1, lineHeight: 19 },

  // Resultado
  resultCard: { borderRadius: 24, overflow: 'hidden', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5, borderWidth: 1.5 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1 },
  resultIconBg: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { flex: 1, fontSize: 15, fontWeight: '700' },
  detectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  detectedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#059669' },
  detectedText: { fontSize: 11, color: '#059669', fontWeight: '700' },
  waitingBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  waitingText: { fontSize: 11, fontWeight: '600' },
  resultBody: { padding: 18, minHeight: 96 },
  resultText: { fontSize: 17, fontWeight: '600', lineHeight: 27 },
  resultActions: { flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  copyBtnText: { fontSize: 13, fontWeight: '600' },
  resultEmpty: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 12 },
  resultEmptyText: { fontSize: 13, textAlign: 'center', lineHeight: 21, maxWidth: 240 },

  // Botón principal
  actionBtnWrapper: { borderRadius: 20, overflow: 'hidden', alignSelf: 'stretch', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 36, gap: 10, borderRadius: 20 },
  actionBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
});
