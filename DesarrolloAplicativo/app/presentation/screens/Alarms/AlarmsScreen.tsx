/**
 * @file AlarmsScreen.tsx
 * @description Pantalla de gestión de alarmas de práctica.
 *
 * Layout móvil:
 *  ┌──────────────────────────┐
 *  │ AppHeader                │
 *  ├──────────────────────────┤
 *  │ Panel "Nueva / Editar"   │ ← fijo (no scrollea)
 *  │  reloj interactivo       │
 *  │  [−] minutos [+]  AM/PM  │
 *  │  nombre de alarma        │
 *  │  REPETIR: L M X J V S D  │
 *  │  [Agregar / Guardar]     │
 *  ├──────────────────────────┤
 *  │ Lista "Mis alarmas"      │ ← flex:1, scrollea
 *  └──────────────────────────┘
 *
 * @todo Conectar con endpoints de alarmas del backend.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
  ListRenderItem,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';
import { useColors, useTheme } from '../../../state/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alarma } from '../../../types';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type AmPm = 'AM' | 'PM';
type AlarmaExtended = Alarma & { dias?: string[]; ampm?: AmPm };

// ─── Datos mock ───────────────────────────────────────────────────────────────
const MOCK_ALARMS: AlarmaExtended[] = [
  { id_alarma: 1, hora: '11:00', ampm: 'AM', mensaje: 'Práctica de señas diaria',      activa: true,  id_usuario: 1, dias: ['Lun', 'Mié', 'Vie'] },
  { id_alarma: 2, hora: '05:56', ampm: 'AM', mensaje: 'Repasar el alfabeto LSC',       activa: false, id_usuario: 1, dias: ['Mar', 'Jue'] },
  { id_alarma: 3, hora: '09:12', ampm: 'AM', mensaje: 'Sesión de traducción matutina', activa: true,  id_usuario: 1, dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'] },
];

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const keyExtractor = (item: AlarmaExtended) => String(item.id_alarma);

// ─── Reloj analógico interactivo ─────────────────────────────────────────────
/**
 * Fix de la manecilla en React Native nativo:
 * - transformOrigin no existe en RN nativo (solo web).
 * - La solución es un contenedor de ancho 2×handLength centrado en el
 *   centro del reloj. Al rotar el contenedor, el pivote queda en el centro
 *   del reloj. Solo la mitad derecha es la manecilla visible.
 *
 * Ángulo correcto: ((hour % 12) / 12) * 360 - 90
 *   hora 12 → -90° → apunta arriba  ✓
 *   hora  3 →   0° → apunta derecha ✓
 *   hora  6 →  90° → apunta abajo   ✓
 */
const ClockPicker: React.FC<{
  hour: number;
  minute: number;
  isAm: boolean;
  compact?: boolean;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  onAmPmChange: (am: boolean) => void;
}> = React.memo(function ClockPicker({
  hour, minute, isAm, compact = false,
  onHourChange, onMinuteChange, onAmPmChange,
}) {
  const C = useColors();
  const faceSize  = compact ? 136 : 180;
  const radius    = compact ? 54  : 72;
  const handLen   = compact ? 44  : 58;
  const toRad     = (deg: number) => (deg * Math.PI) / 180;

  const handAngle = ((hour % 12) / 12) * 360 - 90;

  const stepMinute = (delta: number) =>
    onMinuteChange((minute + delta + 60) % 60);

  const ClockFace = (
    <View style={[clk.face, { width: faceSize, height: faceSize, borderRadius: faceSize / 2, backgroundColor: C.primaryBg }]}>

      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
        const a = (i / 12) * 360 - 90;
        const x = radius * Math.cos(toRad(a));
        const y = radius * Math.sin(toRad(a));
        const sel = n === hour || (hour === 12 && n === 12);
        return (
          <TouchableOpacity
            key={n}
            style={[clk.num, { transform: [{ translateX: x }, { translateY: y }] }, sel && clk.numSel]}
            onPress={() => onHourChange(n)}
            activeOpacity={0.65}
          >
            <Text style={[clk.numTxt, { color: C.textSecondary }, sel && clk.numTxtSel]}>{n}</Text>
          </TouchableOpacity>
        );
      })}

      <View
        style={{
          position: 'absolute',
          width: handLen * 2,
          height: 3,
          left: faceSize / 2 - handLen,
          top:  faceSize / 2 - 1.5,
          transform: [{ rotate: `${handAngle}deg` }],
        }}
      >
        <View style={{
          position: 'absolute',
          right: 0,
          width: handLen,
          height: 3,
          backgroundColor: Colors.primary,
          borderRadius: 2,
        }} />
      </View>

      <LinearGradient colors={['#9333EA', '#7C3AED']} style={clk.center} />
    </View>
  );

  const Controls = (
    <View style={clk.controls}>
      <View style={clk.display}>
        <Text style={[clk.timeTxt, compact && clk.timeTxtSm]}>
          {String(hour).padStart(2, '0')}
        </Text>
        <Text style={[clk.colon, compact && clk.colonSm]}>:</Text>
        <Text style={[clk.timeTxt, compact && clk.timeTxtSm]}>
          {String(minute).padStart(2, '0')}
        </Text>
      </View>

      <View style={clk.minRow}>
        <TouchableOpacity style={[clk.minBtn, { backgroundColor: C.primaryBg }]} onPress={() => stepMinute(-5)}>
          <Ionicons name="remove" size={16} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={[clk.minLbl, { color: C.textSecondary }]}>min</Text>
        <TouchableOpacity style={[clk.minBtn, { backgroundColor: C.primaryBg }]} onPress={() => stepMinute(5)}>
          <Ionicons name="add" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={clk.ampm}>
        <TouchableOpacity style={[clk.ampmBtn, { backgroundColor: C.inputBg }, isAm && clk.ampmActive]} onPress={() => onAmPmChange(true)}>
          <Text style={[clk.ampmTxt, { color: C.textSecondary }, isAm && clk.ampmTxtActive]}>AM</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[clk.ampmBtn, { backgroundColor: C.inputBg }, !isAm && clk.ampmActive]} onPress={() => onAmPmChange(false)}>
          <Text style={[clk.ampmTxt, { color: C.textSecondary }, !isAm && clk.ampmTxtActive]}>PM</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (compact) {
    return (
      <View style={clk.rowContainer}>
        {ClockFace}
        {Controls}
      </View>
    );
  }

  // Tablet: vertical
  return (
    <View style={clk.colContainer}>
      {ClockFace}
      <View style={[clk.controls, { flexDirection: 'row', gap: 16, marginTop: 14 }]}>
        <View style={clk.display}>
          <Text style={clk.timeTxt}>{String(hour).padStart(2, '0')}</Text>
          <Text style={clk.colon}>:</Text>
          <Text style={clk.timeTxt}>{String(minute).padStart(2, '0')}</Text>
        </View>
        <View style={clk.minRow}>
          <TouchableOpacity style={[clk.minBtn, { backgroundColor: C.primaryBg }]} onPress={() => stepMinute(-5)}>
            <Ionicons name="remove" size={16} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={[clk.minLbl, { color: C.textSecondary }]}>min</Text>
          <TouchableOpacity style={[clk.minBtn, { backgroundColor: C.primaryBg }]} onPress={() => stepMinute(5)}>
            <Ionicons name="add" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={clk.ampm}>
          <TouchableOpacity style={[clk.ampmBtn, { backgroundColor: C.inputBg }, isAm && clk.ampmActive]} onPress={() => onAmPmChange(true)}>
            <Text style={[clk.ampmTxt, { color: C.textSecondary }, isAm && clk.ampmTxtActive]}>AM</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[clk.ampmBtn, { backgroundColor: C.inputBg }, !isAm && clk.ampmActive]} onPress={() => onAmPmChange(false)}>
            <Text style={[clk.ampmTxt, { color: C.textSecondary }, !isAm && clk.ampmTxtActive]}>PM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const clk = StyleSheet.create({
  colContainer: { alignItems: 'center' },
  rowContainer: { flexDirection: 'row', alignItems: 'center', gap: 14 },

  face: {
    backgroundColor: '#F5F3FF',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primaryLighter,
  },
  num: {
    position: 'absolute', width: 28, height: 28,
    alignItems: 'center', justifyContent: 'center', borderRadius: 14,
  },
  numSel:    { backgroundColor: Colors.primary },
  numTxt:    { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  numTxtSel: { color: '#fff', fontWeight: '800' },
  center:    { position: 'absolute', width: 12, height: 12, borderRadius: 6 },

  controls:   { alignItems: 'center', gap: 8 },
  display:    { flexDirection: 'row', alignItems: 'center', gap: 2 },
  timeTxt:    { fontSize: 36, fontWeight: '300', color: Colors.primary, width: 48, textAlign: 'center' },
  timeTxtSm:  { fontSize: 28, width: 38 },
  colon:      { fontSize: 32, color: Colors.primary, marginBottom: 4 },
  colonSm:    { fontSize: 24 },

  minRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  minBtn:  { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryBg ?? '#EDE9FE', alignItems: 'center', justifyContent: 'center' },
  minLbl:  { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', width: 24, textAlign: 'center' },

  ampm:          { flexDirection: 'row', gap: 6 },
  ampmBtn:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: '#F3F4F6' },
  ampmActive:    { backgroundColor: Colors.primary },
  ampmTxt:       { fontSize: 13, color: Colors.textSecondary, fontWeight: '700' },
  ampmTxtActive: { color: '#fff' },
});

// ─── Tarjeta de alarma ────────────────────────────────────────────────────────
const AlarmCard: React.FC<{
  item: AlarmaExtended;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit:   (item: AlarmaExtended) => void;
}> = React.memo(({ item, onToggle, onDelete, onEdit }) => {
  const C = useColors();
  return (
  <View style={[styles.alarmCard, { backgroundColor: C.surface }]}>
    <LinearGradient
      colors={item.activa ? ['#EDE9FE', '#DDD6FE'] : [C.inputBg, C.surface] as [string,string]}
      style={styles.alarmIconBg}
    >
      <Ionicons name="alarm-outline" size={22} color={item.activa ? Colors.primary : C.textSecondary} />
    </LinearGradient>

    <View style={styles.alarmInfo}>
      {/* Hora + badge AM/PM */}
      <View style={styles.alarmTimeRow}>
        <Text style={[styles.alarmTime, { color: C.textPrimary }, !item.activa && styles.alarmTimeOff]}>
          {item.hora}
        </Text>
        {item.ampm && (
          <View style={[styles.ampmBadge, { backgroundColor: C.primaryBg }, item.ampm === 'PM' && styles.ampmBadgePm]}>
            <Text style={[styles.ampmBadgeTxt, item.ampm === 'PM' && styles.ampmBadgeTxtPm]}>
              {item.ampm}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.alarmMsg, { color: C.textSecondary }]} numberOfLines={1}>{item.mensaje}</Text>

      {/* Días */}
      {item.dias && item.dias.length > 0 && (
        <View style={styles.diasRow}>
          {DIAS_SEMANA.map(dia => {
            const active = item.dias!.includes(dia);
            return (
              <View key={dia} style={[styles.diaBadge, { backgroundColor: C.inputBg }, active && [styles.diaBadgeActive, { backgroundColor: C.primaryBg }]]}>
                <Text style={[styles.diaTxt, { color: C.textHint }, active && styles.diaTxtActive]}>{dia[0]}</Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.alarmActions}>
        <TouchableOpacity style={[styles.alarmBtnDelete, { backgroundColor: 'rgba(239,68,68,0.12)' }]} onPress={() => onDelete(item.id_alarma)}>
          <Ionicons name="trash-outline" size={13} color={Colors.danger} />
          <Text style={styles.alarmBtnDeleteTxt}>Eliminar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.alarmBtnEdit, { backgroundColor: C.primaryBg }]} onPress={() => onEdit(item)}>
          <Ionicons name="create-outline" size={13} color={Colors.primary} />
          <Text style={styles.alarmBtnEditTxt}>Editar</Text>
        </TouchableOpacity>
      </View>
    </View>

    <Switch
      value={item.activa}
      onValueChange={() => onToggle(item.id_alarma)}
      trackColor={{ false: Colors.toggleOff, true: Colors.toggleOn }}
      thumbColor="#fff"
    />
  </View>
  );
});

// ─── Pantalla principal ───────────────────────────────────────────────────────
export const AlarmsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const C = useColors();
  const { isDark } = useTheme();

  const [alarms,       setAlarms]       = useState<AlarmaExtended[]>(MOCK_ALARMS);
  const [pickerHour,   setPickerHour]   = useState(7);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [isAm,         setIsAm]         = useState(true);
  const [alarmName,    setAlarmName]    = useState('');
  const [selectedDias, setSelectedDias] = useState<string[]>(['Lun', 'Mié', 'Vie']);
  const [editingId,    setEditingId]    = useState<number | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleAlarm = useCallback((id: number) =>
    setAlarms(prev => prev.map(a => a.id_alarma === id ? { ...a, activa: !a.activa } : a))
  , []);

  const deleteAlarm = useCallback((id: number) => {
    Alert.alert('Eliminar alarma', '¿Deseas eliminar esta alarma?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () =>
          setAlarms(prev => prev.filter(a => a.id_alarma !== id)) },
    ]);
  }, []);

  const handleEdit = useCallback((item: AlarmaExtended) => {
    const [h, m] = item.hora.split(':').map(Number);
    setPickerHour(h || 7);
    setPickerMinute(m || 0);
    setIsAm(item.ampm !== 'PM');
    setSelectedDias(item.dias ?? []);
    setAlarmName(item.mensaje);
    setEditingId(item.id_alarma);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setAlarmName('');
    setPickerHour(7);
    setPickerMinute(0);
    setIsAm(true);
    setSelectedDias(['Lun', 'Mié', 'Vie']);
  }, []);

  const toggleDia = useCallback((dia: string) =>
    setSelectedDias(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    )
  , []);

  const handleSave = useCallback(() => {
    const data = {
      hora:    `${String(pickerHour).padStart(2, '0')}:${String(pickerMinute).padStart(2, '0')}`,
      ampm:    (isAm ? 'AM' : 'PM') as AmPm,
      mensaje: alarmName.trim() || 'Práctica de señas',
      dias:    selectedDias,
    };
    if (editingId !== null) {
      setAlarms(prev => prev.map(a => a.id_alarma === editingId ? { ...a, ...data } : a));
      cancelEdit();
    } else {
      setAlarms(prev => [...prev, { id_alarma: Date.now(), activa: true, id_usuario: 1, ...data }]);
      setAlarmName('');
    }
  }, [pickerHour, pickerMinute, isAm, alarmName, selectedDias, editingId, cancelEdit]);

  const renderItem: ListRenderItem<AlarmaExtended> = useCallback(({ item }) => (
    <AlarmCard item={item} onToggle={toggleAlarm} onDelete={deleteAlarm} onEdit={handleEdit} />
  ), [toggleAlarm, deleteAlarm, handleEdit]);

  // ── Contenido del picker (reutilizado móvil + tablet) ─────────────────────
  const pickerContent = (
    <>
      <ClockPicker
        hour={pickerHour}
        minute={pickerMinute}
        isAm={isAm}
        compact={!isTablet}
        onHourChange={setPickerHour}
        onMinuteChange={setPickerMinute}
        onAmPmChange={setIsAm}
      />

      {/* Nombre de la alarma */}
      <View style={[styles.nameField, { borderColor: C.border, backgroundColor: C.inputBg }]}>
        <Ionicons name="pencil-outline" size={14} color={C.textSecondary} style={{ marginTop: 1 }} />
        <TextInput
          style={[styles.nameInput, { color: C.textPrimary }]}
          value={alarmName}
          onChangeText={setAlarmName}
          placeholder="Nombre de la alarma"
          placeholderTextColor={C.textHint}
          maxLength={40}
          returnKeyType="done"
          textAlignVertical="center"
          includeFontPadding={false}
        />
      </View>

      {/* Días */}
      <View style={styles.diasBlock}>
        <Text style={[styles.diasLabel, { color: C.textSecondary }]}>REPETIR</Text>
        <View style={styles.diasGrid}>
          {DIAS_SEMANA.map(dia => (
            <TouchableOpacity
              key={dia}
              style={[styles.diaSelectorBtn, { backgroundColor: C.inputBg, borderColor: C.border }, selectedDias.includes(dia) && styles.diaSelectorBtnActive]}
              onPress={() => toggleDia(dia)}
            >
              <Text style={[styles.diaSelectorTxt, { color: C.textSecondary }, selectedDias.includes(dia) && styles.diaSelectorTxtActive]}>
                {dia[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Botones acción */}
      <View style={styles.actionRow}>
        {editingId !== null && (
          <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: C.inputBg, borderColor: C.border }]} onPress={cancelEdit}>
            <Text style={[styles.cancelBtnTxt, { color: C.textSecondary }]}>Cancelar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.addBtn, editingId !== null && styles.addBtnFlex]} onPress={handleSave}>
          <LinearGradient colors={['#9333EA', '#7C3AED']} style={styles.addBtnGrad}>
            <Ionicons name={editingId !== null ? 'checkmark-circle-outline' : 'add-circle-outline'} size={18} color="#fff" />
            <Text style={styles.addBtnTxt}>{editingId !== null ? 'Guardar cambios' : 'Agregar alarma'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );

  // ── Cabecera lista ────────────────────────────────────────────────────────
  const listHeader = (
    <View style={styles.listHeader}>
      <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Mis alarmas</Text>
      <View style={[styles.countBadge, { backgroundColor: C.primaryBg }]}>
        <Text style={styles.countTxt}>{alarms.filter(a => a.activa).length} activas</Text>
      </View>
    </View>
  );

  // ── Tablet ────────────────────────────────────────────────────────────────
  if (isTablet) {
    return (
      <View style={[styles.root, { backgroundColor: C.backgroundGray }]}>
        <AppHeader />
        <View style={styles.tabletContainer}>
          <View style={styles.listSection}>
            {listHeader}
            <FlatList data={alarms} keyExtractor={keyExtractor} contentContainerStyle={styles.listContent} renderItem={renderItem} showsVerticalScrollIndicator={false} />
          </View>
          <View style={[styles.tabletPanel, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.panelTitle, { color: C.textPrimary }]}>{editingId !== null ? 'Editar alarma' : 'Nueva alarma'}</Text>
            {pickerContent}
          </View>
        </View>
      </View>
    );
  }

  // ── Móvil ─────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: C.backgroundGray }]}>
      <AppHeader />

      {/* Panel fijo */}
      <LinearGradient
        colors={isDark
          ? [C.surface, C.inputBg] as [string, string]
          : editingId !== null ? ['#FFF7ED', '#FEF3C7'] : ['#F5F3FF', '#EDE9FE']
        }
        style={styles.mobilePanel}
      >
        <View style={styles.panelHeader}>
          <LinearGradient
            colors={editingId !== null ? ['#D97706', '#F59E0B'] : ['#9333EA', '#7C3AED']}
            style={styles.panelIcon}
          >
            <Ionicons name={editingId !== null ? 'create' : 'alarm'} size={15} color="#fff" />
          </LinearGradient>
          <Text style={[styles.panelTitle, { color: C.textPrimary }]}>{editingId !== null ? 'Editar alarma' : 'Nueva alarma'}</Text>
        </View>
        {pickerContent}
      </LinearGradient>

      <View style={[styles.divider, { backgroundColor: C.border }]} />

      {/* Lista */}
      <View style={styles.listSection}>
        {listHeader}
        <FlatList data={alarms} keyExtractor={keyExtractor} contentContainerStyle={styles.listContent} renderItem={renderItem} showsVerticalScrollIndicator={false} />
      </View>
    </View>
  );
};

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray ?? '#F8F9FC' },

  // Tablet
  tabletContainer: { flex: 1, flexDirection: 'row', padding: 16, gap: 14 },
  tabletPanel: {
    backgroundColor: '#fff', borderRadius: 22, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
    minWidth: 260, alignSelf: 'flex-start',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 14, elevation: 6, gap: 14,
  },

  // Panel móvil fijo
  mobilePanel: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, gap: 10 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  panelIcon:   { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  panelTitle:  { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },

  // Campo nombre
  nameField: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: Colors.border,
    height: 38,
  },
  nameInput: {
    flex: 1, fontSize: 13, color: Colors.textPrimary,
    paddingVertical: 0, alignSelf: 'stretch',
    textAlignVertical: 'center',
    includeFontPadding: false,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  } as any,

  // Días
  diasBlock: { gap: 4 },
  diasLabel: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.8 },
  diasGrid:  { flexDirection: 'row', gap: 5 },
  diaSelectorBtn:       { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 1, borderColor: Colors.border },
  diaSelectorBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  diaSelectorTxt:       { fontSize: 10, color: Colors.textSecondary, fontWeight: '700' },
  diaSelectorTxtActive: { color: '#fff' },

  // Botones acción
  actionRow:  { flexDirection: 'row', gap: 8, alignItems: 'center' },
  cancelBtn:  { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: 'rgba(255,255,255,0.8)' },
  cancelBtnTxt: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  addBtn:     { borderRadius: 12, overflow: 'hidden', flex: 1 },
  addBtnFlex: { flex: 1 },
  addBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11, borderRadius: 12 },
  addBtnTxt:  { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Divisor
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },

  // Lista
  listSection: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  listHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  countBadge:   { backgroundColor: Colors.primaryBg ?? '#EDE9FE', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  countTxt:     { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  listContent:  { gap: 10, paddingBottom: 16 },

  // Tarjeta
  alarmCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 18, padding: 14, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  alarmIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  alarmInfo:   { flex: 1 },

  alarmTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  alarmTime:    { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.5 },
  alarmTimeOff: { color: Colors.textHint },
  ampmBadge:    { backgroundColor: Colors.primaryBg ?? '#EDE9FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  ampmBadgePm:  { backgroundColor: '#FEF3C7' },
  ampmBadgeTxt: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  ampmBadgeTxtPm: { color: '#D97706' },

  alarmMsg: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },

  diasRow:        { flexDirection: 'row', gap: 4, marginBottom: 8 },
  diaBadge:       { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  diaBadgeActive: { backgroundColor: Colors.primaryBg ?? '#EDE9FE' },
  diaTxt:         { fontSize: 9, color: Colors.textHint, fontWeight: '700' },
  diaTxtActive:   { color: Colors.primary },

  alarmActions: { flexDirection: 'row', gap: 8 },
  alarmBtnDelete: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: Colors.danger, backgroundColor: '#FFF5F5' },
  alarmBtnDeleteTxt: { color: Colors.danger, fontSize: 11, fontWeight: '600' },
  alarmBtnEdit:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.primaryBg ?? '#EDE9FE' },
  alarmBtnEditTxt: { color: Colors.primary, fontSize: 11, fontWeight: '600' },
});
