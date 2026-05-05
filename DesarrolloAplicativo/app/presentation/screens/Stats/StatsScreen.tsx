// Archivo: app/presentation/screens/Stats/StatsScreen.tsx
/**
 * @file StatsScreen.tsx
 * @description Pantalla de estadísticas de uso de la app.
 *
 * Muestra:
 * - 4 tarjetas KPI: Traducciones, Usuarios activos, Horas aprendidas, Señas aprendidas.
 * - `BarChart`: gráfica de barras con degradado (actividad semanal y volumen por semana).
 * - `LineChart`: gráfica de líneas con puntos conectados (crecimiento mensual de usuarios).
 * - `PieChart`: leyenda con barras de progreso por sección de uso.
 * - `StatCard`: contenedor reutilizable con título, línea de acento de color y descripción.
 *
 * Todos los datos son mock (`WEEKLY_DATA`, `MONTHLY_LINE`, `SECTION_PIE`, `KPI_CARDS`).
 * El layout se adapta a tablet (≥ 768 px) y desktop (≥ 1024 px).
 *
 * @todo Conectar con `ENDPOINTS.stats` para cargar estadísticas reales del usuario.
 */
import React, { useState } from 'react'; // Importa React y el hook useState para manejo de estado local
import {
  View, // Importa View: contenedor base para layouts en React Native
  Text, // Importa Text: componente para mostrar texto en pantalla
  StyleSheet, // Importa StyleSheet: utilidad para crear estilos optimizados
  ScrollView, // Importa ScrollView: contenedor con soporte para scroll vertical
  useWindowDimensions, // Importa useWindowDimensions: hook que devuelve el ancho y alto actuales de la ventana
  LayoutChangeEvent, // Importa LayoutChangeEvent: tipo TypeScript del evento que se dispara al medir un componente
} from 'react-native'; // Todos los anteriores provienen del paquete principal de React Native
import { AppHeader } from '../../components/common/AppHeader'; // Importa AppHeader desde app/presentation/components/common/AppHeader: encabezado superior reutilizable
import { Colors } from '../../../constants/colors'; // Importa Colors desde app/constants/colors: paleta de colores del proyecto
import { useColors, useTheme } from '../../../state/ThemeContext'; // Importa useColors y useTheme desde app/state/ThemeContext: hooks para colores dinámicos y estado del tema
import { useTranslation } from '../../../i18n';
import { LinearGradient } from 'expo-linear-gradient'; // Importa LinearGradient de 'expo-linear-gradient': componente para degradados de color
import { Ionicons } from '@expo/vector-icons'; // Importa Ionicons de '@expo/vector-icons': librería de íconos vectoriales de Expo

// ─── Gráfica de barras ────────────────────────────────────────────────────────
const BarChart: React.FC<{ // Define el componente funcional BarChart: renderiza una gráfica de barras con degradado
  data: { label: string; value: number }[]; // Prop data: array de objetos con etiqueta y valor numérico para cada barra
  colors: [string, string]; // Prop colors: par de colores para el degradado de las barras
  maxValue?: number; // Prop maxValue: valor máximo opcional para escalar las barras (si no se da, se calcula automáticamente)
}> = ({ data, colors, maxValue }) => { // Desestructura las props del componente BarChart
  const C = useColors(); // Obtiene los colores dinámicos del tema activo (claro/oscuro)
  const max = maxValue || Math.max(...data.map(d => d.value)); // Calcula el valor máximo: usa maxValue si se provee, sino el máximo del array de datos
  const chartHeight = 100; // Altura fija de 100 px usada como referencia para escalar las barras proporcionalmente

  return ( // Inicia el retorno del JSX del componente BarChart
    <View style={bar.container}>{/* Contenedor principal de la gráfica de barras con margen vertical */}
      <View style={bar.chart}>{/* Contenedor flex-row que alinea las barras desde la base */}
        {data.map((item, i) => ( // Itera sobre cada elemento del array de datos para renderizar una barra
          <View key={i} style={bar.barGroup}>{/* Grupo de una barra individual: centra la etiqueta, la barra y el valor */}
            <Text style={[bar.valueLabel, { color: C.textHint }]}>{item.value}</Text>{/* Etiqueta numérica sobre la barra con color de sugerencia del tema */}
            <View style={[bar.barWrap, { height: (item.value / max) * chartHeight }]}>{/* Contenedor de la barra: su altura se calcula proporcionalmente al valor máximo */}
              <LinearGradient // Barra con degradado de color de abajo hacia arriba
                colors={colors} // Usa los colores de degradado recibidos como prop
                start={{ x: 0, y: 1 }} // El degradado comienza desde la parte inferior de la barra
                end={{ x: 0, y: 0 }} // El degradado termina en la parte superior de la barra
                style={bar.bar} // Estilo que hace que el degradado llene completamente la barra
              />
            </View>{/* Cierra el contenedor proporcional de la barra */}
            <Text style={[bar.barLabel, { color: C.textHint }]}>{item.label}</Text>{/* Etiqueta del eje X debajo de la barra con color de sugerencia del tema */}
          </View> // Cierra el grupo de la barra individual
        ))}{/* Cierra el map de barras */}
      </View>{/* Cierra el contenedor flex-row de la gráfica */}
    </View> // Cierra el contenedor principal del BarChart
  ); // Cierra el return del BarChart
}; // Cierra la definición del componente BarChart

// ─── Gráfica de línea — usa onLayout para medir el ancho real ─────────────────
const LineChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => { // Define el componente LineChart: renderiza una gráfica de líneas con puntos conectados usando posicionamiento absoluto
  const [containerWidth, setContainerWidth] = useState(280); // Estado del ancho del contenedor: inicia en 280 px y se actualiza con onLayout para cálculos precisos

  const max = Math.max(...data); // Calcula el valor máximo del array de datos para escalar verticalmente los puntos
  const chartHeight = 80; // Altura fija de 80 px del área de la gráfica de líneas
  const step = containerWidth / (data.length - 1); // Distancia horizontal entre puntos: ancho total dividido por los intervalos entre datos

  const points = data.map((v, i) => ({ // Calcula las coordenadas (x, y) de cada punto de la gráfica
    x: i * step, // Coordenada x: índice multiplicado por el paso horizontal
    y: chartHeight - (v / max) * chartHeight, // Coordenada y: invertida porque 0 es arriba en el sistema de coordenadas de React Native
  })); // Cierra el map de cálculo de puntos

  const handleLayout = (e: LayoutChangeEvent) => { // Handler que actualiza el ancho del contenedor cuando el componente termina de renderizarse
    const w = e.nativeEvent.layout.width; // Obtiene el ancho real del contenedor del evento de layout
    if (w > 0) setContainerWidth(w); // Actualiza el estado solo si el ancho es positivo para evitar divisiones por cero
  }; // Cierra el handler de layout

  return ( // Inicia el retorno del JSX del componente LineChart
    <View // Contenedor principal de la gráfica de líneas con posicionamiento relativo
      style={[lineStyle.container, { height: chartHeight + 20 }]} // Altura del contenedor: chartHeight más 20 px para los puntos y sus sombras
      onLayout={handleLayout} // Llama al handler para medir el ancho real del contenedor
    >
      {/* Líneas conectoras */}
      {points.slice(0, -1).map((pt, i) => { // Itera sobre los puntos excepto el último para dibujar los segmentos de línea entre puntos consecutivos
        const next = points[i + 1]; // Obtiene el punto siguiente al actual para calcular la dirección del segmento
        const dx = next.x - pt.x; // Diferencia horizontal entre el punto actual y el siguiente
        const dy = next.y - pt.y; // Diferencia vertical entre el punto actual y el siguiente
        const length = Math.sqrt(dx * dx + dy * dy); // Longitud del segmento calculada con el teorema de Pitágoras
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // Ángulo de rotación del segmento en grados usando arcotangente
        return ( // Retorna el segmento de línea como un View rotado
          <View // View que representa un segmento de línea entre dos puntos
            key={i} // Clave única del segmento basada en su índice
            style={[ // Combina el estilo base del segmento con los valores calculados dinámicamente
              lineStyle.segment, // Estilo base: posición absoluta, altura 2 px, borde redondeado
              {
                left: pt.x, // Posición horizontal del inicio del segmento
                top: pt.y + 5, // Posición vertical del inicio del segmento con offset de 5 px por el tamaño del punto
                width: length, // Longitud del segmento calculada con Pitágoras
                transform: [{ rotate: `${angle}deg` }], // Rotación del segmento al ángulo calculado
                backgroundColor: color + '50', // Color del segmento con 50% de opacidad (sufijo hexadecimal)
              },
            ]}
          />
        ); // Cierra el return del segmento de línea
      })}{/* Cierra el map de segmentos de línea */}
      {/* Puntos */}
      {points.map((pt, i) => ( // Itera sobre todos los puntos para renderizar los círculos
        <View // View circular que representa un punto de datos en la gráfica
          key={i} // Clave única del punto basada en su índice
          style={[lineStyle.dot, { left: pt.x - 5, top: pt.y, backgroundColor: color }]} // Posiciona el punto con offset de -5 px para centrarlo y aplica el color recibido
        >
          {i === points.length - 1 && ( // Solo el último punto tiene el anillo de pulso visual
            <View style={[lineStyle.dotPulse, { borderColor: color }]} /> // Anillo semitransparente alrededor del último punto para destacarlo como el más reciente
          )}{/* Cierra el condicional del anillo de pulso */}
        </View> // Cierra el punto de datos
      ))}{/* Cierra el map de puntos */}
    </View> // Cierra el contenedor principal del LineChart
  ); // Cierra el return del LineChart
}; // Cierra la definición del componente LineChart

// ─── Leyenda de torta ────────────────────────────────────────────────────────
const PieChart: React.FC<{ // Define el componente PieChart: muestra una leyenda con barras de progreso por sección de uso
  data: { label: string; value: number; color: string }[]; // Prop data: array de secciones con etiqueta, porcentaje y color
}> = ({ data }) => { // Desestructura la prop data del componente PieChart
  const C = useColors(); // Obtiene los colores dinámicos del tema activo
  return ( // Inicia el retorno del JSX del PieChart
    <View style={pie.container}>{/* Contenedor principal del PieChart con separación entre filas */}
      <View style={pie.legend}>{/* Contenedor de la leyenda con separación entre elementos */}
        {data.map((item, i) => ( // Itera sobre cada sección para renderizar su fila de leyenda
          <View key={i} style={pie.legendRow}>{/* Fila de leyenda: punto de color, etiqueta, barra de progreso y porcentaje */}
            <View style={[pie.dot, { backgroundColor: item.color }]} />{/* Punto circular con el color de la sección para identificarla visualmente */}
            <Text style={[pie.legendLabel, { color: C.textSecondary }]}>{item.label}</Text>{/* Etiqueta de la sección con color secundario del tema */}
            <View style={[pie.barTrack, { backgroundColor: C.border }]}>{/* Pista de la barra de progreso con color de borde del tema */}
              <View style={[pie.barFill, { width: `${item.value}%` as any, backgroundColor: item.color }]} />{/* Relleno de la barra proporcional al porcentaje de la sección, con el color de la misma */}
            </View>{/* Cierra la pista de la barra de progreso */}
            <Text style={[pie.legendValue, { color: item.color }]}>{item.value}%</Text>{/* Porcentaje de uso de la sección con el color correspondiente */}
          </View> // Cierra la fila de leyenda individual
        ))}{/* Cierra el map de filas de leyenda */}
      </View>{/* Cierra el contenedor de leyenda */}
    </View> // Cierra el contenedor principal del PieChart
  ); // Cierra el return del PieChart
}; // Cierra la definición del componente PieChart

// ─── Estilos de gráficas ──────────────────────────────────────────────────────
const bar = StyleSheet.create({ // Crea el objeto de estilos del componente BarChart
  container: { marginVertical: 8 }, // Línea 150 — margen vertical de 8 px para separar la gráfica de los elementos adyacentes
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 130 }, // Línea 151 — contenedor de barras en fila, alineadas desde la base, con separación de 4 px y altura de 130 px
  barGroup: { alignItems: 'center', flex: 1, justifyContent: 'flex-end' }, // Línea 152 — grupo de cada barra: centra horizontalmente, ocupa espacio flexible y alinea el contenido al fondo
  valueLabel: { fontSize: 9, color: Colors.textHint, marginBottom: 3, fontWeight: '600' }, // Línea 153 — etiqueta del valor sobre la barra: tamaño 9, gris, margen inferior de 3 px y semi-negrita
  barWrap: { width: '80%', borderRadius: 6, overflow: 'hidden' }, // Línea 154 — contenedor de la barra: 80% del ancho del grupo, bordes redondeados y recorte del degradado
  bar: { flex: 1, borderRadius: 6 }, // Línea 155 — barra interior con degradado: ocupa toda la altura del contenedor con bordes redondeados
  barLabel: { fontSize: 9, color: Colors.textHint, marginTop: 5 }, // Línea 156 — etiqueta del eje X bajo la barra: tamaño 9, gris y con margen superior de 5 px
}); // Cierra los estilos del BarChart

const lineStyle = StyleSheet.create({ // Crea el objeto de estilos del componente LineChart
  container: { position: 'relative', width: '100%', overflow: 'hidden' }, // Línea 160 — contenedor con posición relativa, ancho completo y recorte de contenido desbordado
  segment: { // Línea 161 — inicia el estilo base de los segmentos de línea entre puntos
    position: 'absolute', height: 2, borderRadius: 1, // Línea 162 — posición absoluta, altura de 2 px y borde redondeado para apariencia de línea suave
    transformOrigin: 'left center', // Línea 163 — origen de la rotación en el extremo izquierdo del segmento para conectar correctamente con el punto de inicio
  }, // Cierra el estilo segment
  dot: { // Línea 165 — inicia el estilo base de los puntos de la gráfica de líneas
    position: 'absolute', width: 10, height: 10, // Línea 166 — punto circular de 10 x 10 px posicionado absolutamente
    borderRadius: 5, borderWidth: 2, borderColor: '#fff', // Línea 167 — borde circular completo con borde blanco de 2 px para contraste
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, // Línea 168 — sombra negra desplazada 1 px hacia abajo para dar profundidad al punto
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 2, // Línea 169 — sombra con opacidad 20%, difuminado 2 px y elevación en Android
  }, // Cierra el estilo dot
  dotPulse: { // Línea 171 — inicia el estilo del anillo de pulso del último punto
    position: 'absolute', width: 18, height: 18, // Línea 172 — anillo de 18 x 18 px posicionado absolutamente alrededor del punto
    borderRadius: 9, borderWidth: 2, opacity: 0.35, // Línea 173 — forma circular completa con borde de 2 px y opacidad reducida al 35%
    top: -4, left: -4, // Línea 174 — desplazado -4 px en ambos ejes para centrar el anillo sobre el punto de 10 px
  }, // Cierra el estilo dotPulse
}); // Cierra los estilos del LineChart

const pie = StyleSheet.create({ // Crea el objeto de estilos del componente PieChart
  container: { gap: 10 }, // Línea 179 — contenedor principal del PieChart con separación de 10 px entre filas
  legend: { gap: 10 }, // Línea 180 — contenedor de la leyenda con separación de 10 px entre filas
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, // Línea 181 — fila de leyenda en dirección horizontal con centrado vertical y separación de 8 px
  dot: { width: 10, height: 10, borderRadius: 5 }, // Línea 182 — punto circular de 10 px que identifica el color de cada sección
  legendLabel: { fontSize: 12, color: Colors.textSecondary, width: 80 }, // Línea 183 — etiqueta de la sección: tamaño 12, gris secundario y ancho fijo de 80 px para alineación
  barTrack: { // Línea 184 — inicia el estilo de la pista (fondo) de la barra de progreso
    flex: 1, height: 6, backgroundColor: '#F3F4F6', // Línea 185 — ocupa el espacio flexible, altura de 6 px y fondo gris claro como pista
    borderRadius: 3, overflow: 'hidden', // Línea 186 — bordes redondeados de 3 px y recorte del relleno dentro de la pista
  }, // Cierra el estilo barTrack
  barFill: { height: '100%', borderRadius: 3 }, // Línea 188 — relleno de la barra: ocupa toda la altura de la pista con bordes redondeados (ancho se define en JSX con el porcentaje)
  legendValue: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' }, // Línea 189 — porcentaje de la sección: tamaño 12, negrita, ancho fijo de 36 px y alineación a la derecha
}); // Cierra los estilos del PieChart

// ─── Datos ────────────────────────────────────────────────────────────────────
const WEEKLY_DATA = [ // Array mock de actividad semanal (dato temporal, debe conectarse con ENDPOINTS.stats)
  { label: 'Lun', value: 30 }, // Dato mock: 30 traducciones el lunes
  { label: 'Mar', value: 45 }, // Dato mock: 45 traducciones el martes
  { label: 'Mié', value: 38 }, // Dato mock: 38 traducciones el miércoles
  { label: 'Jue', value: 52 }, // Dato mock: 52 traducciones el jueves
  { label: 'Vie', value: 60 }, // Dato mock: 60 traducciones el viernes
  { label: 'Sáb', value: 80 }, // Dato mock: 80 traducciones el sábado (punto máximo)
  { label: 'Dom', value: 70 }, // Dato mock: 70 traducciones el domingo
]; // Cierra el array WEEKLY_DATA

const MONTHLY_LINE = [10, 15, 20, 28, 35, 42, 50, 55, 62, 68, 74, 80]; // Array mock de crecimiento mensual de usuarios en 12 meses (dato temporal, debe conectarse con ENDPOINTS.stats)


// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps { // Define la interfaz de props del componente StatCard
  title: string; // Prop title: título de la tarjeta de estadística
  description: string; // Prop description: texto descriptivo que aparece al pie de la tarjeta
  accentColor: string; // Prop accentColor: color de la línea de acento izquierda de la tarjeta
  children: React.ReactNode; // Prop children: contenido interior de la tarjeta (gráficas u otros elementos)
} // Cierra la interfaz StatCardProps

const StatCard: React.FC<StatCardProps> = ({ title, description, accentColor, children }) => { // Define el componente StatCard: contenedor reutilizable con título, acento y descripción para gráficas
  const C = useColors(); // Obtiene los colores dinámicos del tema activo
  return ( // Inicia el retorno del JSX del StatCard
    <View style={[styles.card, { backgroundColor: C.surface }]}>{/* Tarjeta con fondo de superficie del tema activo */}
      <View style={styles.cardHeader}>{/* Encabezado de la tarjeta con línea de acento y título */}
        <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />{/* Línea vertical de acento con el color recibido como prop */}
        <Text style={[styles.cardTitle, { color: C.textPrimary }]}>{title}</Text>{/* Título de la tarjeta con color de texto primario del tema */}
      </View>{/* Cierra el encabezado del StatCard */}
      {children}{/* Renderiza el contenido interior de la tarjeta (gráficas) */}
      <Text style={[styles.cardDesc, { color: C.textSecondary }]}>{description}</Text>{/* Descripción al pie de la tarjeta con color de texto secundario */}
    </View> // Cierra la tarjeta StatCard
  ); // Cierra el return del StatCard
}; // Cierra la definición del componente StatCard

// ─── Pantalla principal ───────────────────────────────────────────────────────
export const StatsScreen: React.FC = () => { // Define y exporta el componente funcional StatsScreen: pantalla de estadísticas de la aplicación
  const { width } = useWindowDimensions(); // Obtiene el ancho actual de la ventana para cálculos de layout responsivo
  const isTablet = width >= 768; // Booleano que indica si el dispositivo tiene ancho de tablet (≥ 768 px)
  const isDesktop = width >= 1024; // Booleano que indica si el dispositivo tiene ancho de escritorio (≥ 1024 px)
  const C = useColors(); // Obtiene el objeto de colores dinámicos según el tema activo
  const { isDark } = useTheme(); // Obtiene el estado del tema: isDark es true cuando está activado el modo oscuro
  const { t } = useTranslation();

  const SECTION_PIE = [
    { label: t('sectionTranslation'), value: 47, color: Colors.primary },
    { label: t('sectionAlphabet'),    value: 29, color: '#06B6D4' },
    { label: t('sectionHistory'),     value: 24, color: '#10B981' },
  ];

  const KPI_CARDS = [
    { label: t('kpiTranslations'),  value: '1,248', icon: 'swap-horizontal-outline' as const, gradient: ['#EDE9FE', '#DDD6FE'] as [string, string], darkGradient: ['#2D1F4E', '#1E183A'] as [string, string], color: Colors.primary },
    { label: t('kpiActiveUsers'),   value: '342',   icon: 'people-outline' as const,          gradient: ['#DBEAFE', '#BFDBFE'] as [string, string], darkGradient: ['#1A2744', '#111B35'] as [string, string], color: '#2563EB' },
    { label: t('kpiHoursLearned'),  value: '89h',   icon: 'school-outline' as const,          gradient: ['#D1FAE5', '#A7F3D0'] as [string, string], darkGradient: ['#0F2920', '#0A1E16'] as [string, string], color: '#059669' },
    { label: t('kpiSignsLearned'),  value: '84',    icon: 'hand-left-outline' as const,       gradient: ['#FEF3C7', '#FDE68A'] as [string, string], darkGradient: ['#2A1E0A', '#1C1508'] as [string, string], color: '#D97706' },
  ];

  return ( // Inicia el retorno del JSX del componente StatsScreen
    <View style={[styles.root, { backgroundColor: C.backgroundGray }]}>{/* Contenedor raíz que ocupa toda la pantalla con color de fondo del tema */}
      <AppHeader />{/* Renderiza el encabezado superior de la aplicación */}
      <ScrollView // Contenedor con scroll vertical para el contenido de estadísticas
        style={styles.scroll} // Estilo base del ScrollView: ocupa todo el espacio disponible
        contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]} // Padding adicional en desktop para pantallas anchas
        showsVerticalScrollIndicator={false} // Oculta la barra de scroll vertical para una interfaz más limpia
      >
        <View style={[styles.innerWrapper, isDesktop && styles.innerWrapperWide]}>{/* Contenedor interno con ancho máximo en desktop */}

          {/* KPI Cards — 4 cols en desktop, 2 en tablet/mobile */}
          <View style={[styles.kpiGrid, isDesktop && styles.kpiGridDesktop]}>{/* Grilla de tarjetas KPI: flex wrap en tablet/mobile, sin wrap en desktop */}
            {KPI_CARDS.map((kpi, i) => ( // Itera sobre las tarjetas KPI para renderizarlas
              <LinearGradient key={i} colors={isDark ? kpi.darkGradient : kpi.gradient} style={[styles.kpiCard, isDesktop && styles.kpiCardDesktop]}>{/* Tarjeta KPI con degradado que cambia según el tema (claro/oscuro) */}
                <Ionicons name={kpi.icon} size={20} color={kpi.color} />{/* Ícono de la métrica KPI con el color correspondiente a la categoría */}
                <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>{/* Valor numérico grande de la KPI con color de la categoría */}
                <Text style={[styles.kpiLabel, { color: C.textSecondary }]}>{kpi.label}</Text>{/* Etiqueta descriptiva de la KPI con color secundario del tema */}
              </LinearGradient> // Cierra la tarjeta KPI con degradado
            ))}{/* Cierra el map de tarjetas KPI */}
          </View>{/* Cierra la grilla de tarjetas KPI */}

          {/* Stat Cards */}
          <View style={[styles.cardsGrid, isTablet && styles.cardsGridTablet]}>{/* Grilla de StatCards: columna en móvil, flex wrap en tablet */}
            <StatCard
              title={t('statsWeeklyTitle')}
              accentColor={Colors.primary}
              description={t('statsWeeklyDesc')}
            >
              <BarChart data={WEEKLY_DATA} colors={['#A78BFA', '#7C3AED']} />{/* Gráfica de barras con datos semanales mock y degradado morado */}
            </StatCard>{/* Cierra la primera StatCard */}

            <StatCard
              title={t('statsMonthlyTitle')}
              accentColor="#06B6D4"
              description={t('statsMonthlyDesc')}
            >
              <LineChart data={MONTHLY_LINE} color={Colors.primary} />{/* Gráfica de líneas con datos mensuales mock y color morado */}
            </StatCard>{/* Cierra la segunda StatCard */}

            <StatCard
              title={t('statsVolumeTitle')}
              accentColor="#10B981"
              description={t('statsVolumeDesc')}
            >
              <BarChart // Gráfica de barras con datos semanales mock y degradado cian
                data={[ // Array inline de datos semanales mock para la gráfica de volumen
                  { label: 'Sem 1', value: 20 }, // Dato mock: 20 traducciones en la semana 1
                  { label: 'Sem 2', value: 28 }, // Dato mock: 28 traducciones en la semana 2
                  { label: 'Sem 3', value: 35 }, // Dato mock: 35 traducciones en la semana 3
                  { label: 'Sem 4', value: 45 }, // Dato mock: 45 traducciones en la semana 4 (máximo)
                ]} // Cierra el array de datos inline
                colors={['#67E8F9', '#06B6D4']} // Degradado cian claro a cian oscuro para las barras
              />
            </StatCard>{/* Cierra la tercera StatCard */}

            <StatCard
              title={t('statsSectionTitle')}
              accentColor="#F59E0B"
              description={t('statsSectionDesc')}
            >
              <PieChart data={SECTION_PIE} />{/* Leyenda de distribución por sección con datos mock */}
            </StatCard>{/* Cierra la cuarta StatCard */}
          </View>{/* Cierra la grilla de StatCards */}

        </View>{/* Cierra el contenedor interno (innerWrapper) */}
      </ScrollView>{/* Cierra el ScrollView de la pantalla */}
    </View> // Cierra el contenedor raíz de la pantalla
  ); // Cierra el return del componente StatsScreen
}; // Cierra la definición del componente funcional StatsScreen

const styles = StyleSheet.create({ // Crea el objeto de estilos estáticos de la pantalla de estadísticas
  root: { flex: 1, backgroundColor: Colors.backgroundGray }, // Línea 320 — flex: 1 ocupa toda la pantalla; backgroundColor establece el fondo gris claro
  scroll: { flex: 1 }, // Línea 321 — flex: 1 hace que el ScrollView ocupe todo el espacio vertical disponible
  content: { padding: 20, paddingBottom: 40, alignItems: 'center' }, // Línea 322 — padding de 20 px en todos los lados, 40 px abajo y centra los hijos horizontalmente
  contentDesktop: { paddingHorizontal: 48, paddingVertical: 32 }, // Línea 323 — aumenta el padding horizontal y vertical para pantallas de escritorio
  innerWrapper: { width: '100%', gap: 16 }, // Línea 324 — ancho completo con separación de 16 px entre secciones
  innerWrapperWide: { maxWidth: 960, alignSelf: 'center' }, // Línea 325 — limita el ancho máximo a 960 px y centra el contenido en desktop

  // KPI
  kpiGrid: { // Línea 328 — inicia el estilo de la grilla de tarjetas KPI
    flexDirection: 'row', // Línea 329 — dispone las tarjetas KPI en fila horizontal
    flexWrap: 'wrap', // Línea 330 — permite que las tarjetas pasen a la siguiente fila si no caben (tablet/mobile)
    gap: 12, // Línea 331 — separación de 12 px entre tarjetas KPI
    marginBottom: 4, // Línea 332 — margen inferior de 4 px para separar la grilla KPI de las StatCards
  }, // Cierra el estilo kpiGrid
  kpiGridDesktop: { flexWrap: 'nowrap' }, // Línea 334 — en desktop deshabilita el wrap para mantener las 4 tarjetas en una sola fila
  kpiCard: { // Línea 335 — inicia el estilo base de cada tarjeta KPI
    flex: 1, // Línea 336 — cada tarjeta KPI ocupa el mismo espacio flexible dentro de la grilla
    minWidth: '45%', // Línea 337 — ancho mínimo del 45% para forzar 2 columnas en tablet/mobile
    borderRadius: 20, // Línea 338 — bordes redondeados de 20 px para la tarjeta
    padding: 18, // Línea 339 — padding interno de 18 px en todos los lados
    gap: 6, // Línea 340 — separación de 6 px entre el ícono, el valor y la etiqueta
    shadowColor: '#000', // Línea 341 — sombra negra sutil para la tarjeta KPI
    shadowOffset: { width: 0, height: 3 }, // Línea 342 — sombra desplazada 3 px hacia abajo
    shadowOpacity: 0.07, // Línea 343 — opacidad de la sombra al 7%, muy sutil
    shadowRadius: 10, // Línea 344 — difuminado de 10 px para la sombra
    elevation: 3, // Línea 345 — elevación en Android
  }, // Cierra el estilo kpiCard
  kpiCardDesktop: { minWidth: 0 }, // Línea 347 — en desktop elimina el ancho mínimo para que las tarjetas se repartan equitativamente
  kpiValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 }, // Línea 348 — valor numérico grande: tamaño 24, extra negrita y letras ligeramente comprimidas
  kpiLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' }, // Línea 349 — etiqueta de la KPI: tamaño 12, color secundario y peso medio

  // StatCard grid
  cardsGrid: { gap: 14 }, // Línea 352 — grilla de StatCards con separación vertical de 14 px entre tarjetas
  cardsGridTablet: { flexDirection: 'row', flexWrap: 'wrap' }, // Línea 353 — en tablet/desktop las tarjetas se muestran en fila con wrap

  // StatCard
  card: { // Línea 356 — inicia el estilo de cada tarjeta StatCard
    flex: 1, // Línea 357 — cada tarjeta ocupa el espacio flexible disponible en la grilla
    minWidth: 280, // Línea 358 — ancho mínimo de 280 px para garantizar legibilidad de las gráficas
    backgroundColor: '#fff', // Línea 359 — fondo blanco base (sobreescrito por tema en JSX)
    borderRadius: 22, // Línea 360 — bordes muy redondeados de 22 px para la tarjeta
    padding: 20, // Línea 361 — padding interno de 20 px en todos los lados
    shadowColor: '#000', // Línea 362 — sombra negra sutil para dar profundidad a la tarjeta
    shadowOffset: { width: 0, height: 4 }, // Línea 363 — sombra desplazada 4 px hacia abajo
    shadowOpacity: 0.08, // Línea 364 — opacidad de la sombra al 8%
    shadowRadius: 14, // Línea 365 — difuminado de 14 px para la sombra
    elevation: 4, // Línea 366 — elevación en Android
  }, // Cierra el estilo card
  cardHeader: { // Línea 368 — inicia el estilo del encabezado de la StatCard
    flexDirection: 'row', // Línea 369 — alinea la línea de acento y el título en fila horizontal
    alignItems: 'center', // Línea 370 — centra verticalmente los elementos del encabezado
    gap: 12, // Línea 371 — separación de 12 px entre la línea de acento y el título
    marginBottom: 16, // Línea 372 — margen inferior de 16 px para separar el encabezado del contenido de la gráfica
  }, // Cierra el estilo cardHeader
  cardAccent: { width: 4, height: 20, borderRadius: 2 }, // Línea 374 — línea vertical de acento: 4 px de ancho, 20 px de alto y bordes redondeados (color en JSX)
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary }, // Línea 375 — título de la StatCard: tamaño 15, negrita y color primario
  cardDesc: { // Línea 376 — inicia el estilo del texto descriptivo al pie de la StatCard
    fontSize: 13, // Línea 377 — tamaño de fuente pequeño de 13 px para la descripción
    color: Colors.textSecondary, // Línea 378 — color gris secundario para la descripción (sobreescrito por tema en JSX)
    lineHeight: 20, // Línea 379 — altura de línea de 20 px para mejorar la legibilidad del texto descriptivo
    marginTop: 14, // Línea 380 — margen superior de 14 px para separar la descripción del contenido de la gráfica
  }, // Cierra el estilo cardDesc
}); // Cierra el objeto StyleSheet.create de la pantalla de estadísticas
