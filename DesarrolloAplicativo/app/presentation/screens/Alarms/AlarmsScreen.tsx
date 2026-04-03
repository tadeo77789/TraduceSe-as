import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Alarma } from '../../../types';

const MOCK_ALARMS: Alarma[] = [
  { id_alarma: 1, hora: '11:00', mensaje: 'Es hora de traducir', activa: true, id_usuario: 1 },
  { id_alarma: 2, hora: '05:56', mensaje: 'Es hora de traducir', activa: false, id_usuario: 1 },
  { id_alarma: 3, hora: '09:12', mensaje: 'Es hora de traducir', activa: true, id_usuario: 1 },
];

// Mini reloj analógico para selección de hora
const ClockPicker: React.FC<{
  hour: number;
  minute: number;
  isAm: boolean;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  onAmPmChange: (am: boolean) => void;
}> = ({ hour, minute, isAm, onAmPmChange }) => {
  const radius = 85;
  const hourAngle = ((hour % 12) / 12) * 360 - 90;
  const minuteAngle = (minute / 60) * 360 - 90;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const hx = radius * Math.cos(toRad(hourAngle));
  const hy = radius * Math.sin(toRad(hourAngle));

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
        {/* Manecilla de hora */}
        <View style={[clock.hand, { transform: [{ rotate: `${hourAngle + 90}deg` }] }]} />
        {/* Círculo central */}
        <View style={clock.center} />
      </View>
    </View>
  );
};

const clock = StyleSheet.create({
  container: { alignItems: 'center', padding: 16, backgroundColor: Colors.background, borderRadius: 16 },
  display: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 4 },
  timeText: { fontSize: 40, fontWeight: '300', color: Colors.primary, width: 52, textAlign: 'center' },
  colon: { fontSize: 36, color: Colors.primary, marginBottom: 4 },
  ampm: { marginLeft: 8 },
  ampmBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  ampmActive: { backgroundColor: '#FECDD3' },
  ampmText: { fontSize: 13, color: Colors.textSecondary },
  ampmTextActive: { color: Colors.error, fontWeight: '700' },
  face: {
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  number: {
    position: 'absolute', width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center', borderRadius: 12,
  },
  numberSelected: { backgroundColor: Colors.primary },
  numberText: { fontSize: 12, color: Colors.textSecondary },
  numberTextSelected: { color: '#fff', fontWeight: '700' },
  hand: {
    position: 'absolute', width: 60, height: 2,
    backgroundColor: Colors.primary, borderRadius: 1,
    left: 90, top: 89, transformOrigin: 'left center',
  },
  center: {
    position: 'absolute', width: 10, height: 10,
    borderRadius: 5, backgroundColor: Colors.primary,
  },
});

export const AlarmsScreen: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarma[]>(MOCK_ALARMS);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerHour, setPickerHour] = useState(7);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [isAm, setIsAm] = useState(true);

  const toggleAlarm = (id: number) => {
    setAlarms(prev =>
      prev.map(a => (a.id_alarma === id ? { ...a, activa: !a.activa } : a))
    );
  };

  const deleteAlarm = (id: number) => {
    Alert.alert('Eliminar', '¿Eliminar esta alarma?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () =>
        setAlarms(prev => prev.filter(a => a.id_alarma !== id))
      },
    ]);
  };

  const addAlarm = () => {
    const newAlarm: Alarma = {
      id_alarma: Date.now(),
      hora: `${String(pickerHour).padStart(2, '0')}:${String(pickerMinute).padStart(2, '0')}`,
      mensaje: 'Es hora de traducir',
      activa: true,
      id_usuario: 1,
    };
    setAlarms(prev => [...prev, newAlarm]);
    setShowPicker(false);
  };

  return (
    <View style={styles.root}>
      <AppHeader />
      <View style={styles.container}>
        <FlatList
          data={alarms}
          keyExtractor={item => String(item.id_alarma)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.alarmCard}>
              <Ionicons name="notifications-outline" size={28} color={Colors.textPrimary} style={styles.alarmIcon} />
              <View style={styles.alarmInfo}>
                <Text style={styles.alarmTime}>{item.hora}</Text>
                <Text style={styles.alarmMsg}>{item.mensaje}</Text>
                <View style={styles.alarmActions}>
                  <TouchableOpacity
                    style={styles.alarmBtn}
                    onPress={() => deleteAlarm(item.id_alarma)}
                  >
                    <Text style={styles.alarmBtnText}>eliminar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.alarmBtn, styles.editBtn]}>
                    <Text style={[styles.alarmBtnText, styles.editBtnText]}>editar</Text>
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
          )}
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
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addAlarm}>
              <Text style={styles.okText}>agregar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, flexDirection: 'row', padding: 12, gap: 12 },
  list: { flex: 1, gap: 10 },

  alarmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  alarmIcon: { marginRight: 4 },
  alarmInfo: { flex: 1 },
  alarmTime: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  alarmMsg: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  alarmActions: { flexDirection: 'row', gap: 8 },
  alarmBtn: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  alarmBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  editBtn: { backgroundColor: Colors.textSecondary },
  editBtnText: { color: '#fff' },

  pickerPanel: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 200,
    alignSelf: 'flex-start',
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelText: { fontSize: 14, color: Colors.textSecondary },
  okText: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
});
