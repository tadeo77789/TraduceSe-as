import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  useWindowDimensions,
  ListRenderItem,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AlphabetItem {
  letter: string;
  imageUrl: string;
  tip: string;
}

const TIPS: Record<string, string> = {
  A: 'Puño cerrado, pulgar al costado.',
  B: 'Dedos extendidos juntos, pulgar doblado.',
  C: 'Mano curva en forma de C.',
  D: 'Índice arriba, otros dedos curvados.',
  E: 'Dedos doblados, pulgar bajo.',
  F: 'Índice y pulgar tocándose.',
  G: 'Índice apunta al lado, pulgar paralelo.',
  H: 'Índice y medio extendidos juntos.',
  I: 'Meñique extendido, puño cerrado.',
  J: 'Meñique extendido, traza una J.',
  K: 'Índice arriba, medio diagonal, pulgar entre ellos.',
  L: 'Índice y pulgar formando una L.',
  M: 'Tres dedos sobre el pulgar.',
  N: 'Dos dedos sobre el pulgar.',
  O: 'Dedos y pulgar forman un círculo.',
  P: 'Como K pero apuntando hacia abajo.',
  Q: 'Como G pero apuntando hacia abajo.',
  R: 'Índice y medio cruzados.',
  S: 'Puño cerrado, pulgar sobre dedos.',
  T: 'Pulgar entre índice y medio.',
  U: 'Índice y medio juntos, extendidos.',
  V: 'Índice y medio en V.',
  W: 'Índice, medio y anular extendidos.',
  X: 'Índice doblado en gancho.',
  Y: 'Pulgar y meñique extendidos.',
  Z: 'Índice traza una Z en el aire.',
};

const ALPHABET: AlphabetItem[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => ({
  letter,
  imageUrl: `https://www.lifeprint.com/asl101/images-handshapes/${letter.toLowerCase()}.gif`,
  tip: TIPS[letter] ?? '',
}));

const keyExtractor = (item: AlphabetItem) => item.letter;
const getItemLayout = (_: unknown, index: number) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * Math.floor(index / COLS),
  index,
});

// Colores de acento por letra (ciclo de 5 colores)
const ACCENT_COLORS = [
  ['#EDE9FE', '#7C3AED'],
  ['#DBEAFE', '#2563EB'],
  ['#D1FAE5', '#059669'],
  ['#FEF3C7', '#D97706'],
  ['#FCE7F3', '#DB2777'],
];

export const AlphabetScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState<AlphabetItem | null>(null);

  const COLS = width >= 1024 ? 9 : width >= 768 ? 7 : 5;
  const PADDING = width >= 768 ? 48 : 40;
  const GAP = 10;
  const ITEM_SIZE = (width - PADDING - (COLS - 1) * GAP) / COLS;
  const ITEM_HEIGHT = ITEM_SIZE + 28;

  const handleSelect = useCallback((item: AlphabetItem) => setSelected(item), []);
  const handleClose = useCallback(() => setSelected(null), []);

  const getItemLayout = useCallback((_: unknown, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * Math.floor(index / COLS),
    index,
  }), [ITEM_HEIGHT, COLS]);

  const renderItem: ListRenderItem<AlphabetItem> = useCallback(({ item, index }) => {
    const [bgColor, accentColor] = ACCENT_COLORS[index % ACCENT_COLORS.length];
    return (
      <TouchableOpacity
        style={[styles.letterCard, { backgroundColor: bgColor, width: ITEM_SIZE, height: ITEM_HEIGHT }]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.75}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={[styles.handImage, { width: ITEM_SIZE - 10, height: ITEM_SIZE - 10 }]}
          resizeMode="contain"
        />
        <View style={[styles.letterBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.letterText}>{item.letter}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [handleSelect, ITEM_SIZE, ITEM_HEIGHT]);

  const selectedIndex = selected ? ALPHABET.findIndex(a => a.letter === selected.letter) : 0;
  const [modalBg, modalAccent] = ACCENT_COLORS[selectedIndex % ACCENT_COLORS.length];

  return (
    <View style={styles.root}>
      <AppHeader />
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Alfabeto LSC</Text>
            <Text style={styles.subtitle}>Lengua de Señas Colombiana</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>26 letras</Text>
          </View>
        </View>

        <FlatList
          data={ALPHABET}
          key={COLS}
          numColumns={COLS}
          keyExtractor={keyExtractor}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Modal detalle */}
      <Modal visible={!!selected} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={handleClose} activeOpacity={1}>
          <View style={styles.modalCard}>
            {/* Header del modal */}
            <LinearGradient colors={[modalBg, '#fff']} style={styles.modalHeader}>
              <View style={[styles.modalLetterBadge, { backgroundColor: modalAccent }]}>
                <Text style={styles.modalLetter}>{selected?.letter}</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={handleClose}>
                <Ionicons name="close" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </LinearGradient>

            {/* Imagen */}
            <Image
              source={{ uri: selected?.imageUrl }}
              style={styles.modalImage}
              resizeMode="contain"
            />

            {/* Tip */}
            <View style={styles.modalTipBox}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
              <Text style={styles.modalTip}>{selected?.tip}</Text>
            </View>

            <Text style={styles.modalHint}>Toca fuera para cerrar</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray },
  container: { flex: 1, padding: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  countBadge: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },

  grid: { paddingBottom: 24 },
  row: { gap: 10, marginBottom: 10 },
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
  handImage: {
    borderRadius: 10,
  },
  letterBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 5,
  },
  letterText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    width: 300,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 18,
  },
  modalLetterBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLetter: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
  modalTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 14,
    backgroundColor: Colors.primaryBg,
    borderRadius: 14,
  },
  modalTip: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  modalHint: {
    fontSize: 11,
    color: Colors.textHint,
    textAlign: 'center',
    paddingVertical: 18,
  },
});
