
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppHeader } from '../../../shared/components/common/AppHeader';
import { Colors } from '../../../shared/constants/colors';
import { useColors, useTheme } from '../../../app/providers/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Traduccion } from '../../../shared/types';
import { useTranslation } from '../../../app/config/i18n';
import { translationsService, type SavedTranslation } from '../../../feature/Translation/services/translations.service';
import { showAlert, showConfirm } from '../../../shared/utils/dialogs';

type HistoryItem = Traduccion & { hora: string };

const mapSavedTranslation = (row: SavedTranslation): HistoryItem => {
  const date = new Date(row.created_at);
  return {
    id_traduccion: row.translation_id,
    texto_entrada: row.input_text,
    texto_traducido: row.output_text,
    tipo: row.type,
    fecha_traduccion: date.toLocaleDateString(),
    hora: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    is_deleted: row.is_deleted,
  };
};

type TipoConfig = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  gradient: [string, string];
  darkGradient: [string, string];
  textColor: string;
  darkTextColor: string;
};

const keyExtractor = (item: HistoryItem) => String(item.id_traduccion);

export const HistoryScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const numCols = isTablet ? 2 : 1;
  const C = useColors();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<string>('');

  const filtered = items.filter((p) =>
    p.texto_entrada.toLowerCase().includes(query.toLowerCase())
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const rows = await translationsService.list({ limit: 100 });
          if (active) setItems(rows.map(mapSavedTranslation));
        } catch {

          if (active) setItems([]);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, []),
  );

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

  const handleDelete = useCallback(async (id: number) => {
    const ok = await showConfirm({
      title: t('historyDeleteTitle'),
      message: t('historyConfirmDelete'),
      confirmText: t('historyDeleteBtn'),
      cancelText: t('cancel'),
      destructive: true,
    });
    if (!ok) return;
    try {
      await translationsService.remove(id);
      setItems(prev => prev.filter(item => item.id_traduccion !== id));
    } catch {
      await showAlert({ title: t('error'), message: t('historyDeleteError'), icon: 'error' });
    }
  }, [t]);

  const handleReuse = useCallback((item: HistoryItem) => {
    showAlert({ title: t('historyReuseTitle'), message: `${t('historyReuseMsg')}\n\n"${item.texto_entrada}"` });
  }, [t]);

  const renderItem: ListRenderItem<HistoryItem> = useCallback(({ item }) => {
    const config = TIPO_CONFIG[item.tipo] ?? TIPO_CONFIG['texto_sena'];
    const badgeColor = isDark ? config.darkTextColor : config.textColor;
    return (
      <View style={[styles.card, { backgroundColor: C.surface }]}>

        <LinearGradient colors={isDark ? config.darkGradient : config.gradient} style={styles.typeBadge}>
          <Ionicons name={config.icon} size={13} color={badgeColor} />
          <Text style={[styles.typeBadgeText, { color: badgeColor }]}>{config.label}</Text>
        </LinearGradient>

        <Text style={[styles.cardText, { color: C.textPrimary }]} numberOfLines={2}>{item.texto_entrada}</Text>

        <View style={[styles.cardFooter, { borderTopColor: C.border }]}>
          <View style={styles.cardMeta}>
            <Ionicons name="calendar-outline" size={12} color={C.textHint} />
            <Text style={[styles.cardMetaText, { color: C.textHint }]}>{item.fecha_traduccion}</Text>
            <Ionicons name="time-outline" size={12} color={C.textHint} style={{ marginLeft: 8 }} />
            <Text style={[styles.cardMetaText, { color: C.textHint }]}>{item.hora}</Text>
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
        {loading ? (
          <View style={styles.empty}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        ) : filtered.length === 0 ? (
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
