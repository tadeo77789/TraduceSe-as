/**
 * @file HistoryScreen.tsx
 * @description Pantalla del historial de traducciones del usuario.
 *
 * Muestra las traducciones guardadas en tarjetas con:
 * - Badge de tipo de traducción (`sena_texto`, `texto_sena`, `voz_sena`) con color diferenciado.
 * - Texto de entrada, fecha y hora.
 * - Acciones: "Reusar" (confirmación con Alert) y "Eliminar" (confirmación con Alert).
 *
 * Cuando la lista está vacía muestra un estado vacío con mensaje descriptivo.
 * En tablet (≥ 768 px) la grilla usa 2 columnas.
 *
 * Los datos actuales son mock (`MOCK_HISTORY`).
 *
 * @todo Conectar con `ENDPOINTS.history` para cargar el historial real del usuario.
 * @todo Conectar `handleDelete` con `ENDPOINTS.deleteTranslation`.
 */
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
  TextInput,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';
import { useColors, useTheme } from '../../../state/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Traduccion } from '../../../types';
import { useTranslation } from '../../../i18n';

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
type TipoConfig = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  gradient: [string, string];
  darkGradient: [string, string];
  textColor: string;
  darkTextColor: string;
};

const keyExtractor = (item: Traduccion) => String(item.id_traduccion);

export const HistoryScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const numCols = isTablet ? 2 : 1;
  const C = useColors();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [items, setItems] = useState<Traduccion[]>(MOCK_HISTORY);
  const [query, setQuery] = useState<string>('');


  const filtered = MOCK_HISTORY.filter((p) =>
    p.texto_entrada.toLowerCase().includes(query.toLowerCase())
  );


  const MOCK_TIMES: Record<number, string> = {
    1: '06:00', 2: '11:34', 3: '09:00', 4: '07:15', 5: '11:00',
    6: '08:30', 7: '06:45', 8: '09:20', 9: '12:09', 10: '09:00',
  };


  const TIPO_CONFIG: Record<string, TipoConfig> = {
    sena_texto: {
      label: t('historySenaTexto'),
      icon: 'hand-left-outline',
      gradient: [C.primaryBg, C.primaryHeader],
      darkGradient: [C.primaryBg, C.primaryBg],
      textColor: C.primary,
      darkTextColor: C.primary,
    },
    texto_sena: {
      label: t('historyTextoSena'),
      icon: 'text-outline',
      gradient: ['#DBEAFE', '#BFDBFE'],
      darkGradient: ['#162644', '#111B35'],
      textColor: '#2563EB',
      darkTextColor: '#60A5FA',
    },
    voz_sena: {
      label: t('historyVozSena'),
      icon: 'mic-outline',
      gradient: ['#D1FAE5', '#A7F3D0'],
      darkGradient: ['#0D2B1E', '#0A1E16'],
      textColor: '#059669',
      darkTextColor: '#34D399',
    },
  };

  const handleDelete = useCallback((id: number) => {
    Alert.alert(t('historyDeleteTitle'), t('historyConfirmDelete'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('historyDeleteBtn'), style: 'destructive',
        onPress: () => setItems(prev => prev.filter(item => item.id_traduccion !== id)),
      },
    ]);
  }, [t]);

  const handleReuse = useCallback((item: Traduccion) => {
    Alert.alert(t('historyReuseTitle'), `${t('historyReuseMsg')}\n\n"${item.texto_entrada}"`);
  }, [t]);

  const renderItem: ListRenderItem<Traduccion> = useCallback(({ item }) => {
    const config = TIPO_CONFIG[item.tipo] ?? TIPO_CONFIG['texto_sena'];
    const badgeColor = isDark ? config.darkTextColor : config.textColor;
    return (
      <View style={[styles.card, { backgroundColor: C.surface }]}>
        {/* Badge de tipo */}
        <LinearGradient colors={isDark ? config.darkGradient : config.gradient} style={styles.typeBadge}>
          <Ionicons name={config.icon} size={13} color={badgeColor} />
          <Text style={[styles.typeBadgeText, { color: badgeColor }]}>{config.label}</Text>
        </LinearGradient>

        {/* Contenido */}
        <Text style={[styles.cardText, { color: C.textPrimary }]} numberOfLines={2}>{item.texto_entrada}</Text>

        {/* Footer */}
        <View style={[styles.cardFooter, { borderTopColor: C.border }]}>
          <View style={styles.cardMeta}>
            <Ionicons name="calendar-outline" size={12} color={C.textHint} />
            <Text style={[styles.cardMetaText, { color: C.textHint }]}>{item.fecha_traduccion}</Text>
            <Ionicons name="time-outline" size={12} color={C.textHint} style={{ marginLeft: 8 }} />
            <Text style={[styles.cardMetaText, { color: C.textHint }]}>{MOCK_TIMES[item.id_traduccion]}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.primaryBg }]} onPress={() => handleReuse(item)}>
              <Ionicons name="refresh-outline" size={15} color={C.primary} />
              <Text style={[styles.actionText, { color: C.primary }]}>{t('historyReuseBtn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(239,68,68,0.12)' }]} onPress={() => handleDelete(item.id_traduccion)}>
              <Ionicons name="trash-outline" size={15} color={C.danger} />
              <Text style={[styles.actionText, { color: C.danger }]}>{t('historyDeleteBtn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [handleDelete, handleReuse, C, isDark, t, TIPO_CONFIG]);

  return (
    <View style={[styles.root, { backgroundColor: C.backgroundGray }]}>
      <AppHeader />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: C.textPrimary }]}>{t('historyTitle')}</Text>
          <View style={[styles.countBadge, { backgroundColor: C.primaryBg }]}>
            <Text style={[styles.countText, { color: C.primary }]}>{items.length} {t('historyRecords')}</Text>
          </View>
        </View>
        <TextInput
          style={[styles.input, { backgroundColor: C.surface, color: C.textPrimary, borderColor: C.border }]}
          value={query}
          onChangeText={setQuery}
          placeholder={t('historyFilter')}
          placeholderTextColor={C.textHint}
        />
        {items.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: C.primaryBg }]}>
              <Ionicons name="time-outline" size={40} color={C.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: C.textPrimary }]}>{t('historyEmpty')}</Text>
            <Text style={[styles.emptyText, { color: C.textSecondary }]}>{t('historyEmptyText')}</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 90,
    maxWidth: 500,
    width: '100%',       
    alignSelf: 'center',
    padding: 12,
    fontSize: 16,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#974a99',
  },
  texto_entrada: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  tipo: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
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
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  cardMetaText: { fontSize: 12, color: Colors.textHint },
  cardActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
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
