import React, { useState } from 'react';
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

  const handleAction = () => {
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
  };

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Toggle Seña / Texto */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'sena_texto' && styles.toggleActive]}
            onPress={() => { setMode('sena_texto'); setResult(''); setText(''); }}
          >
            {mode === 'sena_texto' && (
              <Text style={styles.checkMark}>✓ </Text>
            )}
            <Text style={[styles.toggleText, mode === 'sena_texto' && styles.toggleTextActive]}>
              Seña
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'texto_sena' && styles.toggleActive]}
            onPress={() => { setMode('texto_sena'); setResult(''); setIsActive(false); }}
          >
            {mode === 'texto_sena' && (
              <Text style={styles.checkMark}>✓ </Text>
            )}
            <Text style={[styles.toggleText, mode === 'texto_sena' && styles.toggleTextActive]}>
              Texto
            </Text>
          </TouchableOpacity>
        </View>

        {/* Área central */}
        <View style={styles.centerArea}>
          {/* Imagen / cámara */}
          <View style={styles.imageBox}>
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
          </View>

          {/* Instrucciones o entrada */}
          {mode === 'sena_texto' ? (
            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>
                Recuerda realizar las señas de forma clara y tranquila. Si la traducción no es
                exacta, intenta repetir la seña.{'\n'}
                <Text style={styles.instructionHighlight}>La tecnología aprende contigo 💜</Text>
              </Text>
            </View>
          ) : (
            <View style={styles.textInputArea}>
              <Text style={styles.inputLabel}>Escribe lo que quieras traducir.</Text>
              <TextInput
                style={styles.textArea}
                value={text}
                onChangeText={setText}
                placeholder="hola me llamo"
                placeholderTextColor={Colors.textHint}
                multiline
              />
            </View>
          )}
        </View>

        {/* Resultado seña→texto */}
        {mode === 'sena_texto' && (
          <View style={styles.resultSection}>
            <Text style={styles.resultLabel}>El mensaje es:</Text>
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{result || 'hola me llamo'}</Text>
            </View>
          </View>
        )}

        {/* Botón de acción */}
        <View style={styles.actionRow}>
          <Button
            title={
              mode === 'sena_texto'
                ? isActive ? 'Detener' : 'Empezar'
                : 'traducir'
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
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.primaryLighter,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  toggleBtn: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 9,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.primaryBg,
  },
  checkMark: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  toggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Centro
  centerArea: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  imageBox: {
    width: 160,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.inputBg,
  },
  cameraImage: { width: '100%', height: '100%' },

  // Instrucciones
  instructionBox: { flex: 1, justifyContent: 'center' },
  instructionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  instructionHighlight: { color: Colors.primary, fontWeight: '600' },

  // Input texto
  textInputArea: { flex: 1 },
  inputLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  textArea: {
    backgroundColor: Colors.inputBg,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Resultado
  resultSection: { marginBottom: 20 },
  resultLabel: { fontSize: 14, color: Colors.textPrimary, marginBottom: 8 },
  resultBox: {
    backgroundColor: Colors.inputBg,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultText: { fontSize: 15, color: Colors.textPrimary },

  // Botón
  actionRow: { alignItems: 'flex-end' },
  actionBtn: { paddingHorizontal: 28 },
});
