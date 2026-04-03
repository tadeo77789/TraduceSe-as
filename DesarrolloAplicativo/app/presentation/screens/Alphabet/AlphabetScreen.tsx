import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';

const { width } = Dimensions.get('window');
const COLS = 5;
const ITEM_SIZE = (width - 32 - (COLS - 1) * 10) / COLS;

// Alphabet data con URLs de referencia
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => ({
  letter,
  // URLs de imágenes del alfabeto LSC - en producción vendrán del backend/léxico
  imageUrl: `https://www.lifeprint.com/asl101/images-handshapes/${letter.toLowerCase()}.gif`,
}));

export const AlphabetScreen: React.FC = () => {
  const [selected, setSelected] = useState<{ letter: string; imageUrl: string } | null>(null);

  return (
    <View style={styles.root}>
      <AppHeader />
      <View style={styles.container}>
        <Text style={styles.title}>Alfabeto de Señas</Text>

        <FlatList
          data={ALPHABET}
          numColumns={COLS}
          keyExtractor={item => item.letter}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.letterCard} onPress={() => setSelected(item)}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.handImage}
                resizeMode="contain"
              />
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>{item.letter}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Modal detalle */}
      <Modal visible={!!selected} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setSelected(null)}>
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
    height: ITEM_SIZE + 24,
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
