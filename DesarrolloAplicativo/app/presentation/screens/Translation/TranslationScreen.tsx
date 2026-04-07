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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { Button } from '../../components/common/Button';
import { Colors } from '../../../constants/colors';

type Mode = 'sena_texto' | 'texto_sena';

export const TranslationScreen: React.FC = () => {
  const [mode, setMode] = useState<Mode>('sena_texto');
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = useCallback(() => {
    if (mode === 'sena_texto') {
      setIsActive(prev => !prev);
    } else {
      if (!text.trim()) { Alert.alert('', 'Escribe algo para traducir'); return; }
      setLoading(true);
      // TODO: llamar al backend IA
      setTimeout(() => {
        setResult('Traducción simulada: ' + text);
        setLoading(false);
      }, 1200);
    }
  }, [mode, text]);

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Toggle Seña / Texto */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'sena_texto' && styles.toggleBtnActive]}
            onPress={() => { setMode('sena_texto'); setResult(''); setText(''); }}
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
            <Ionicons
              name="hand-left-outline"
              size={16}
              color={mode === 'sena_texto' ? '#fff' : Colors.textSecondary}
            />
            <Text style={[styles.toggleText, mode === 'sena_texto' && styles.toggleTextActive]}>
              Seña
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'texto_sena' && styles.toggleBtnActive]}
            onPress={() => { setMode('texto_sena'); setResult(''); setIsActive(false); }}
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
            <Ionicons
              name="text-outline"
              size={16}
              color={mode === 'texto_sena' ? '#fff' : Colors.textSecondary}
            />
            <Text style={[styles.toggleText, mode === 'texto_sena' && styles.toggleTextActive]}>
              Texto
            </Text>
          </TouchableOpacity>
        </View>

        {/* Área central */}
        <View style={styles.centerArea}>
          {/* Imagen / cámara */}
          <View style={styles.imageBox}>
            {isActive && (
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>EN VIVO</Text>
              </View>
            )}
            {mode === 'sena_texto' ? (
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400' }}
                style={styles.cameraImage}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={{ uri: 'https://img.freepik.com/free-vector/sign-language-concept-illustration_114360-7724.jpg?w=400' }}
                style={styles.cameraImage}
                resizeMode="cover"
              />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageOverlay}
            />
          </View>

          {/* Instrucciones o entrada */}
          {mode === 'sena_texto' ? (
            <View style={styles.instructionBox}>
              <View style={styles.instructionHeader}>
                <Ionicons name="information-circle" size={18} color={Colors.primary} />
                <Text style={styles.instructionTitle}>Cómo usar</Text>
              </View>
              <Text style={styles.instructionText}>
                Realiza las señas de forma clara y tranquila.{'\n\n'}
                Si la traducción no es exacta, intenta repetir la seña.
              </Text>
              <Text style={styles.instructionHighlight}>💜 La tecnología aprende contigo</Text>
            </View>
          ) : (
            <View style={styles.textInputArea}>
              <Text style={styles.inputLabel}>Escribe para traducir</Text>
              <TextInput
                style={styles.textArea}
                value={text}
                onChangeText={setText}
                placeholder="hola me llamo..."
                placeholderTextColor={Colors.textHint}
                multiline
              />
            </View>
          )}
        </View>

        {/* Resultado seña→texto */}
        {mode === 'sena_texto' && (
          <View style={styles.resultSection}>
            <Text style={styles.resultLabel}>Traducción detectada</Text>
            <View style={styles.resultBox}>
              <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} style={{ marginBottom: 6 }} />
              <Text style={styles.resultText}>{result || 'hola me llamo'}</Text>
            </View>
          </View>
        )}

        {/* Botón de acción */}
        <View style={styles.actionRow}>
          <Button
            title={
              mode === 'sena_texto'
                ? isActive ? '⏹ Detener' : '▶ Empezar'
                : 'Traducir'
            }
            onPress={handleAction}
            loading={loading}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 36 },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primaryLighter,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  toggleBtn: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    paddingVertical: 11,
    alignItems: 'center',
    gap: 7,
    overflow: 'hidden',
  },
  toggleBtnActive: {},
  toggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // Centro
  centerArea: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  imageBox: {
    width: 155,
    height: 185,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.inputBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  cameraImage: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  activeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(239,68,68,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activeDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff',
  },
  activeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  // Instrucciones
  instructionBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  instructionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  instructionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  instructionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  instructionHighlight: {
    marginTop: 12,
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Input texto
  textInputArea: { flex: 1 },
  inputLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  // Resultado
  resultSection: { marginBottom: 20 },
  resultLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resultBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.primaryLighter,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  resultText: { fontSize: 16, color: Colors.textPrimary, fontWeight: '500' },

  // Botón
  actionRow: { alignItems: 'flex-end' },
  actionBtn: { paddingHorizontal: 32 },
});
