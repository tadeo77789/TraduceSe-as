import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ListRenderItem,
  useWindowDimensions,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Traduccion } from '../../../types';

const MOCK_HISTORY: Traduccion[] = [
  { id_traduccion: 1, texto_entrada: 'No entiendo lo que dices', texto_traducido: '🤟 [seña detectada]', tipo: 'sena_texto', fecha_traduccion: '07/12/25', is_deleted: false },
  { id_traduccion: 2, texto_entrada: 'Quisiera llevar algo de comer', texto_traducido: '👋 [animación LSC]', tipo: 'texto_sena', fecha_traduccion: '06/12/25', is_deleted: false },
  { id_traduccion: 3, texto_entrada: 'Hola, me llamo Juan', texto_traducido: '👋 [animación LSC]', tipo: 'texto_sena', fecha_traduccion: '06/12/25', is_deleted: false },
  { id_traduccion: 4, texto_entrada: 'Quisiera comunicarme contigo', texto_traducido: '🤟 [seña detectada]', tipo: 'sena_texto', fecha_traduccion: '05/12/25', is_deleted: false },
  { id_traduccion: 5, texto_entrada: 'Buenos días, ¿cómo estás?', texto_traducido: '🎙️ [voz procesada]', tipo: 'voz_sena', fecha_traduccion: '05/12/25', is_deleted: false },
  { id_traduccion: 6, texto_entrada: 'Por favor ayúdame', texto_traducido: '👋 [animación LSC]', tipo: 'texto_sena', fecha_traduccion: '05/12/25', is_deleted: false },
  { id_traduccion: 7, texto_entrada: 'Hasta luego, nos vemos mañana', texto_traducido: '👋 [animación LSC]', tipo: 'texto_sena', fecha_traduccion: '04/12/25', is_deleted: false },
  { id_traduccion: 8, texto_entrada: 'Necesito ayuda con esto', texto_traducido: '🤟 [seña detectada]', tipo: 'sena_texto', fecha_traduccion: '04/12/25', is_deleted: false },
  { id_traduccion: 9, texto_entrada: 'Espero que le guste el regalo', texto_traducido: '👋 [animación LSC]', tipo: 'texto_sena', fecha_traduccion: '04/12/25', is_deleted: false },
  { id_traduccion: 10, texto_entrada: 'Toma esto, es para ti', texto_traducido: '🤟 [seña detectada]', tipo: 'sena_texto', fecha_traduccion: '02/12/25', is_deleted: false },
];

const MOCK_TIMES: Record<number, string> = {
  1: '06:00', 2: '11:34', 3: '09:00', 4: '07:15', 5: '11:00',
  6: '08:30', 7: '06:45', 8: '09:20', 9: '12:09', 10: '09:00',
};

type TipoConfig = {
  label: string;
  icon: keyof typeof import('@expo/vector-icons/build/Ionicons').glyphMap;
  gradient: [string, string];
  textColor: string;
};

const TIPO_CONFIG: Record<string, TipoConfig> = {
  sena_texto: {
    label: 'Seña → Texto',
    icon: 'hand-left-outline',
    gradient: ['#EDE9FE', '#DDD6FE'],
    textColor: Colors.primary,
  },
  texto_sena: {
    label: 'Texto → Seña',
    icon: 'text-outline',
    gradient: ['#DBEAFE', '#BFDBFE'],
    textColor: '#2563EB',
  },
  voz_sena: {
    label: 'Voz → Seña',
    icon: 'mic-outline',
    gradient: ['#D1FAE5', '#A7F3D0'],
    textColor: '#059669',
  },
};

const keyExtractor = (item: Traduccion) => String(item.id_traduccion);

export const HistoryScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const numCols = isTablet ? 2 : 1;
  const [items, setItems] = useState<Traduccion[]>(MOCK_HISTORY);

  const handleDelete = useCallback((id: number) => {
    Alert.alert('Eliminar traducción', '¿Deseas eliminar este registro del historial?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: () => setItems(prev => prev.filter(t => t.id_traduccion !== id)),
      },
    ]);
  }, []);

  const handleReuse = useCallback((item: Traduccion) => {
    Alert.alert('Reusar traducción', `¿Traducir de nuevo?\n\n"${item.texto_entrada}"`);
  }, []);

  const renderItem: ListRenderItem<Traduccion> = useCallback(({ item }) => {
    const config = TIPO_CONFIG[item.tipo] ?? TIPO_CONFIG['texto_sena'];
    return (
      <View style={styles.card}>
        {/* Badge de tipo */}
        <LinearGradient colors={config.gradient} style={styles.typeBadge}>
          <Ionicons name={config.icon} size={13} color={config.textColor} />
          <Text style={[styles.typeBadgeText, { color: config.textColor }]}>{config.label}</Text>
        </LinearGradient>

        {/* Contenido */}
        <Text style={styles.cardText} numberOfLines={2}>{item.texto_entrada}</Text>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.cardMeta}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textHint} />
            <Text style={styles.cardMetaText}>{item.fecha_traduccion}</Text>
            <Ionicons name="time-outline" size={12} color={Colors.textHint} style={{ marginLeft: 8 }} />
            <Text style={styles.cardMetaText}>{MOCK_TIMES[item.id_traduccion]}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleReuse(item)}>
              <Ionicons name="refresh-outline" size={15} color={Colors.primary} />
              <Text style={[styles.actionText, { color: Colors.primary }]}>Reusar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={() => handleDelete(item.id_traduccion)}>
              <Ionicons name="trash-outline" size={15} color={Colors.danger} />
              <Text style={[styles.actionText, { color: Colors.danger }]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [handleDelete, handleReuse]);

  return (
    <View style={styles.root}>
      <AppHeader />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Historial</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{items.length} registros</Text>
          </View>
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="time-outline" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Sin traducciones</Text>
            <Text style={styles.emptyText}>Las traducciones que realices aparecerán aquí</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            key={numCols}
            numColumns={numCols}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  columnWrapper: { gap: 12 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  list: { gap: 12, paddingBottom: 28 },

  // Card
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  typeBadgeText: { fontSize: 12, fontWeight: '700' },
  cardText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
    lineHeight: 23,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: 12, color: Colors.textHint },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.primaryBg,
  },
  actionBtnDanger: { backgroundColor: '#FFF5F5' },
  actionText: { fontSize: 12, fontWeight: '600' },

  // Empty state
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', maxWidth: 260, lineHeight: 22 },
});
