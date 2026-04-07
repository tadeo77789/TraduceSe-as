import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
  ListRenderItem,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alarma } from '../../../types';

type AlarmaExtended = Alarma & { dias?: string[] };

const MOCK_ALARMS: AlarmaExtended[] = [
  { id_alarma: 1, hora: '11:00', mensaje: 'Práctica de señas diaria', activa: true, id_usuario: 1, dias: ['Lun', 'Mié', 'Vie'] },
  { id_alarma: 2, hora: '05:56', mensaje: 'Repasar el alfabeto LSC', activa: false, id_usuario: 1, dias: ['Mar', 'Jue'] },
  { id_alarma: 3, hora: '09:12', mensaje: 'Sesión de traducción matutina', activa: true, id_usuario: 1, dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'] },
];

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const keyExtractor = (item: AlarmaExtended) => String(item.id_alarma);

// ─── Reloj analógico ─────────────────────────────────────────────────────────
const ClockPicker: React.FC<{
  hour: number;
  minute: number;
  isAm: boolean;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  onAmPmChange: (am: boolean) => void;
}> = React.memo(function ClockPicker({ hour, minute, isAm, onAmPmChange }) {
  const hourAngle = ((hour % 12) / 12) * 360 - 90;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <View style={clock.container}>
      {/* Display hora */}
      <View style={clock.display}>
        <Text style={clock.timeText}>{String(hour).padStart(2, '0')}</Text>
        <Text style={clock.colon}>:</Text>
        <Text style={clock.timeText}>{String(minute).padStart(2, '0')}</Text>
        <View style={clock.ampm}>
          <TouchableOpacity
            style={[clock.ampmBtn, isAm && clock.ampmActive]}
            onPress={() => onAmPmChange(true)}
          >
            <Text style={[clock.ampmText, isAm && clock.ampmTextActive]}>AM</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[clock.ampmBtn, !isAm && clock.ampmActive]}
            onPress={() => onAmPmChange(false)}
          >
            <Text style={[clock.ampmText, !isAm && clock.ampmTextActive]}>PM</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cara del reloj */}
      <View style={clock.face}>
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
          const angle = (i / 12) * 360 - 90;
          const x = 75 * Math.cos(toRad(angle));
          const y = 75 * Math.sin(toRad(angle));
          const isSelected = n === hour % 12 || (hour % 12 === 0 && n === 12);
          return (
            <View
              key={n}
              style={[
                clock.number,
                { transform: [{ translateX: x }, { translateY: y }] },
                isSelected && clock.numberSelected,
              ]}
            >
              <Text style={[clock.numberText, isSelected && clock.numberTextSelected]}>
                {n}
              </Text>
            </View>
          );
        })}
        <View style={[clock.hand, { transform: [{ rotate: `${hourAngle + 90}deg` }] }]} />
        <LinearGradient colors={['#9333EA', '#7C3AED']} style={clock.center} />
      </View>
    </View>
  );
});

const clock = StyleSheet.create({
  container: {
    alignItems: 'center', padding: 16,
    backgroundColor: '#fff', borderRadius: 16,
  },
  display: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 4 },
  timeText: { fontSize: 40, fontWeight: '300', color: Colors.primary, width: 52, textAlign: 'center' },
  colon: { fontSize: 36, color: Colors.primary, marginBottom: 4 },
  ampm: { marginLeft: 8, gap: 4 },
  ampmBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  ampmActive: { backgroundColor: Colors.primaryBg },
  ampmText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  ampmTextActive: { color: Colors.primary, fontWeight: '700' },
  face: {
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: '#F5F3FF',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: Colors.primaryLighter,
  },
  number: {
    position: 'absolute', width: 26, height: 26,
    alignItems: 'center', justifyContent: 'center', borderRadius: 13,
  },
  numberSelected: { backgroundColor: Colors.primary },
  numberText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  numberTextSelected: { color: '#fff', fontWeight: '700' },
  hand: {
    position: 'absolute', width: 60, height: 2.5,
    backgroundColor: Colors.primary, borderRadius: 2,
    left: 90, top: 88.75, transformOrigin: 'left center',
  },
  center: {
    position: 'absolute', width: 12, height: 12,
    borderRadius: 6,
  },
});

// ─── Pantalla principal ───────────────────────────────────────────────────────
export const AlarmsScreen: React.FC = () => {
  const [alarms, setAlarms] = useState<AlarmaExtended[]>(MOCK_ALARMS);
  const [pickerHour, setPickerHour] = useState(7);
  const [pickerMinute] = useState(0);
  const [isAm, setIsAm] = useState(true);
  const [selectedDias, setSelectedDias] = useState<string[]>(['Lun', 'Mié', 'Vie']);

  const toggleAlarm = useCallback((id: number) => {
    setAlarms(prev =>
      prev.map(a => (a.id_alarma === id ? { ...a, activa: !a.activa } : a))
    );
  }, []);

  const deleteAlarm = useCallback((id: number) => {
    Alert.alert('Eliminar alarma', '¿Deseas eliminar esta alarma de práctica?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: () =>
          setAlarms(prev => prev.filter(a => a.id_alarma !== id))
      },
    ]);
  }, []);

  const toggleDia = useCallback((dia: string) => {
    setSelectedDias(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  }, []);

  const addAlarm = useCallback(() => {
    const newAlarm: AlarmaExtended = {
      id_alarma: Date.now(),
      hora: `${String(pickerHour).padStart(2, '0')}:${String(pickerMinute).padStart(2, '0')}`,
      mensaje: 'Práctica de señas',
      activa: true,
      id_usuario: 1,
      dias: selectedDias,
    };
    setAlarms(prev => [...prev, newAlarm]);
  }, [pickerHour, pickerMinute, selectedDias]);

  const renderItem: ListRenderItem<AlarmaExtended> = useCallback(({ item }) => (
    <View style={styles.alarmCard}>
      <LinearGradient
        colors={item.activa ? ['#EDE9FE', '#DDD6FE'] : ['#F9FAFB', '#F3F4F6']}
        style={styles.alarmIconBg}
      >
        <Ionicons
          name="alarm-outline"
          size={22}
          color={item.activa ? Colors.primary : Colors.textSecondary}
        />
      </LinearGradient>

      <View style={styles.alarmInfo}>
        <Text style={[styles.alarmTime, !item.activa && styles.alarmTimeOff]}>
          {item.hora}
        </Text>
        <Text style={styles.alarmMsg} numberOfLines={1}>{item.mensaje}</Text>

        {/* Días */}
        {item.dias && item.dias.length > 0 && (
          <View style={styles.diasRow}>
            {DIAS_SEMANA.map(dia => {
              const active = item.dias!.includes(dia);
              return (
                <View
                  key={dia}
                  style={[styles.diaBadge, active && styles.diaBadgeActive]}
                >
                  <Text style={[styles.diaText, active && styles.diaTextActive]}>
                    {dia[0]}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.alarmActions}>
          <TouchableOpacity
            style={styles.alarmBtnDelete}
            onPress={() => deleteAlarm(item.id_alarma)}
          >
            <Ionicons name="trash-outline" size={13} color={Colors.danger} />
            <Text style={styles.alarmBtnDeleteText}>Eliminar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.alarmBtnEdit}>
            <Ionicons name="create-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.alarmBtnEditText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Switch
        value={item.activa}
        onValueChange={() => toggleAlarm(item.id_alarma)}
        trackColor={{ false: Colors.toggleOff, true: Colors.toggleOn }}
        thumbColor="#fff"
      />
    </View>
  ), [deleteAlarm, toggleAlarm]);

  return (
    <View style={styles.root}>
      <AppHeader />
      <View style={styles.container}>
        {/* Lista de alarmas */}
        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis alarmas</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{alarms.filter(a => a.activa).length} activas</Text>
            </View>
          </View>
          <FlatList
            data={alarms}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Panel selector de hora */}
        <View style={styles.pickerPanel}>
          <Text style={styles.pickerTitle}>Nueva alarma</Text>
          <ClockPicker
            hour={pickerHour}
            minute={pickerMinute}
            isAm={isAm}
            onHourChange={setPickerHour}
            onMinuteChange={() => {}}
            onAmPmChange={setIsAm}
          />

          {/* Selector de días */}
          <View style={styles.diasSelector}>
            <Text style={styles.diasLabel}>Repetir</Text>
            <View style={styles.diasGrid}>
              {DIAS_SEMANA.map(dia => (
                <TouchableOpacity
                  key={dia}
                  style={[styles.diaSelectorBtn, selectedDias.includes(dia) && styles.diaSelectorBtnActive]}
                  onPress={() => toggleDia(dia)}
                >
                  <Text style={[styles.diaSelectorText, selectedDias.includes(dia) && styles.diaSelectorTextActive]}>
                    {dia[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.pickerActions}>
            <Ionicons name="keypad-outline" size={20} color={Colors.textSecondary} />
            <TouchableOpacity style={styles.addBtn} onPress={addAlarm}>
              <LinearGradient colors={['#9333EA', '#7C3AED']} style={styles.addBtnGrad}>
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.addBtnText}>Agregar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray },
  container: { flex: 1, flexDirection: 'row', padding: 12, gap: 12 },

  // Lista
  listSection: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  countBadge: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  list: { gap: 10 },

  // Alarm card
  alarmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  alarmIconBg: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  alarmInfo: { flex: 1 },
  alarmTime: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.5 },
  alarmTimeOff: { color: Colors.textHint },
  alarmMsg: { fontSize: 11, color: Colors.textSecondary, marginBottom: 6 },

  // Días en card
  diasRow: { flexDirection: 'row', gap: 3, marginBottom: 8 },
  diaBadge: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  diaBadgeActive: { backgroundColor: Colors.primaryBg },
  diaText: { fontSize: 9, color: Colors.textHint, fontWeight: '700' },
  diaTextActive: { color: Colors.primary },

  alarmActions: { flexDirection: 'row', gap: 6 },
  alarmBtnDelete: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
    borderColor: Colors.danger, backgroundColor: '#FFF5F5',
  },
  alarmBtnDeleteText: { color: Colors.danger, fontSize: 11, fontWeight: '600' },
  alarmBtnEdit: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
    borderColor: Colors.border, backgroundColor: '#fff',
  },
  alarmBtnEditText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },

  // Panel picker
  pickerPanel: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 210,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    gap: 10,
  },
  pickerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },

  // Selector de días
  diasSelector: { gap: 6 },
  diasLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  diasGrid: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  diaSelectorBtn: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  diaSelectorBtnActive: { backgroundColor: Colors.primary },
  diaSelectorText: { fontSize: 9, color: Colors.textSecondary, fontWeight: '700' },
  diaSelectorTextActive: { color: '#fff' },

  pickerActions: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 10,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  addBtn: { borderRadius: 10, overflow: 'hidden' },
  addBtnGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
