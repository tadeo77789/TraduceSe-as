import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Componente de barra simple sin librerías externas
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

// Componente de gráfica de línea simple
const LineChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data);
  const height = 80;
  const chartWidth = width - 80;
  const step = chartWidth / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * step,
    y: height - (v / max) * height,
  }));

  return (
    <View style={[line.container, { height }]}>
      {points.map((pt, i) => (
        <View
          key={i}
          style={[
            line.dot,
            { left: pt.x - 5, top: pt.y - 5, backgroundColor: color },
          ]}
        />
      ))}
    </View>
  );
};

// Leyenda de gráfica de torta
const PieChart: React.FC<{
  data: { label: string; value: number; color: string }[];
}> = ({ data }) => {
  return (
    <View style={pie.container}>
      <View style={pie.legend}>
        {data.map((item, i) => (
          <View key={i} style={pie.legendRow}>
            <View style={[pie.dot, { backgroundColor: item.color }]} />
            <Text style={pie.legendLabel}>{item.label}</Text>
            <Text style={[pie.legendValue, { color: item.color }]}>{item.value}%</Text>
          </View>
        ))}
      </View>
      <View style={pie.chart}>
        {data.map((item, i) => (
          <View
            key={i}
            style={[
              pie.segment,
              {
                width: item.value * 1.2,
                height: item.value * 1.2,
                borderRadius: item.value * 0.6,
                backgroundColor: item.color,
                opacity: 0.85,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const bar = StyleSheet.create({
  container: { marginVertical: 8 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 110 },
  barGroup: { alignItems: 'center', flex: 1 },
  barWrap: { width: '80%', borderRadius: 6, overflow: 'hidden' },
  bar: { flex: 1, borderRadius: 6 },
  barLabel: { fontSize: 9, color: Colors.textHint, marginTop: 4 },
});

const line = StyleSheet.create({
  container: { position: 'relative', width: '100%' },
  dot: {
    position: 'absolute', width: 10, height: 10,
    borderRadius: 5, borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
});

const pie = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  legend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  legendValue: { fontSize: 12, fontWeight: '700' },
  chart: {
    width: 100, height: 100, alignItems: 'center',
    justifyContent: 'center', position: 'relative',
  },
  segment: { position: 'absolute' },
});

// ─── Datos de ejemplo ─────────────────────────────────────────────────────────
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
  { label: 'Alfabeto', value: 25, color: Colors.primaryLight },
  { label: 'Historial', value: 20, color: Colors.primaryLighter },
  { label: 'Alarmas', value: 15, color: '#E9D5FF' },
];

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

export const StatsScreen: React.FC = () => {
  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <StatCard
          title="Actividad semanal de usuarios"
          accentColor={Colors.primary}
          description="La actividad de usuarios presenta un incremento progresivo hacia el fin de semana, alcanzando su punto más alto el sábado."
        >
          <BarChart data={WEEKLY_DATA} colors={['#A78BFA', '#7C3AED']} />
        </StatCard>

        <StatCard
          title="Crecimiento mensual de usuarios"
          accentColor="#06B6D4"
          description="Durante el año se evidencia un crecimiento constante en la cantidad de usuarios, llegando a un aumento cercano al 80% al finalizar el período."
        >
          <LineChart data={MONTHLY_LINE} color={Colors.primary} />
        </StatCard>

        <StatCard
          title="Volumen de traducciones"
          accentColor="#10B981"
          description="El volumen de traducciones presenta un crecimiento general que alcanza su punto máximo en la última semana."
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
          description="La sección de Traducción concentra el 40% del uso total, posicionándose como la funcionalidad principal de la aplicación."
        >
          <PieChart data={SECTION_PIE} />
        </StatCard>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 36 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginTop: 12,
  },
});
