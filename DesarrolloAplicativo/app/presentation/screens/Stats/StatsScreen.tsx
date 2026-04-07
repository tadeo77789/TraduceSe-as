import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  LayoutChangeEvent,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// ─── Gráfica de barras ────────────────────────────────────────────────────────
const BarChart: React.FC<{
  data: { label: string; value: number }[];
  colors: [string, string];
  maxValue?: number;
}> = ({ data, colors, maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value));
  const chartHeight = 100;

  return (
    <View style={bar.container}>
      <View style={bar.chart}>
        {data.map((item, i) => (
          <View key={i} style={bar.barGroup}>
            <Text style={bar.valueLabel}>{item.value}</Text>
            <View style={[bar.barWrap, { height: (item.value / max) * chartHeight }]}>
              <LinearGradient
                colors={colors}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={bar.bar}
              />
            </View>
            <Text style={bar.barLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Gráfica de línea — usa onLayout para medir el ancho real ─────────────────
const LineChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const [containerWidth, setContainerWidth] = useState(280);

  const max = Math.max(...data);
  const chartHeight = 80;
  const step = containerWidth / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * step,
    y: chartHeight - (v / max) * chartHeight,
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setContainerWidth(w);
  };

  return (
    <View
      style={[lineStyle.container, { height: chartHeight + 20 }]}
      onLayout={handleLayout}
    >
      {/* Líneas conectoras */}
      {points.slice(0, -1).map((pt, i) => {
        const next = points[i + 1];
        const dx = next.x - pt.x;
        const dy = next.y - pt.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <View
            key={i}
            style={[
              lineStyle.segment,
              {
                left: pt.x,
                top: pt.y + 5,
                width: length,
                transform: [{ rotate: `${angle}deg` }],
                backgroundColor: color + '50',
              },
            ]}
          />
        );
      })}
      {/* Puntos */}
      {points.map((pt, i) => (
        <View
          key={i}
          style={[lineStyle.dot, { left: pt.x - 5, top: pt.y, backgroundColor: color }]}
        >
          {i === points.length - 1 && (
            <View style={[lineStyle.dotPulse, { borderColor: color }]} />
          )}
        </View>
      ))}
    </View>
  );
};

// ─── Leyenda de torta ────────────────────────────────────────────────────────
const PieChart: React.FC<{
  data: { label: string; value: number; color: string }[];
}> = ({ data }) => (
  <View style={pie.container}>
    <View style={pie.legend}>
      {data.map((item, i) => (
        <View key={i} style={pie.legendRow}>
          <View style={[pie.dot, { backgroundColor: item.color }]} />
          <Text style={pie.legendLabel}>{item.label}</Text>
          <View style={pie.barTrack}>
            <View style={[pie.barFill, { width: `${item.value}%` as any, backgroundColor: item.color }]} />
          </View>
          <Text style={[pie.legendValue, { color: item.color }]}>{item.value}%</Text>
        </View>
      ))}
    </View>
  </View>
);

// ─── Estilos de gráficas ──────────────────────────────────────────────────────
const bar = StyleSheet.create({
  container: { marginVertical: 8 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 130 },
  barGroup: { alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  valueLabel: { fontSize: 9, color: Colors.textHint, marginBottom: 3, fontWeight: '600' },
  barWrap: { width: '80%', borderRadius: 6, overflow: 'hidden' },
  bar: { flex: 1, borderRadius: 6 },
  barLabel: { fontSize: 9, color: Colors.textHint, marginTop: 5 },
});

const lineStyle = StyleSheet.create({
  container: { position: 'relative', width: '100%', overflow: 'hidden' },
  segment: {
    position: 'absolute', height: 2, borderRadius: 1,
    transformOrigin: 'left center',
  },
  dot: {
    position: 'absolute', width: 10, height: 10,
    borderRadius: 5, borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
  dotPulse: {
    position: 'absolute', width: 18, height: 18,
    borderRadius: 9, borderWidth: 2, opacity: 0.35,
    top: -4, left: -4,
  },
});

const pie = StyleSheet.create({
  container: { gap: 10 },
  legend: { gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: Colors.textSecondary, width: 80 },
  barTrack: {
    flex: 1, height: 6, backgroundColor: '#F3F4F6',
    borderRadius: 3, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  legendValue: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
});

// ─── Datos ────────────────────────────────────────────────────────────────────
const WEEKLY_DATA = [
  { label: 'Lun', value: 30 },
  { label: 'Mar', value: 45 },
  { label: 'Mié', value: 38 },
  { label: 'Jue', value: 52 },
  { label: 'Vie', value: 60 },
  { label: 'Sáb', value: 80 },
  { label: 'Dom', value: 70 },
];

const MONTHLY_LINE = [10, 15, 20, 28, 35, 42, 50, 55, 62, 68, 74, 80];

const SECTION_PIE = [
  { label: 'Traducción', value: 40, color: Colors.primary },
  { label: 'Alfabeto', value: 25, color: '#06B6D4' },
  { label: 'Historial', value: 20, color: '#10B981' },
  { label: 'Alarmas', value: 15, color: '#F59E0B' },
];

const KPI_CARDS = [
  { label: 'Traducciones', value: '1,248', icon: 'swap-horizontal-outline' as const, gradient: ['#EDE9FE', '#DDD6FE'] as [string, string], color: Colors.primary },
  { label: 'Usuarios activos', value: '342', icon: 'people-outline' as const, gradient: ['#DBEAFE', '#BFDBFE'] as [string, string], color: '#2563EB' },
  { label: 'Horas aprendidas', value: '89h', icon: 'school-outline' as const, gradient: ['#D1FAE5', '#A7F3D0'] as [string, string], color: '#059669' },
  { label: 'Señas aprendidas', value: '84', icon: 'hand-left-outline' as const, gradient: ['#FEF3C7', '#FDE68A'] as [string, string], color: '#D97706' },
];

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  description: string;
  accentColor: string;
  children: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, description, accentColor, children }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
    <Text style={styles.cardDesc}>{description}</Text>
  </View>
);

// ─── Pantalla principal ───────────────────────────────────────────────────────
export const StatsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.innerWrapper, isDesktop && styles.innerWrapperWide]}>

          {/* KPI Cards — 4 cols en desktop, 2 en tablet/mobile */}
          <View style={[styles.kpiGrid, isDesktop && styles.kpiGridDesktop]}>
            {KPI_CARDS.map((kpi, i) => (
              <LinearGradient key={i} colors={kpi.gradient} style={[styles.kpiCard, isDesktop && styles.kpiCardDesktop]}>
                <Ionicons name={kpi.icon} size={20} color={kpi.color} />
                <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
              </LinearGradient>
            ))}
          </View>

          {/* Stat Cards */}
          <View style={[styles.cardsGrid, isTablet && styles.cardsGridTablet]}>
            <StatCard
              title="Actividad semanal"
              accentColor={Colors.primary}
              description="La actividad presenta un incremento progresivo hacia el fin de semana, alcanzando su punto más alto el sábado."
            >
              <BarChart data={WEEKLY_DATA} colors={['#A78BFA', '#7C3AED']} />
            </StatCard>

            <StatCard
              title="Crecimiento mensual de usuarios"
              accentColor="#06B6D4"
              description="Crecimiento constante en la cantidad de usuarios, con un aumento cercano al 80% al finalizar el período."
            >
              <LineChart data={MONTHLY_LINE} color={Colors.primary} />
            </StatCard>

            <StatCard
              title="Volumen de traducciones por semana"
              accentColor="#10B981"
              description="El volumen de traducciones crece semana a semana, alcanzando su punto máximo en la semana 4."
            >
              <BarChart
                data={[
                  { label: 'Sem 1', value: 20 },
                  { label: 'Sem 2', value: 28 },
                  { label: 'Sem 3', value: 35 },
                  { label: 'Sem 4', value: 45 },
                ]}
                colors={['#67E8F9', '#06B6D4']}
              />
            </StatCard>

            <StatCard
              title="Uso por sección"
              accentColor="#F59E0B"
              description="Traducción concentra el 40% del uso total, posicionándose como la funcionalidad principal de la app."
            >
              <PieChart data={SECTION_PIE} />
            </StatCard>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, alignItems: 'center' },
  contentDesktop: { paddingHorizontal: 48, paddingVertical: 32 },
  innerWrapper: { width: '100%', gap: 16 },
  innerWrapperWide: { maxWidth: 960, alignSelf: 'center' },

  // KPI
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 4,
  },
  kpiGridDesktop: { flexWrap: 'nowrap' },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 20,
    padding: 18,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  kpiCardDesktop: { minWidth: 0 },
  kpiValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  kpiLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  // StatCard grid
  cardsGrid: { gap: 14 },
  cardsGridTablet: { flexDirection: 'row', flexWrap: 'wrap' },

  // StatCard
  card: {
    flex: 1,
    minWidth: 280,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardAccent: { width: 4, height: 20, borderRadius: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  cardDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 14,
  },
});
