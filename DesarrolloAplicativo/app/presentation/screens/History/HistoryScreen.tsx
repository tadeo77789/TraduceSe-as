import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Traduccion } from '../../../types';

const MOCK_HISTORY: Traduccion[] = [
  { id_traduccion: 1, texto_entrada: 'no entiendo', texto_traducido: '', tipo: 'sena_texto', fecha_traduccion: '07/12/25', is_deleted: false },
  { id_traduccion: 2, texto_entrada: 'quisiera llevar algo', texto_traducido: '', tipo: 'texto_sena', fecha_traduccion: '06/12/25', is_deleted: false },
  { id_traduccion: 3, texto_entrada: 'hola me llamo', texto_traducido: '', tipo: 'texto_sena', fecha_traduccion: '06/12/25', is_deleted: false },
  { id_traduccion: 4, texto_entrada: 'quisiera comunicarme contigo', texto_traducido: '', tipo: 'sena_texto', fecha_traduccion: '05/12/25', is_deleted: false },
  { id_traduccion: 5, texto_entrada: 'hola me llamo', texto_traducido: '', tipo: 'voz_sena', fecha_traduccion: '05/12/25', is_deleted: false },
  { id_traduccion: 6, texto_entrada: 'no te quiero', texto_traducido: '', tipo: 'texto_sena', fecha_traduccion: '05/12/25', is_deleted: false },
  { id_traduccion: 7, texto_entrada: 'hasta luego', texto_traducido: '', tipo: 'texto_sena', fecha_traduccion: '04/12/25', is_deleted: false },
  { id_traduccion: 8, texto_entrada: 'no te quiero ver', texto_traducido: '', tipo: 'sena_texto', fecha_traduccion: '04/12/25', is_deleted: false },
  { id_traduccion: 9, texto_entrada: 'espero le guste', texto_traducido: '', tipo: 'texto_sena', fecha_traduccion: '04/12/25', is_deleted: false },
  { id_traduccion: 10, texto_entrada: 'toma esto para ti', texto_traducido: '', tipo: 'texto_sena', fecha_traduccion: '02/12/25', is_deleted: false },
];

const MOCK_TIMES: Record<number, string> = {
  1: '06:00', 2: '11:34', 3: '09:00', 4: '07:00', 5: '11:00',
  6: '08:00', 7: '06:00', 8: '09:00', 9: '12:09', 10: '09:00',
};

export const HistoryScreen: React.FC = () => {
  const [items, setItems] = useState<Traduccion[]>(MOCK_HISTORY);

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar', '¿Eliminar esta traducción?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: () => setItems(prev => prev.filter(t => t.id_traduccion !== id)),
      },
    ]);
  };

  const handleReuse = (item: Traduccion) => {
    Alert.alert('Reusar', `Traducir: "${item.texto_entrada}"`);
  };

  return (
    <View style={styles.root}>
      <AppHeader />
      <View style={styles.container}>
        <Text style={styles.title}>Historial de Traducciones</Text>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={48} color={Colors.primaryLighter} />
            <Text style={styles.emptyText}>No hay traducciones guardadas</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => String(item.id_traduccion)}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.rowText} numberOfLines={1}>{item.texto_entrada}</Text>
                <Text style={styles.rowDate}>{item.fecha_traduccion}</Text>
                <Text style={styles.rowTime}>{MOCK_TIMES[item.id_traduccion]}</Text>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => handleReuse(item)}
                >
                  <Ionicons name="exit-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => handleDelete(item.id_traduccion)}
                >
                  <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'right',
    paddingRight: 8,
  },
  rowDate: { fontSize: 13, color: Colors.textSecondary, width: 60 },
  rowTime: { fontSize: 13, color: Colors.textSecondary, width: 44 },
  iconBtn: { padding: 4 },
  separator: { height: 1, backgroundColor: Colors.border },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
});
