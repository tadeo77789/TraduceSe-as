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

const MOCK_ALARMS: Alarma[] = [
  { id_alarma: 1, hora: '11:00', mensaje: 'Es hora de traducir', activa: true, id_usuario: 1 },
  { id_alarma: 2, hora: '05:56', mensaje: 'Es hora de traducir', activa: false, id_usuario: 1 },
  { id_alarma: 3, hora: '09:12', mensaje: 'Es hora de traducir', activa: true, id_usuario: 1 },
];

const keyExtractor = (item: Alarma) => String(item.id_alarma);

// Mini reloj analógico para selección de hora
const ClockPicker: React.FC<{
  hour: number;
  minute: number;
  isAm: boolean;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  onAmPmChange: (am: boolean) => void;
}> = React.memo(function ClockPicker({ hour, minute, isAm, onAmPmChange }) {
  const radius = 85;
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

export const AlarmsScreen: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarma[]>(MOCK_ALARMS);
  const [pickerHour, setPickerHour] = useState(7);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [isAm, setIsAm] = useState(true);

  const toggleAlarm = useCallback((id: number) => {
    setAlarms(prev =>
      prev.map(a => (a.id_alarma === id ? { ...a, activa: !a.activa } : a))
    );
  }, []);

  const deleteAlarm = useCallback((id: number) => {
    Alert.alert('Eliminar', '¿Eliminar esta alarma?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () =>
        setAlarms(prev => prev.filter(a => a.id_alarma !== id))
      },
    ]);
  }, []);

  const addAlarm = useCallback(() => {
    const newAlarm: Alarma = {
      id_alarma: Date.now(),
      hora: `${String(pickerHour).padStart(2, '0')}:${String(pickerMinute).padStart(2, '0')}`,
      mensaje: 'Es hora de traducir',
      activa: true,
      id_usuario: 1,
    };
    setAlarms(prev => [...prev, newAlarm]);
  }, [pickerHour, pickerMinute]);

  const renderItem: ListRenderItem<Alarma> = useCallback(({ item }) => (
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
        <Text style={styles.alarmMsg}>{item.mensaje}</Text>
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
        <FlatList
          data={alarms}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />

        {/* Panel selector de hora */}
        <View style={styles.pickerPanel}>
          <ClockPicker
            hour={pickerHour}
            minute={pickerMinute}
            isAm={isAm}
            onHourChange={setPickerHour}
            onMinuteChange={setPickerMinute}
            onAmPmChange={setIsAm}
          />
          <View style={styles.pickerActions}>
            <Ionicons name="keypad-outline" size={20} color={Colors.textSecondary} />
            <TouchableOpacity style={styles.addBtn} onPress={addAlarm}>
              <LinearGradient colors={['#9333EA', '#7C3AED']} style={styles.addBtnGrad}>
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
  list: { gap: 10 },

  alarmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  alarmIconBg: {
    width: 46, height: 46, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  alarmInfo: { flex: 1 },
  alarmTime: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.5 },
  alarmTimeOff: { color: Colors.textHint },
  alarmMsg: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
  alarmActions: { flexDirection: 'row', gap: 8 },
  alarmBtnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
    backgroundColor: '#FFF5F5',
  },
  alarmBtnDeleteText: { color: Colors.danger, fontSize: 12, fontWeight: '600' },
  alarmBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#fff',
  },
  alarmBtnEditText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },

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
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addBtn: { borderRadius: 10, overflow: 'hidden' },
  addBtnGrad: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
