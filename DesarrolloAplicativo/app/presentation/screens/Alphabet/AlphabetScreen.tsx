import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ListRenderItem,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';

const { width } = Dimensions.get('window');
const COLS = 5;
const ITEM_SIZE = (width - 32 - (COLS - 1) * 10) / COLS;
const ITEM_HEIGHT = ITEM_SIZE + 24;

interface AlphabetItem {
  letter: string;
  imageUrl: string;
}

// Datos estáticos fuera del componente para no recrearse en cada render
const ALPHABET: AlphabetItem[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => ({
  letter,
  imageUrl: `https://www.lifeprint.com/asl101/images-handshapes/${letter.toLowerCase()}.gif`,
}));

const keyExtractor = (item: AlphabetItem) => item.letter;
const getItemLayout = (_: unknown, index: number) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * Math.floor(index / COLS),
  index,
});

export const AlphabetScreen: React.FC = () => {
  const [selected, setSelected] = useState<AlphabetItem | null>(null);

  const handleSelect = useCallback((item: AlphabetItem) => {
    setSelected(item);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  const renderItem: ListRenderItem<AlphabetItem> = useCallback(({ item }) => (
    <TouchableOpacity style={styles.letterCard} onPress={() => handleSelect(item)}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.handImage}
        resizeMode="contain"
      />
      <View style={styles.letterBadge}>
        <Text style={styles.letterText}>{item.letter}</Text>
      </View>
    </TouchableOpacity>
  ), [handleSelect]);

  return (
    <View style={styles.root}>
      <AppHeader />
      <View style={styles.container}>
        <Text style={styles.title}>Alfabeto de Señas</Text>

        <FlatList
          data={ALPHABET}
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
        />
      </View>

      {/* Modal detalle */}
      <Modal visible={!!selected} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={handleClose}>
          <View style={styles.modalCard}>
            <Text style={styles.modalLetter}>{selected?.letter}</Text>
            <Image
              source={{ uri: selected?.imageUrl }}
              style={styles.modalImage}
              resizeMode="contain"
            />
            <Text style={styles.modalHint}>Toca fuera para cerrar</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  grid: { paddingBottom: 20 },
  row: { gap: 10, marginBottom: 10 },
  letterCard: {
    width: ITEM_SIZE,
    height: ITEM_HEIGHT,
    alignItems: 'center',
  },
  handImage: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 6,
    backgroundColor: '#f0ede8',
  },
  letterBadge: {
    backgroundColor: Colors.textPrimary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  letterText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: 240,
  },
  modalLetter: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 12,
  },
  modalImage: { width: 160, height: 160 },
  modalHint: { fontSize: 12, color: Colors.textHint, marginTop: 16 },
});
