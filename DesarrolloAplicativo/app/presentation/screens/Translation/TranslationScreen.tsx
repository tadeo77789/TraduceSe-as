/**
 * @file TranslationScreen.tsx
 * @description Pantalla principal de traducción de señas.
 *
 * Permite alternar entre dos modos:
 * - **Seña → Texto** (`sena_texto`): activa la cámara para detectar señas en tiempo real.
 *   Muestra un marco de detección y badge "EN VIVO".
 * - **Texto → Seña** (`texto_sena`): campo de texto donde el usuario escribe y
 *   obtiene la traducción correspondiente.
 *
 * La cámara usa una imagen placeholder (`camera_placeholder.jpg`) hasta que se integre
 * el módulo real de IA. La traducción también es simulada con un `setTimeout`.
 *
 * El layout se adapta a tablet (≥ 768 px) y desktop (≥ 1024 px) con ancho máximo de 760 px.
 *
 * @todo Integrar la cámara real con el módulo de reconocimiento de señas por IA.
 * @todo Conectar con `ENDPOINTS.translate` para traducciones reales.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';

type Mode = 'sena_texto' | 'texto_sena';

const TIPS = [
  { icon: 'hand-left-outline' as const, text: 'Mantén la mano centrada en cámara' },
  { icon: 'sunny-outline' as const, text: 'Asegura buena iluminación' },
  { icon: 'reload-outline' as const, text: 'Repite la seña si no es detectada' },
];

export const TranslationScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const [mode, setMode] = useState<Mode>('sena_texto');
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = useCallback(() => {
    if (mode === 'sena_texto') {
      setIsActive(prev => !prev);
      if (isActive) setResult('');
    } else {
      if (!text.trim()) { Alert.alert('', 'Escribe algo para traducir'); return; }
      setLoading(true);
      setTimeout(() => {
        setResult('Traducción simulada: ' + text);
        setLoading(false);
      }, 1200);
    }
  }, [mode, text, isActive]);

  const switchMode = useCallback((m: Mode) => {
    setMode(m);
    setResult('');
    setText('');
    setIsActive(false);
  }, []);

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.innerWrapper, isTablet && styles.innerWrapperWide]}>

        {/* ── Toggle de modo ── */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'sena_texto' && styles.modeBtnActive]}
            onPress={() => switchMode('sena_texto')}
            activeOpacity={0.8}
          >
            {mode === 'sena_texto' && (
              <LinearGradient
                colors={['#9333EA', '#7C3AED']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            )}
            <Ionicons name="hand-left-outline" size={18} color={mode === 'sena_texto' ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.modeBtnText, mode === 'sena_texto' && styles.modeBtnTextActive]}>
              Seña → Texto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, mode === 'texto_sena' && styles.modeBtnActive]}
            onPress={() => switchMode('texto_sena')}
            activeOpacity={0.8}
          >
            {mode === 'texto_sena' && (
              <LinearGradient
                colors={['#9333EA', '#7C3AED']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            )}
            <Ionicons name="text-outline" size={18} color={mode === 'texto_sena' ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.modeBtnText, mode === 'texto_sena' && styles.modeBtnTextActive]}>
              Texto → Seña
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Área de cámara / entrada ── */}
        {mode === 'sena_texto' ? (
          <View style={styles.cameraCard}>
            {/* Badge EN VIVO */}
            {isActive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>EN VIVO</Text>
              </View>
            )}

            {/* Imagen de cámara */}
            <Image
              source={require('../../../assets/images/camera_placeholder.jpg')}
              style={styles.cameraImage}
              resizeMode="cover"
            />

            {/* Overlay degradado */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.55)']}
              style={styles.cameraOverlay}
            />

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
              <Text style={styles.cameraLabelText}>
                {isActive ? 'Analizando señas...' : 'Toca Iniciar para activar la cámara'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.inputCard}>
            <View style={styles.inputCardHeader}>
              <Ionicons name="create-outline" size={16} color={Colors.primary} />
              <Text style={styles.inputCardTitle}>Escribe el texto a traducir</Text>
            </View>
            <TextInput
              style={styles.textArea}
              value={text}
              onChangeText={setText}
              placeholder="Ej: Hola, ¿cómo estás?"
              placeholderTextColor={Colors.textHint}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.charCount}>
              <Text style={styles.charCountText}>{text.length} caracteres</Text>
            </View>
          </View>
        )}

        {/* ── Tips (solo modo seña) ── */}
        {mode === 'sena_texto' && (
          <View style={styles.tipsRow}>
            {TIPS.map((tip, i) => (
              <View key={i} style={styles.tipChip}>
                <Ionicons name={tip.icon} size={13} color={Colors.primary} />
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Resultado ── */}
        <View style={styles.resultCard}>
          {/* Header del resultado */}
          <View style={styles.resultHeader}>
            <LinearGradient colors={['#EDE9FE', '#DDD6FE']} style={styles.resultIconBg}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.primary} />
            </LinearGradient>
            <Text style={styles.resultTitle}>Traducción</Text>
            {result ? (
              <View style={styles.detectedBadge}>
                <View style={styles.detectedDot} />
                <Text style={styles.detectedText}>Listo</Text>
              </View>
            ) : (
              <View style={styles.waitingBadge}>
                <Text style={styles.waitingText}>En espera</Text>
              </View>
            )}
          </View>

          {/* Contenido */}
          <View style={styles.resultBody}>
            {result ? (
              <>
                <Text style={styles.resultText}>{result}</Text>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => Alert.alert('Copiado', 'Texto copiado al portapapeles')}
                >
                  <Ionicons name="copy-outline" size={14} color={Colors.primary} />
                  <Text style={styles.copyBtnText}>Copiar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.resultEmpty}>
                <Ionicons name="scan-outline" size={32} color={Colors.primaryLighter} />
                <Text style={styles.resultEmptyText}>
                  {mode === 'sena_texto'
                    ? 'La traducción aparecerá aquí al detectar una seña'
                    : 'Escribe un texto y toca Traducir'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Botón principal ── */}
        <TouchableOpacity
          onPress={handleAction}
          activeOpacity={0.85}
          disabled={loading}
          style={styles.actionBtnWrapper}
        >
          <LinearGradient
            colors={isActive ? ['#DC2626', '#B91C1C'] : ['#9333EA', '#7C3AED', '#6D28D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionBtn}
          >
            {loading ? (
              <Text style={styles.actionBtnText}>Traduciendo...</Text>
            ) : mode === 'sena_texto' ? (
              <>
                <Ionicons name={isActive ? 'stop-circle-outline' : 'play-circle-outline'} size={22} color="#fff" />
                <Text style={styles.actionBtnText}>{isActive ? 'Detener' : 'Iniciar traducción'}</Text>
              </>
            ) : (
              <>
                <Ionicons name="language-outline" size={22} color="#fff" />
                <Text style={styles.actionBtnText}>Traducir a señas</Text>
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

  // ── Toggle ──
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.primaryLighter,
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 24,
    gap: 8,
    overflow: 'hidden',
  },
  modeBtnActive: {},
  modeBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  modeBtnTextActive: { color: '#fff' },

  // ── Cámara ──
  cameraCard: {
    width: '100%',
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  cameraImage: { width: '100%', height: '100%' },
  cameraOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
  },
  liveBadge: {
    position: 'absolute', top: 14, left: 14, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(220,38,38,0.9)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  // Marco de detección
  detectionFrame: {
    position: 'absolute',
    top: '20%', left: '25%', right: '25%', bottom: '25%',
    zIndex: 5,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderBottomRightRadius: 4 },

  cameraLabel: {
    position: 'absolute', bottom: 14, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 10,
  },
  cameraLabelText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '500' },

  // ── Input card ──
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  inputCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14,
  },
  inputCardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  textArea: {
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 120,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    lineHeight: 23,
  },
  charCount: { alignItems: 'flex-end', marginTop: 10 },
  charCountText: { fontSize: 11, color: Colors.textHint },

  // ── Tips ──
  tipsRow: { gap: 10 },
  tipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  tipText: { fontSize: 13, color: Colors.primary, fontWeight: '500', flex: 1, lineHeight: 19 },

  // ── Resultado ──
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: Colors.primaryLighter,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultIconBg: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  resultTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  detectedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  detectedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#059669' },
  detectedText: { fontSize: 11, color: '#059669', fontWeight: '700' },
  waitingBadge: {
    backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  waitingText: { fontSize: 11, color: Colors.textHint, fontWeight: '600' },
  resultBody: { padding: 18, minHeight: 96 },
  resultText: { fontSize: 17, color: Colors.textPrimary, fontWeight: '600', lineHeight: 27 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', marginTop: 14,
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  copyBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  resultEmpty: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 12 },
  resultEmptyText: {
    fontSize: 13, color: Colors.textHint, textAlign: 'center', lineHeight: 21, maxWidth: 240,
  },

  // ── Botón principal ──
  actionBtnWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'stretch',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 36,
    gap: 10,
    borderRadius: 20,
  },
  actionBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
});
