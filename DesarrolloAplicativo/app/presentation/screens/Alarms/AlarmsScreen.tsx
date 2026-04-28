/**
 * @file AlarmsScreen.tsx
 * @ubicacion app/presentation/screens/Alarms/AlarmsScreen.tsx
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

// ─── Importaciones ────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react'; // React base + hooks de estado y memorización de funciones

import {
  View,               // Contenedor genérico (equivale a un <div>)
  Text,               // Componente para mostrar texto en pantalla
  TextInput,          // Campo de entrada de texto editable
  StyleSheet,         // Utilidad para crear estilos optimizados en React Native
  FlatList,           // Lista virtualizada de alto rendimiento (solo renderiza lo visible)
  TouchableOpacity,   // Botón con efecto de opacidad al presionar
  Switch,             // Toggle (interruptor) de activado/desactivado
  Alert,              // Diálogo nativo de alerta con botones (solo funciona en iOS/Android)
  ListRenderItem,     // Tipo TypeScript para la función que renderiza cada fila del FlatList
  useWindowDimensions,// Hook que devuelve el ancho y alto actuales de la ventana/pantalla
  Platform,           // Detecta en qué plataforma corre la app: 'ios', 'android' o 'web'
} from 'react-native';

import { AppHeader } from '../../components/common/AppHeader'; // Barra superior con logo — ubicación: app/presentation/components/common/AppHeader.tsx
import { Colors } from '../../../constants/colors';            // Paleta de colores del diseño — ubicación: app/constants/colors.ts
import { useColors, useTheme } from '../../../state/ThemeContext'; // Hooks para obtener colores del tema activo y saber si es modo oscuro — ubicación: app/state/ThemeContext.tsx
import { useTranslation } from '../../../i18n';
import { Ionicons } from '@expo/vector-icons';                 // Librería de íconos vectoriales de Expo (alarm, trash, add, etc.)
import { LinearGradient } from 'expo-linear-gradient';         // Componente para fondos con degradado de color
import { Alarma } from '../../../types';                       // Interfaz TypeScript del tipo Alarma — ubicación: app/types/index.ts

// ─── Tipos locales ────────────────────────────────────────────────────────────

type AmPm = 'AM' | 'PM'; // Tipo union: solo acepta los valores 'AM' o 'PM'

type AlarmaExtended = Alarma & { dias?: string[]; ampm?: AmPm }; // Extiende la interfaz Alarma (de types/index.ts) agregando días de repetición y formato AM/PM

// ─── Datos de prueba (mock) ───────────────────────────────────────────────────
// Mientras no esté conectado el backend, la pantalla usa estos datos fijos
// TODO: reemplazar por llamada a ENDPOINTS.alarms (app/config/api.config.ts)

const MOCK_ALARMS: AlarmaExtended[] = [
  // Alarma 1: activa, suena lunes/miércoles/viernes a las 11:00 AM
  { id_alarma: 1, hora: '11:00', ampm: 'AM', mensaje: 'Práctica de señas diaria',      activa: true,  id_usuario: 1, dias: ['Lun', 'Mié', 'Vie'] },
  // Alarma 2: desactivada, suena martes/jueves a las 5:56 AM
  { id_alarma: 2, hora: '05:56', ampm: 'AM', mensaje: 'Repasar el alfabeto LSC',       activa: false, id_usuario: 1, dias: ['Mar', 'Jue'] },
  // Alarma 3: activa, suena todos los días de semana a las 9:12 AM
  { id_alarma: 3, hora: '09:12', ampm: 'AM', mensaje: 'Sesión de traducción matutina', activa: true,  id_usuario: 1, dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'] },
];

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']; // Array con los 7 días de la semana en orden, usado para mostrar los botones de repetición

const keyExtractor = (item: AlarmaExtended) => String(item.id_alarma); // Función que convierte el id numérico de la alarma en string; FlatList la necesita para identificar cada fila de forma única

// ─── Componente ClockPicker — Reloj analógico interactivo ────────────────────
/**
 * Muestra un reloj analógico donde el usuario puede tocar las horas (1-12)
 * y ajustar los minutos con botones +5 / -5.
 *
 * Truco de la manecilla en React Native nativo:
 * - transformOrigin no existe en RN nativo (solo funciona en web).
 * - Se usa un contenedor de ancho 2×handLength centrado en el reloj.
 *   Al rotar el contenedor, el pivote queda en el centro del reloj.
 *   Solo la mitad derecha del contenedor es la manecilla visible.
 *
 * Fórmula del ángulo: ((hour % 12) / 12) * 360 - 90
 *   hora 12 → -90° → apunta arriba  ✓
 *   hora  3 →   0° → apunta derecha ✓
 *   hora  6 →  90° → apunta abajo   ✓
 */
const ClockPicker: React.FC<{  // Declaración del componente ClockPicker como componente funcional de React con TypeScript
  hour: number;                 // Hora actual seleccionada (1-12)
  minute: number;               // Minuto actual seleccionado (0-59)
  isAm: boolean;                // true = AM, false = PM
  compact?: boolean;            // Si true, muestra reloj pequeño en fila (móvil); si false, muestra grande en columna (tablet)
  onHourChange: (h: number) => void;   // Callback que se llama cuando el usuario toca un número en el reloj
  onMinuteChange: (m: number) => void; // Callback que se llama cuando el usuario presiona +5 o -5 minutos
  onAmPmChange: (am: boolean) => void; // Callback que se llama cuando el usuario cambia entre AM y PM
}> = React.memo(function ClockPicker({ // React.memo evita re-renderizados innecesarios si las props no cambian
  hour, minute, isAm, compact = false, // Desestructura todas las props; compact tiene valor por defecto false
  onHourChange, onMinuteChange, onAmPmChange, // Desestructura los callbacks de cambio
}) {
  const C = useColors(); // Obtiene el objeto de colores del tema activo (claro u oscuro) — hook definido en app/state/ThemeContext.tsx

  const faceSize  = compact ? 136 : 180; // Tamaño del círculo del reloj: 136px en móvil, 180px en tablet
  const radius    = compact ? 54  : 72;  // Radio del círculo donde se posicionan los números del reloj
  const handLen   = compact ? 44  : 58;  // Longitud de la manecilla horaria en píxeles

  const toRad = (deg: number) => (deg * Math.PI) / 180; // Función auxiliar: convierte grados a radianes para las funciones trigonométricas Math.cos y Math.sin

  const handAngle = ((hour % 12) / 12) * 360 - 90; // Calcula el ángulo de rotación de la manecilla: hora 12 = -90° (arriba), hora 3 = 0° (derecha), hora 6 = 90° (abajo)

  const stepMinute = (delta: number) =>          // Función para avanzar o retroceder los minutos en pasos de 5
    onMinuteChange((minute + delta + 60) % 60);  // El +60 antes del módulo evita valores negativos cuando se resta 5 al minuto 0

  // ── Cara del reloj (JSX guardado en variable para reutilizarlo en móvil y tablet) ──
  const ClockFace = (
    // Círculo principal del reloj con tamaño dinámico y color de fondo del tema
    <View style={[clk.face, { width: faceSize, height: faceSize, borderRadius: faceSize / 2, backgroundColor: C.primaryBg }]}>
      {/* Renderiza los 12 números del reloj (12, 1, 2, ..., 11) posicionados en círculo */}
      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
        const a = (i / 12) * 360 - 90;          // Ángulo de cada número: empieza en -90° (arriba) y gira 30° por número
        const x = radius * Math.cos(toRad(a));   // Posición horizontal del número usando coseno del ángulo
        const y = radius * Math.sin(toRad(a));   // Posición vertical del número usando seno del ángulo
        const sel = n === hour || (hour === 12 && n === 12); // true si este número es la hora actualmente seleccionada
        return (
          // Botón de cada número del reloj, posicionado absolutamente mediante translateX/Y
          <TouchableOpacity
            key={n}                              // Key única para React (el número del reloj)
            style={[clk.num, { transform: [{ translateX: x }, { translateY: y }] }, sel && clk.numSel]} // Estilo base + posición calculada + fondo púrpura si está seleccionado
            onPress={() => onHourChange(n)}      // Al presionar, informa al padre que la hora cambió a n
            activeOpacity={0.65}                 // Reduce opacidad al 65% mientras se presiona
          >
            <Text style={[clk.numTxt, { color: C.textSecondary }, sel && clk.numTxtSel]}>{n}</Text>{/* Número del reloj; texto blanco si está seleccionado */}
          </TouchableOpacity>
        );
      })}

      {/* Contenedor de la manecilla — ocupa ancho 2×handLen centrado en el reloj */}
      <View
        style={{
          position: 'absolute',             // Posicionado absolutamente dentro del círculo del reloj
          width: handLen * 2,               // Ancho doble para que el pivote quede en el centro al rotar
          height: 3,                        // Grosor de la manecilla en píxeles
          left: faceSize / 2 - handLen,     // Centra horizontalmente: mitad del reloj menos la mitad del ancho
          top:  faceSize / 2 - 1.5,         // Centra verticalmente: mitad del reloj menos la mitad del grosor
          transform: [{ rotate: `${handAngle}deg` }], // Rota el contenedor al ángulo calculado de la hora
        }}
      >
        {/* La manecilla real: solo ocupa la mitad derecha del contenedor */}
        <View style={{
          position: 'absolute',             // Posicionada en el extremo derecho del contenedor
          right: 0,                         // Alineada al borde derecho (la mitad visible)
          width: handLen,                   // Ocupa exactamente la mitad del ancho del contenedor
          height: 3,                        // Misma altura que el contenedor
          backgroundColor: Colors.primary, // Color púrpura principal — definido en app/constants/colors.ts
          borderRadius: 2,                  // Esquinas ligeramente redondeadas en la punta
        }} />
      </View>

      {/* Punto central del reloj con degradado púrpura — estilo clk.center definido en línea 226 */}
      <LinearGradient colors={['#9333EA', '#7C3AED']} style={clk.center} />
    </View>
  );

  // ── Controles de hora/minuto/AM-PM (también reutilizado en móvil y tablet) ──
  const Controls = (
    <View style={clk.controls}>{/* Contenedor vertical de todos los controles — estilo en línea 228 */}

      {/* Pantalla digital que muestra HH:MM */}
      <View style={clk.display}>{/* Fila horizontal con hora, dos puntos y minuto — estilo en línea 229 */}
        <Text style={[clk.timeTxt, compact && clk.timeTxtSm]}>{/* Hora: fuente grande en tablet, mediana en móvil */}
          {String(hour).padStart(2, '0')}{/* Formatea la hora con cero adelante si es de un dígito: 7 → "07" */}
        </Text>
        <Text style={[clk.colon, compact && clk.colonSm]}>:</Text>{/* Separador de dos puntos entre hora y minuto */}
        <Text style={[clk.timeTxt, compact && clk.timeTxtSm]}>{/* Minuto: misma fuente que la hora */}
          {String(minute).padStart(2, '0')}{/* Formatea el minuto con cero adelante: 5 → "05" */}
        </Text>
      </View>

      {/* Fila de botones para ajustar minutos en pasos de 5 */}
      <View style={clk.minRow}>{/* Contenedor horizontal: [−] min [+] — estilo en línea 235 */}
        <TouchableOpacity style={[clk.minBtn, { backgroundColor: C.primaryBg }]} onPress={() => stepMinute(-5)}>{/* Botón para restar 5 minutos */}
          <Ionicons name="remove" size={16} color={Colors.primary} />{/* Ícono de guión/menos */}
        </TouchableOpacity>
        <Text style={[clk.minLbl, { color: C.textSecondary }]}>min</Text>{/* Etiqueta "min" entre los dos botones */}
        <TouchableOpacity style={[clk.minBtn, { backgroundColor: C.primaryBg }]} onPress={() => stepMinute(5)}>{/* Botón para sumar 5 minutos */}
          <Ionicons name="add" size={16} color={Colors.primary} />{/* Ícono de más */}
        </TouchableOpacity>
      </View>

      {/* Selector AM / PM */}
      <View style={clk.ampm}>{/* Fila horizontal con los dos botones AM y PM — estilo en línea 239 */}
        <TouchableOpacity style={[clk.ampmBtn, { backgroundColor: C.inputBg }, isAm && clk.ampmActive]} onPress={() => onAmPmChange(true)}>{/* Botón AM: fondo púrpura si isAm es true */}
          <Text style={[clk.ampmTxt, { color: C.textSecondary }, isAm && clk.ampmTxtActive]}>AM</Text>{/* Texto "AM": blanco si está activo */}
        </TouchableOpacity>
        <TouchableOpacity style={[clk.ampmBtn, { backgroundColor: C.inputBg }, !isAm && clk.ampmActive]} onPress={() => onAmPmChange(false)}>{/* Botón PM: fondo púrpura si isAm es false */}
          <Text style={[clk.ampmTxt, { color: C.textSecondary }, !isAm && clk.ampmTxtActive]}>PM</Text>{/* Texto "PM": blanco si está activo */}
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Layout compacto (móvil): reloj y controles en fila horizontal ──
  if (compact) {
    return (
      <View style={clk.rowContainer}>{/* Fila horizontal: reloj a la izquierda, controles a la derecha — estilo en línea 212 */}
        {ClockFace}{/* Renderiza el círculo del reloj */}
        {Controls}{/* Renderiza los controles de hora/minuto/AM-PM */}
      </View>
    );
  }

  // ── Layout tablet: reloj arriba, controles abajo en fila ──
  return (
    <View style={clk.colContainer}>{/* Columna vertical: reloj arriba, controles abajo — estilo en línea 211 */}
      {ClockFace}{/* Reloj analógico grande (180px) */}
      {/* Controles en fila horizontal para aprovechar el espacio horizontal del tablet */}
      <View style={[clk.controls, { flexDirection: 'row', gap: 16, marginTop: 14 }]}>
        {/* Pantalla digital HH:MM (versión tablet, fuente grande) */}
        <View style={clk.display}>
          <Text style={clk.timeTxt}>{String(hour).padStart(2, '0')}</Text>{/* Hora con cero adelante */}
          <Text style={clk.colon}>:</Text>{/* Separador */}
          <Text style={clk.timeTxt}>{String(minute).padStart(2, '0')}</Text>{/* Minuto con cero adelante */}
        </View>
        {/* Botones de minuto (−5 / +5) */}
        <View style={clk.minRow}>
          <TouchableOpacity style={[clk.minBtn, { backgroundColor: C.primaryBg }]} onPress={() => stepMinute(-5)}>{/* Resta 5 minutos */}
            <Ionicons name="remove" size={16} color={Colors.primary} />{/* Ícono menos */}
          </TouchableOpacity>
          <Text style={[clk.minLbl, { color: C.textSecondary }]}>min</Text>{/* Etiqueta central */}
          <TouchableOpacity style={[clk.minBtn, { backgroundColor: C.primaryBg }]} onPress={() => stepMinute(5)}>{/* Suma 5 minutos */}
            <Ionicons name="add" size={16} color={Colors.primary} />{/* Ícono más */}
          </TouchableOpacity>
        </View>
        {/* Selector AM/PM (versión tablet) */}
        <View style={clk.ampm}>
          <TouchableOpacity style={[clk.ampmBtn, { backgroundColor: C.inputBg }, isAm && clk.ampmActive]} onPress={() => onAmPmChange(true)}>{/* Botón AM activo si isAm=true */}
            <Text style={[clk.ampmTxt, { color: C.textSecondary }, isAm && clk.ampmTxtActive]}>AM</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[clk.ampmBtn, { backgroundColor: C.inputBg }, !isAm && clk.ampmActive]} onPress={() => onAmPmChange(false)}>{/* Botón PM activo si isAm=false */}
            <Text style={[clk.ampmTxt, { color: C.textSecondary }, !isAm && clk.ampmTxtActive]}>PM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

// ─── Estilos del ClockPicker ──────────────────────────────────────────────────
// Ubicación: app/presentation/screens/Alarms/AlarmsScreen.tsx — objeto "clk"

const clk = StyleSheet.create({
  colContainer: { alignItems: 'center' },                                        // Línea 211 — Columna centrada horizontalmente (layout tablet)
  rowContainer: { flexDirection: 'row', alignItems: 'center', gap: 14 },        // Línea 212 — Fila con gap de 14px (layout móvil compacto)

  face: {                                                                         // Línea 214 — Círculo del reloj
    backgroundColor: '#F5F3FF',                                                  // Fondo lavanda claro (se sobreescribe con C.primaryBg en el JSX)
    alignItems: 'center', justifyContent: 'center',                             // Centra los hijos (números y manecilla) horizontal y verticalmente
    borderWidth: 2, borderColor: Colors.primaryLighter,                         // Borde púrpura claro — Colors.primaryLighter definido en app/constants/colors.ts
  },
  num: {                                                                          // Línea 219 — Botón de cada número del reloj
    position: 'absolute', width: 28, height: 28,                                // Posicionado absolutamente, cuadrado de 28px
    alignItems: 'center', justifyContent: 'center', borderRadius: 14,           // Centrado interno, forma circular
  },
  numSel:    { backgroundColor: Colors.primary },                                // Línea 223 — Número seleccionado: fondo púrpura — Colors.primary = #7C3AED (app/constants/colors.ts)
  numTxt:    { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },  // Línea 224 — Texto de número no seleccionado: gris, tamaño 11
  numTxtSel: { color: '#fff', fontWeight: '800' },                              // Línea 225 — Texto de número seleccionado: blanco y negrita
  center:    { position: 'absolute', width: 12, height: 12, borderRadius: 6 }, // Línea 226 — Punto central del reloj: círculo de 12px posicionado sobre la manecilla

  controls:   { alignItems: 'center', gap: 8 },                                 // Línea 228 — Columna de controles centrada con 8px entre elementos
  display:    { flexDirection: 'row', alignItems: 'center', gap: 2 },           // Línea 229 — Fila HH:MM con 2px de separación
  timeTxt:    { fontSize: 36, fontWeight: '300', color: Colors.primary, width: 48, textAlign: 'center' }, // Línea 230 — Hora/minuto grande: 36px, fino, centrado en 48px de ancho
  timeTxtSm:  { fontSize: 28, width: 38 },                                      // Línea 231 — Versión compacta (móvil): 28px en 38px de ancho
  colon:      { fontSize: 32, color: Colors.primary, marginBottom: 4 },        // Línea 232 — ":" entre hora y minuto: 32px, bajado 4px para alinear visualmente
  colonSm:    { fontSize: 24 },                                                  // Línea 233 — Versión compacta del separador: 24px

  minRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },            // Línea 235 — Fila [−] min [+] con 10px de separación
  minBtn:  { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryBg ?? '#EDE9FE', alignItems: 'center', justifyContent: 'center' }, // Línea 236 — Botón circular de 32px con fondo lavanda
  minLbl:  { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', width: 24, textAlign: 'center' }, // Línea 237 — Etiqueta "min": pequeña, centrada en 24px

  ampm:          { flexDirection: 'row', gap: 6 },                              // Línea 239 — Fila AM/PM con 6px de separación
  ampmBtn:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: '#F3F4F6' }, // Línea 240 — Botón AM o PM: relleno generoso, esquinas redondeadas, gris por defecto
  ampmActive:    { backgroundColor: Colors.primary },                           // Línea 241 — Estado activo: fondo púrpura principal
  ampmTxt:       { fontSize: 13, color: Colors.textSecondary, fontWeight: '700' }, // Línea 242 — Texto AM/PM: mediano, gris, negrita
  ampmTxtActive: { color: '#fff' },                                              // Línea 243 — Texto cuando está activo: blanco
});

// ─── Componente AlarmCard — Tarjeta individual de alarma ─────────────────────
const AlarmCard: React.FC<{        // Componente funcional con TypeScript para cada fila de la lista
  item: AlarmaExtended;            // Datos completos de la alarma a mostrar
  onToggle: (id: number) => void;  // Callback: activa o desactiva la alarma
  onDelete: (id: number) => void;  // Callback: elimina la alarma con confirmación
  onEdit:   (item: AlarmaExtended) => void; // Callback: carga la alarma en el panel de edición
}> = React.memo(({ item, onToggle, onDelete, onEdit }) => { // React.memo evita re-render si las props no cambiaron
  const C = useColors(); // Colores del tema activo — hook de app/state/ThemeContext.tsx
  const { t } = useTranslation();
  return (
  // Tarjeta principal: fila con ícono, información y switch
  <View style={[styles.alarmCard, { backgroundColor: C.surface }]}>{/* styles.alarmCard en línea 588; C.surface = blanco en modo claro */}

    {/* Cuadrado con ícono de alarma — fondo degradado si está activa, gris si no */}
    <LinearGradient
      colors={item.activa ? ['#EDE9FE', '#DDD6FE'] : [C.inputBg, C.surface] as [string,string]} // Degradado lavanda si activa, gris neutro si inactiva
      style={styles.alarmIconBg} // Estilo del contenedor del ícono — línea 594
    >
      {/* Ícono de alarma: púrpura si activa, gris si inactiva */}
      <Ionicons name="alarm-outline" size={22} color={item.activa ? Colors.primary : C.textSecondary} />
    </LinearGradient>

    {/* Sección central con toda la información de la alarma */}
    <View style={styles.alarmInfo}>{/* Ocupa el espacio restante flex:1 — estilo en línea 595 */}

      {/* Fila superior: hora grande + badge AM/PM */}
      <View style={styles.alarmTimeRow}>{/* Fila horizontal — estilo en línea 597 */}
        {/* Texto de la hora (ej: "11:00") — grisáceo si la alarma está desactivada */}
        <Text style={[styles.alarmTime, { color: C.textPrimary }, !item.activa && styles.alarmTimeOff]}>
          {item.hora}{/* Muestra la hora almacenada en formato "HH:MM" */}
        </Text>
        {/* Badge AM/PM — solo se muestra si existe el campo ampm */}
        {item.ampm && (
          <View style={[styles.ampmBadge, { backgroundColor: C.primaryBg }, item.ampm === 'PM' && styles.ampmBadgePm]}>{/* Fondo amarillo si es PM — estilo en línea 600 */}
            <Text style={[styles.ampmBadgeTxt, item.ampm === 'PM' && styles.ampmBadgeTxtPm]}>{/* Texto dorado si es PM — estilo en línea 602 */}
              {item.ampm}{/* Muestra "AM" o "PM" */}
            </Text>
          </View>
        )}
      </View>

      {/* Nombre/mensaje de la alarma (ej: "Práctica de señas diaria") */}
      <Text style={[styles.alarmMsg, { color: C.textSecondary }]} numberOfLines={1}>{item.mensaje}</Text>{/* numberOfLines=1 trunca con "..." si es muy largo — estilo en línea 605 */}

      {/* Días de repetición — solo se muestra si hay días configurados */}
      {item.dias && item.dias.length > 0 && (
        <View style={styles.diasRow}>{/* Fila horizontal de indicadores de días — estilo en línea 607 */}
          {DIAS_SEMANA.map(dia => {           // Itera los 7 días de la semana en orden
            const active = item.dias!.includes(dia); // true si este día está en la lista de días de la alarma
            return (
              // Círculo pequeño con la inicial del día (L, M, X...)
              <View key={dia} style={[styles.diaBadge, { backgroundColor: C.inputBg }, active && [styles.diaBadgeActive, { backgroundColor: C.primaryBg }]]}>{/* Fondo lavanda si el día está activo — estilo en línea 608 */}
                <Text style={[styles.diaTxt, { color: C.textHint }, active && styles.diaTxtActive]}>{dia[0]}</Text>{/* Solo la primera letra del día; púrpura si activo — estilo en línea 610 */}
              </View>
            );
          })}
        </View>
      )}

      {/* Fila de acciones: botón Eliminar y botón Editar */}
      <View style={styles.alarmActions}>{/* Fila horizontal de botones — estilo en línea 613 */}

        {/* Botón Eliminar — llama a onDelete con el id de la alarma */}
        <TouchableOpacity style={[styles.alarmBtnDelete, { backgroundColor: 'rgba(239,68,68,0.12)' }]} onPress={() => onDelete(item.id_alarma)}>{/* Fondo rojo transparente — estilo en línea 614 */}
          <Ionicons name="trash-outline" size={13} color={Colors.danger} />{/* Ícono de papelera rojo — Colors.danger definido en app/constants/colors.ts */}
          <Text style={styles.alarmBtnDeleteTxt}>{t('alarmDeleteBtn')}</Text>{/* Texto del botón rojo — estilo en línea 615 */}
        </TouchableOpacity>

        {/* Botón Editar — carga la alarma en el panel superior para editar */}
        <TouchableOpacity style={[styles.alarmBtnEdit, { backgroundColor: C.primaryBg }]} onPress={() => onEdit(item)}>{/* Fondo lavanda — estilo en línea 616 */}
          <Ionicons name="create-outline" size={13} color={Colors.primary} />{/* Ícono de lápiz púrpura */}
          <Text style={styles.alarmBtnEditTxt}>{t('alarmEditBtn')}</Text>{/* Texto del botón púrpura — estilo en línea 617 */}
        </TouchableOpacity>
      </View>
    </View>

    {/* Switch (toggle) al extremo derecho — activa o desactiva la alarma */}
    <Switch
      value={item.activa}                                         // Estado actual del switch: true=encendido, false=apagado
      onValueChange={() => onToggle(item.id_alarma)}             // Al cambiar, llama al handler con el id de la alarma
      trackColor={{ false: Colors.toggleOff, true: Colors.toggleOn }} // Color del carril: gris si apagado, púrpura si encendido — definidos en app/constants/colors.ts
      thumbColor="#fff"                                           // Color del círculo interior del switch: siempre blanco
    />
  </View>
  );
});

// ─── Componente principal AlarmsScreen ───────────────────────────────────────
export const AlarmsScreen: React.FC = () => {                    // Componente exportado; es la pantalla completa registrada en el navegador
  const { width } = useWindowDimensions();                       // Obtiene el ancho actual de la pantalla/ventana (se actualiza al girar el dispositivo)
  const isTablet = width >= 768;                                 // true si el ancho es 768px o más (tablet o web) → activa el layout de dos columnas
  const C = useColors();                                         // Colores del tema activo — hook de app/state/ThemeContext.tsx
  const { isDark } = useTheme();                                 // Booleano que indica si el modo oscuro está activado — hook de app/state/ThemeContext.tsx
  const { t } = useTranslation();

  // ── Estado local de la pantalla ───────────────────────────────────────────
  const [alarms,       setAlarms]       = useState<AlarmaExtended[]>(MOCK_ALARMS); // Lista de alarmas mostradas; inicia con los datos mock
  const [pickerHour,   setPickerHour]   = useState(7);          // Hora seleccionada en el reloj (1-12); valor inicial 7
  const [pickerMinute, setPickerMinute] = useState(0);          // Minuto seleccionado en el reloj (0-59); valor inicial 0
  const [isAm,         setIsAm]         = useState(true);       // true = AM, false = PM; inicia en AM
  const [alarmName,    setAlarmName]    = useState('');         // Nombre/mensaje de la alarma que se está creando o editando
  const [selectedDias, setSelectedDias] = useState<string[]>(['Lun', 'Mié', 'Vie']); // Días seleccionados; por defecto lunes, miércoles y viernes
  const [editingId,    setEditingId]    = useState<number | null>(null); // id de la alarma en edición; null significa que se está creando una nueva

  // ── Handlers (funciones de acción) ────────────────────────────────────────

  // Activa o desactiva una alarma existente por su id
  const toggleAlarm = useCallback((id: number) =>
    setAlarms(prev => prev.map(a => a.id_alarma === id ? { ...a, activa: !a.activa } : a)) // Invierte el campo activa solo en la alarma con el id indicado
  , []); // Sin dependencias: la función siempre es la misma (usa el updater funcional de useState)

  // Muestra confirmación y elimina la alarma si el usuario confirma
  const deleteAlarm = useCallback((id: number) => {
    const doDelete = () => setAlarms(prev => prev.filter(a => a.id_alarma !== id)); // Filtra y elimina la alarma con el id indicado del array de estado
    if (Platform.OS === 'web') {                                 // En web, Alert.alert no ejecuta los callbacks — se usa window.confirm() nativo del browser
      if (window.confirm(t('alarmConfirmDelete'))) doDelete(); // window.confirm() retorna true si el usuario hizo clic en "Aceptar"
    } else {                                                     // En iOS y Android se usa el Alert nativo con botones personalizados
      Alert.alert(t('alarmDeleteTitle'), t('alarmConfirmDelete'), [
        { text: t('alarmCancel'), style: 'cancel' },
        { text: t('alarmDeleteBtn'), style: 'destructive', onPress: doDelete },
      ]);
    }
  }, []); // Sin dependencias: usa updater funcional, no necesita capturar el estado

  // Carga los datos de una alarma existente en el panel para editarla
  const handleEdit = useCallback((item: AlarmaExtended) => {
    const [h, m] = item.hora.split(':').map(Number); // Separa "11:00" en [11, 0] y convierte a números
    setPickerHour(h || 7);                           // Establece la hora en el reloj; usa 7 como fallback si h es NaN
    setPickerMinute(m || 0);                         // Establece el minuto en el reloj; usa 0 como fallback
    setIsAm(item.ampm !== 'PM');                     // Si ampm es 'AM' o undefined, isAm = true; si es 'PM', isAm = false
    setSelectedDias(item.dias ?? []);                // Carga los días de la alarma; si no tiene, usa array vacío
    setAlarmName(item.mensaje);                      // Carga el nombre/mensaje de la alarma en el campo de texto
    setEditingId(item.id_alarma);                    // Guarda el id para saber que estamos editando (no creando)
  }, []); // Sin dependencias externas

  // Cancela la edición y resetea el panel al estado inicial de "nueva alarma"
  const cancelEdit = useCallback(() => {
    setEditingId(null);                              // Vuelve al modo "nueva alarma"
    setAlarmName('');                                // Limpia el campo de nombre
    setPickerHour(7);                                // Resetea la hora a 7
    setPickerMinute(0);                              // Resetea los minutos a 0
    setIsAm(true);                                   // Resetea a AM
    setSelectedDias(['Lun', 'Mié', 'Vie']);          // Resetea los días al valor por defecto
  }, []); // Sin dependencias

  // Activa o desactiva un día en el selector de repetición
  const toggleDia = useCallback((dia: string) =>
    setSelectedDias(prev =>
      prev.includes(dia)                             // Si el día ya está seleccionado...
        ? prev.filter(d => d !== dia)                // ...lo quita del array
        : [...prev, dia]                             // ...si no está, lo agrega
    )
  , []); // Sin dependencias

  // Guarda la alarma nueva o actualiza la alarma que se está editando
  const handleSave = useCallback(() => {
    const data = {
      hora:    `${String(pickerHour).padStart(2, '0')}:${String(pickerMinute).padStart(2, '0')}`, // Construye "HH:MM" formateado con ceros
      ampm:    (isAm ? 'AM' : 'PM') as AmPm,        // Convierte el booleano isAm al string 'AM' o 'PM'
      mensaje: alarmName.trim() || t('alarmDefaultName'),
      dias:    selectedDias,                         // Días seleccionados en el picker
    };
    if (editingId !== null) {                        // Si hay un id de edición, actualiza la alarma existente
      setAlarms(prev => prev.map(a => a.id_alarma === editingId ? { ...a, ...data } : a)); // Reemplaza los datos de la alarma editada conservando id, activa e id_usuario
      cancelEdit();                                  // Resetea el panel a modo "nueva alarma"
    } else {                                         // Si no hay id, crea una alarma nueva
      setAlarms(prev => [...prev, { id_alarma: Date.now(), activa: true, id_usuario: 1, ...data }]); // id_alarma temporal con timestamp; activa por defecto; id_usuario hardcodeado (TODO: usar el del contexto)
      setAlarmName('');                              // Limpia solo el nombre; el reloj mantiene la última hora para crear la siguiente rápido
    }
  }, [pickerHour, pickerMinute, isAm, alarmName, selectedDias, editingId, cancelEdit]); // Depende de todos los valores del formulario

  // Función que renderiza cada tarjeta de alarma en el FlatList
  const renderItem: ListRenderItem<AlarmaExtended> = useCallback(({ item }) => (
    <AlarmCard item={item} onToggle={toggleAlarm} onDelete={deleteAlarm} onEdit={handleEdit} /> // Pasa los handlers memorizados al componente de tarjeta
  ), [toggleAlarm, deleteAlarm, handleEdit]); // Se recrea solo si alguno de los handlers cambia

  // ── Bloque reutilizable: contenido del panel de crear/editar alarma ────────
  const pickerContent = (
    <>
      {/* Reloj analógico interactivo con sus controles */}
      <ClockPicker
        hour={pickerHour}              // Hora actual del formulario
        minute={pickerMinute}          // Minuto actual del formulario
        isAm={isAm}                    // AM o PM actual del formulario
        compact={!isTablet}            // Compacto en móvil, grande en tablet
        onHourChange={setPickerHour}   // Al tocar una hora en el reloj, actualiza el estado
        onMinuteChange={setPickerMinute} // Al presionar +5/-5, actualiza el minuto
        onAmPmChange={setIsAm}         // Al tocar AM/PM, actualiza el estado
      />

      {/* Campo de texto para el nombre de la alarma */}
      <View style={[styles.nameField, { borderColor: C.border, backgroundColor: C.inputBg }]}>{/* Contenedor del input con borde y fondo del tema — estilo en línea 543 */}
        <Ionicons name="pencil-outline" size={14} color={C.textSecondary} style={{ marginTop: 1 }} />{/* Ícono de lápiz decorativo a la izquierda del campo */}
        <TextInput
          style={[styles.nameInput, { color: C.textPrimary }]} // Estilo del input — línea 550; color del texto del tema
          value={alarmName}                          // Valor controlado: lo que está en el estado alarmName
          onChangeText={setAlarmName}                // Actualiza el estado en cada tecla presionada
          placeholder={t('alarmNamePlaceholder')}

          placeholderTextColor={C.textHint}          // Color del placeholder según el tema
          maxLength={40}                             // Límite de 40 caracteres para el nombre
          returnKeyType="done"                       // Cambia el botón "Enter" del teclado a "Listo"
          textAlignVertical="center"                 // Centra el texto verticalmente (Android)
        />
      </View>

      {/* Selector de días de repetición */}
      <View style={styles.diasBlock}>{/* Contenedor de la sección de días — estilo en línea 559 */}
        <Text style={[styles.diasLabel, { color: C.textSecondary }]}>{t('alarmRepeat')}</Text>{/* Etiqueta en mayúsculas — estilo en línea 560 */}
        <View style={styles.diasGrid}>{/* Fila de los 7 botones de días — estilo en línea 561 */}
          {DIAS_SEMANA.map(dia => ( // Itera los 7 días para crear un botón por cada uno
            <TouchableOpacity
              key={dia}             // Key única para React
              style={[styles.diaSelectorBtn, { backgroundColor: C.inputBg, borderColor: C.border }, selectedDias.includes(dia) && styles.diaSelectorBtnActive]} // Fondo púrpura si el día está seleccionado — estilo base en línea 562
              onPress={() => toggleDia(dia)} // Al presionar, agrega o quita el día de la selección
            >
              <Text style={[styles.diaSelectorTxt, { color: C.textSecondary }, selectedDias.includes(dia) && styles.diaSelectorTxtActive]}>
                {dia[0]}{/* Muestra solo la primera letra del día: L, M, X, J, V, S, D */}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fila de botones de acción: Cancelar (solo en modo edición) + Agregar/Guardar */}
      <View style={styles.actionRow}>{/* Fila horizontal de botones — estilo en línea 568 */}

        {/* Botón Cancelar: solo visible cuando se está editando una alarma existente */}
        {editingId !== null && (
          <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: C.inputBg, borderColor: C.border }]} onPress={cancelEdit}>{/* Fondo gris, borde del tema — estilo en línea 569 */}
            <Text style={[styles.cancelBtnTxt, { color: C.textSecondary }]}>{t('alarmCancel')}</Text>{/* Texto gris — estilo en línea 570 */}
          </TouchableOpacity>
        )}

        {/* Botón principal: "Agregar alarma" o "Guardar cambios" según el modo */}
        <TouchableOpacity style={[styles.addBtn, editingId !== null && styles.addBtnFlex]} onPress={handleSave}>{/* flex:1 cuando hay botón cancelar — estilo en línea 571 */}
          <LinearGradient colors={['#9333EA', '#7C3AED']} style={styles.addBtnGrad}>{/* Degradado púrpura de fondo — estilo en línea 573 */}
            <Ionicons name={editingId !== null ? 'checkmark-circle-outline' : 'add-circle-outline'} size={18} color="#fff" />{/* Ícono de check en edición, + en creación */}
            <Text style={styles.addBtnTxt}>{editingId !== null ? t('alarmSave') : t('alarmAdd')}</Text>{/* Texto del botón según el modo — estilo en línea 574 */}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );

  // ── Cabecera de la lista "Mis alarmas" ────────────────────────────────────
  const listHeader = (
    <View style={styles.listHeader}>{/* Fila entre el título y el contador — estilo en línea 581 */}
      <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>{t('alarmMyAlarms')}</Text>
      <View style={[styles.countBadge, { backgroundColor: C.primaryBg }]}>
        <Text style={styles.countTxt}>{alarms.filter(a => a.activa).length} {t('alarmActive')}</Text>{/* Cuenta cuántas alarmas tienen activa=true y muestra el número — estilo en línea 584 */}
      </View>
    </View>
  );

  // ── Render para tablet (ancho ≥ 768px): dos columnas ─────────────────────
  if (isTablet) {
    return (
      <View style={[styles.root, { backgroundColor: C.backgroundGray }]}>{/* Contenedor raíz full-screen — estilo en línea 524 */}
        <AppHeader />{/* Barra superior con logo — app/presentation/components/common/AppHeader.tsx */}
        <View style={styles.tabletContainer}>{/* Fila de dos columnas — estilo en línea 527 */}

          {/* Columna izquierda: lista de alarmas */}
          <View style={styles.listSection}>{/* Ocupa el espacio disponible flex:1 — estilo en línea 580 */}
            {listHeader}{/* Título "Mis alarmas" + contador de activas */}
            <FlatList data={alarms} keyExtractor={keyExtractor} contentContainerStyle={styles.listContent} renderItem={renderItem} showsVerticalScrollIndicator={false} />{/* Lista de tarjetas de alarma, oculta el scrollbar */}
          </View>

          {/* Columna derecha: panel de crear/editar alarma */}
          <View style={[styles.tabletPanel, { backgroundColor: C.surface, borderColor: C.border }]}>{/* Panel con sombra y borde — estilo en línea 528 */}
            <Text style={[styles.panelTitle, { color: C.textPrimary }]}>{editingId !== null ? t('alarmEditPanel') : t('alarmNewPanel')}</Text>{/* Título dinámico del panel — estilo en línea 540 */}
            {pickerContent}{/* Reloj + nombre + días + botones */}
          </View>
        </View>
      </View>
    );
  }

  // ── Render para móvil: panel fijo arriba + lista scrolleable abajo ────────
  return (
    <View style={[styles.root, { backgroundColor: C.backgroundGray }]}>{/* Contenedor raíz full-screen — estilo en línea 524 */}
      <AppHeader />{/* Barra superior con logo — app/presentation/components/common/AppHeader.tsx */}

      {/* Panel superior fijo (no scrollea): reloj + formulario */}
      <LinearGradient
        colors={isDark
          ? [C.surface, C.inputBg] as [string, string]    // En modo oscuro: degradado de colores del tema
          : editingId !== null ? ['#FFF7ED', '#FEF3C7'] : ['#F5F3FF', '#EDE9FE'] // En modo claro: naranja si editando, lavanda si creando
        }
        style={styles.mobilePanel} // Padding del panel — estilo en línea 537
      >
        {/* Cabecera del panel: ícono + título */}
        <View style={styles.panelHeader}>{/* Fila horizontal — estilo en línea 538 */}
          <LinearGradient
            colors={editingId !== null ? ['#D97706', '#F59E0B'] : ['#9333EA', '#7C3AED']} // Naranja si editando, púrpura si creando
            style={styles.panelIcon} // Cuadrado redondeado de 26px — estilo en línea 539
          >
            <Ionicons name={editingId !== null ? 'create' : 'alarm'} size={15} color="#fff" />{/* Ícono lápiz en edición, alarma en creación */}
          </LinearGradient>
          <Text style={[styles.panelTitle, { color: C.textPrimary }]}>{editingId !== null ? t('alarmEditPanel') : t('alarmNewPanel')}</Text>{/* Título dinámico del panel */}
        </View>
        {pickerContent}{/* Reloj + campo de nombre + días + botón de guardar */}
      </LinearGradient>

      {/* Línea divisoria entre el panel y la lista */}
      <View style={[styles.divider, { backgroundColor: C.border }]} />{/* Línea horizontal de 1px — estilo en línea 577 */}

      {/* Lista scrolleable de alarmas */}
      <View style={styles.listSection}>{/* Ocupa todo el espacio restante — estilo en línea 580 */}
        {listHeader}{/* Título "Mis alarmas" + contador de activas */}
        <FlatList data={alarms} keyExtractor={keyExtractor} contentContainerStyle={styles.listContent} renderItem={renderItem} showsVerticalScrollIndicator={false} />{/* Lista virtualizada de tarjetas */}
      </View>
    </View>
  );
};

// ─── Estilos de AlarmsScreen ──────────────────────────────────────────────────
// Ubicación: app/presentation/screens/Alarms/AlarmsScreen.tsx — objeto "styles"

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray ?? '#F8F9FC' }, // Línea 524 — Contenedor raíz: ocupa toda la pantalla, fondo gris claro

  // ── Tablet ─────────────────────────────────────────────────────────────────
  tabletContainer: { flex: 1, flexDirection: 'row', padding: 16, gap: 14 }, // Línea 527 — Fila de dos columnas con padding y separación de 14px
  tabletPanel: {                                                              // Línea 528 — Panel derecho del tablet (crear/editar alarma)
    backgroundColor: '#fff', borderRadius: 22, padding: 16,                 // Fondo blanco, esquinas muy redondeadas, padding interno
    borderWidth: 1, borderColor: Colors.border,                             // Borde sutil — Colors.border definido en app/constants/colors.ts
    minWidth: 260, alignSelf: 'flex-start',                                  // Ancho mínimo 260px; se ajusta al contenido verticalmente
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 },         // Sombra púrpura desplazada hacia abajo
    shadowOpacity: 0.1, shadowRadius: 14, elevation: 6, gap: 14,           // Sombra suave (iOS) / elevación (Android); 14px entre hijos
  },

  // ── Panel móvil fijo ────────────────────────────────────────────────────────
  mobilePanel: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, gap: 10 }, // Línea 537 — Panel superior fijo: padding y 10px entre hijos
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }, // Línea 538 — Fila: ícono + título del panel
  panelIcon:   { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' }, // Línea 539 — Cuadrado redondeado para el ícono del panel
  panelTitle:  { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },          // Línea 540 — Título del panel: mediano, extra negrita

  // ── Campo nombre de alarma ──────────────────────────────────────────────────
  nameField: {                                                               // Línea 543 — Contenedor del input de nombre
    flexDirection: 'row', alignItems: 'center', gap: 8,                    // Fila con ícono y texto alineados
    backgroundColor: 'rgba(255,255,255,0.8)',                               // Fondo blanco semitransparente
    borderRadius: 10, paddingHorizontal: 12,                                // Esquinas redondeadas y relleno lateral
    borderWidth: 1, borderColor: Colors.border,                             // Borde sutil
    height: 38,                                                             // Altura fija para consistencia visual
  },
  nameInput: {                                                               // Línea 550 — Estilo del TextInput de nombre
    flex: 1, fontSize: 13, color: Colors.textPrimary,                      // Ocupa el espacio disponible, texto pequeño
    paddingVertical: 0, alignSelf: 'stretch',                               // Elimina padding vertical para alineación perfecta
    textAlignVertical: 'center',                                            // Centra verticalmente en Android
    includeFontPadding: false,                                              // Elimina padding interno de fuente en Android
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),   // Duplicado para mayor compatibilidad con versiones antiguas de Android
  } as any, // "as any" necesario porque includeFontPadding no está en los tipos de StyleSheet de RN

  // ── Selector de días ────────────────────────────────────────────────────────
  diasBlock: { gap: 4 },                                                    // Línea 559 — Columna con 4px entre etiqueta "REPETIR" y la fila de botones
  diasLabel: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.8 }, // Línea 560 — Etiqueta "REPETIR": pequeña, negrita, espaciado extra
  diasGrid:  { flexDirection: 'row', gap: 5 },                             // Línea 561 — Fila de los 7 botones de días con 5px de separación
  diaSelectorBtn:       { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 1, borderColor: Colors.border }, // Línea 562 — Botón de día no seleccionado: círculo blanco con borde
  diaSelectorBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary }, // Línea 563 — Botón de día seleccionado: relleno púrpura
  diaSelectorTxt:       { fontSize: 10, color: Colors.textSecondary, fontWeight: '700' }, // Línea 564 — Letra del día no seleccionado: pequeña y gris
  diaSelectorTxtActive: { color: '#fff' },                                 // Línea 565 — Letra del día seleccionado: blanca

  // ── Botones de acción (Cancelar / Agregar / Guardar) ───────────────────────
  actionRow:  { flexDirection: 'row', gap: 8, alignItems: 'center' },     // Línea 568 — Fila de botones con 8px de separación
  cancelBtn:  { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: 'rgba(255,255,255,0.8)' }, // Línea 569 — Botón Cancelar: blanco semitransparente con borde
  cancelBtnTxt: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },        // Línea 570 — Texto "Cancelar": mediano, negrita, gris
  addBtn:     { borderRadius: 12, overflow: 'hidden', flex: 1 },          // Línea 571 — Contenedor del botón principal: flex para ocupar espacio; overflow hidden para que el degradado respete el borderRadius
  addBtnFlex: { flex: 1 },                                                  // Línea 572 — Override para forzar flex:1 cuando hay botón Cancelar al lado
  addBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11, borderRadius: 12 }, // Línea 573 — Interior del botón con degradado: ícono + texto centrados
  addBtnTxt:  { color: '#fff', fontSize: 13, fontWeight: '700' },         // Línea 574 — Texto del botón principal: blanco, mediano, negrita

  // ── Línea divisoria ─────────────────────────────────────────────────────────
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 }, // Línea 577 — Separador horizontal de 1px con margen lateral

  // ── Sección de lista ────────────────────────────────────────────────────────
  listSection: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },        // Línea 580 — Área de la lista: flex para ocupar espacio restante
  listHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }, // Línea 581 — Fila título + badge: separados en los extremos
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary }, // Línea 582 — Título "Mis alarmas": grande y extra negrita
  countBadge:   { backgroundColor: Colors.primaryBg ?? '#EDE9FE', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }, // Línea 583 — Badge contador: lavanda, muy redondeado
  countTxt:     { fontSize: 12, color: Colors.primary, fontWeight: '700' }, // Línea 584 — Texto del badge: pequeño, púrpura, negrita
  listContent:  { gap: 10, paddingBottom: 16 },                            // Línea 585 — Contenido del FlatList: 10px entre tarjetas, padding inferior para no quedar bajo el tab bar

  // ── Tarjeta de alarma ────────────────────────────────────────────────────────
  alarmCard: {                                                               // Línea 588 — Tarjeta contenedora de cada alarma
    flexDirection: 'row', alignItems: 'center',                            // Fila: ícono | info | switch
    backgroundColor: '#fff', borderRadius: 18, padding: 14, gap: 12,      // Blanco, muy redondeada, relleno interior, 12px entre hijos
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },           // Sombra negra desplazada 2px hacia abajo
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,                   // Sombra suave y difusa (iOS) / elevación nivel 3 (Android)
  },
  alarmIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, // Línea 594 — Cuadrado redondeado de 44px para el ícono de alarma
  alarmInfo:   { flex: 1 },                                                // Línea 595 — Sección central: ocupa todo el espacio disponible entre ícono y switch

  alarmTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }, // Línea 597 — Fila: hora + badge AM/PM con 2px de margen inferior
  alarmTime:    { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.5 }, // Línea 598 — Hora grande: 22px, extra negrita, espaciado de letras
  alarmTimeOff: { color: Colors.textHint },                                // Línea 599 — Override para alarma desactivada: color gris claro
  ampmBadge:    { backgroundColor: Colors.primaryBg ?? '#EDE9FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }, // Línea 600 — Badge AM: fondo lavanda, esquinas redondeadas
  ampmBadgePm:  { backgroundColor: '#FEF3C7' },                           // Línea 601 — Override para badge PM: fondo amarillo claro
  ampmBadgeTxt: { fontSize: 11, fontWeight: '800', color: Colors.primary }, // Línea 602 — Texto del badge AM: pequeño, extra negrita, púrpura
  ampmBadgeTxtPm: { color: '#D97706' },                                   // Línea 603 — Override para texto PM: color dorado/naranja

  alarmMsg: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 }, // Línea 605 — Mensaje de la alarma: pequeño, gris, 6px de margen inferior

  diasRow:        { flexDirection: 'row', gap: 4, marginBottom: 8 },      // Línea 607 — Fila de indicadores de días con 8px de margen inferior
  diaBadge:       { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' }, // Línea 608 — Círculo de 20px para indicar cada día; gris por defecto
  diaBadgeActive: { backgroundColor: Colors.primaryBg ?? '#EDE9FE' },    // Línea 609 — Círculo activo: fondo lavanda
  diaTxt:         { fontSize: 9, color: Colors.textHint, fontWeight: '700' }, // Línea 610 — Letra del día: muy pequeña (9px), gris claro, negrita
  diaTxtActive:   { color: Colors.primary },                               // Línea 611 — Letra del día activo: púrpura

  alarmActions: { flexDirection: 'row', gap: 8 },                         // Línea 613 — Fila de botones Eliminar/Editar con 8px de separación
  alarmBtnDelete: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: Colors.danger, backgroundColor: '#FFF5F5' }, // Línea 614 — Botón Eliminar: borde y texto rojo, fondo rojizo muy claro
  alarmBtnDeleteTxt: { color: Colors.danger, fontSize: 11, fontWeight: '600' }, // Línea 615 — Texto "Eliminar": rojo, pequeño, semi-negrita
  alarmBtnEdit:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.primaryBg ?? '#EDE9FE' }, // Línea 616 — Botón Editar: borde púrpura, fondo lavanda
  alarmBtnEditTxt: { color: Colors.primary, fontSize: 11, fontWeight: '600' }, // Línea 617 — Texto "Editar": púrpura, pequeño, semi-negrita
});
