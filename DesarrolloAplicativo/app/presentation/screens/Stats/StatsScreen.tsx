import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';

const { width } = Dimensions.get('window');

// Componente de barra simple sin librerías externas
const BarChart: React.FC<{
  data: { label: string; value: number }[];
  color: string;
  maxValue?: number;
}> = ({ data, color, maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value));
  const chartHeight = 100;

  return (
    <View style={bar.container}>
      <View style={bar.chart}>
        {data.map((item, i) => (
          <View key={i} style={bar.barGroup}>
            <View style={[bar.bar, { height: (item.value / max) * chartHeight, backgroundColor: color }]} />
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
            { left: pt.x - 4, top: pt.y - 4, backgroundColor: color },
          ]}
        />
      ))}
    </View>
  );
};

// Gráfica de torta simple (segmentos)
const PieChart: React.FC<{
  data: { label: string; value: number; color: string }[];
}> = ({ data }) => {
  return (
    <View style={pie.container}>
      <View style={pie.legend}>
        {data.map((item, i) => (
          <View key={i} style={pie.legendRow}>
            <View style={[pie.dot, { backgroundColor: item.color }]} />
            <Text style={pie.legendText}>{item.label} {item.value}%</Text>
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
  bar: { width: '80%', borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 9, color: Colors.textHint, marginTop: 4 },
});

const line = StyleSheet.create({
  container: { position: 'relative', width: '100%' },
  dot: {
    position: 'absolute', width: 8, height: 8,
    borderRadius: 4, borderWidth: 1.5, borderColor: '#fff',
  },
});

const pie = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  legend: { flex: 1 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: Colors.textSecondary },
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

export const StatsScreen: React.FC = () => {
  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Stat 1 — uso semanal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actividad semanal de usuarios</Text>
          <BarChart data={WEEKLY_DATA} color={Colors.primaryLighter} />
          <Text style={styles.cardDesc}>
            Se observa que la actividad de usuarios presenta un incremento progresivo hacia el fin de
            semana, alcanzando su punto más alto el día sábado.
          </Text>
        </View>

        {/* Stat 2 — crecimiento mensual */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Crecimiento mensual de usuarios</Text>
          <LineChart data={MONTHLY_LINE} color={Colors.primary} />
          <Text style={styles.cardDesc}>
            Durante el año se evidencia un crecimiento constante en la cantidad de usuarios,
            llegando a un aumento cercano al 80% al finalizar el período.
          </Text>
        </View>

        {/* Stat 3 — traducciones semanales */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Volumen de traducciones</Text>
          <BarChart
            data={[
              { label: 'Sem 1', value: 20 },
              { label: 'Sem 2', value: 28 },
              { label: 'Sem 3', value: 35 },
              { label: 'Sem 4', value: 45 },
            ]}
            color={Colors.secondary || '#06B6D4'}
          />
          <Text style={styles.cardDesc}>
            El volumen de traducciones presenta variaciones semanales, con un crecimiento general
            que alcanza su punto máximo en la última semana.
          </Text>
        </View>

        {/* Stat 4 — distribución de secciones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Uso por sección</Text>
          <PieChart data={SECTION_PIE} />
          <Text style={styles.cardDesc}>
            La sección de Traducción concentra el 40% del uso total, posicionándose como la
            funcionalidad principal de la aplicación.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 10,
  },
});
