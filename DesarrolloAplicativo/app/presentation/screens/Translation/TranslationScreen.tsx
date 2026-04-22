// Archivo: app/presentation/screens/Translation/TranslationScreen.tsx
/**
 * @file TranslationScreen.tsx
 * @description Pantalla principal de traducción de señas.
 *
 * Permite alternar entre dos modos:
 * - **Seña → Texto** (`sena_texto`): activa la cámara para detectar señas en tiempo real.
 *   Muestra un marco de detección y badge "EN VIVO".
 * - **Texto → Seña** (`texto_sena`): campo de texto donde el usuario escribe y
 *   obtiene la traducción correspondiente.
 *
 * La cámara usa una imagen placeholder (`camera_placeholder.jpg`) hasta que se integre
 * el módulo real de IA. La traducción también es simulada con un `setTimeout`.
 *
 * El layout se adapta a tablet (≥ 768 px) y desktop (≥ 1024 px) con ancho máximo de 760 px.
 *
 * @todo Integrar la cámara real con el módulo de reconocimiento de señas por IA.
 * @todo Conectar con `ENDPOINTS.translate` para traducciones reales.
 */
import React, { useState, useCallback } from 'react'; // Importa React y los hooks useState y useCallback desde la librería principal de React
import {
  View, // Importa View: contenedor base para layouts, equivalente a un div
  Text, // Importa Text: componente para mostrar texto en pantalla
  StyleSheet, // Importa StyleSheet: utilidad para crear estilos optimizados para React Native
  TouchableOpacity, // Importa TouchableOpacity: botón táctil que reduce opacidad al presionar
  TextInput, // Importa TextInput: campo de entrada de texto editable
  ScrollView, // Importa ScrollView: contenedor con scroll vertical u horizontal
  Image, // Importa Image: componente para mostrar imágenes locales o remotas
  Alert, // Importa Alert: API para mostrar diálogos nativos de alerta/confirmación
  useWindowDimensions, // Importa useWindowDimensions: hook que devuelve el ancho y alto de la ventana actual
} from 'react-native'; // Todos los anteriores provienen del paquete principal de React Native
import { LinearGradient } from 'expo-linear-gradient'; // Importa LinearGradient de 'expo-linear-gradient': componente para degradados de color
import { Ionicons } from '@expo/vector-icons'; // Importa Ionicons de '@expo/vector-icons': librería de íconos vectoriales de Expo
import { AppHeader } from '../../components/common/AppHeader'; // Importa AppHeader desde app/presentation/components/common/AppHeader: encabezado superior reutilizable de la app
import { Colors } from '../../../constants/colors'; // Importa Colors desde app/constants/colors: paleta de colores centralizada del proyecto
import { useColors } from '../../../state/ThemeContext'; // Importa useColors desde app/state/ThemeContext: hook que devuelve los colores según el tema (claro/oscuro) activo

type Mode = 'sena_texto' | 'texto_sena'; // Define el tipo Mode: unión de los dos modos de traducción disponibles en la pantalla

const TIPS = [ // Define el array TIPS: lista de consejos que se muestran en modo Seña→Texto (dato estático, no proviene del backend)
  { icon: 'hand-left-outline' as const, text: 'Mantén la mano centrada en cámara' }, // Tip 1: ícono de mano y texto de consejo sobre posicionamiento
  { icon: 'sunny-outline' as const, text: 'Asegura buena iluminación' }, // Tip 2: ícono de sol y consejo sobre iluminación
  { icon: 'reload-outline' as const, text: 'Repite la seña si no es detectada' }, // Tip 3: ícono de recarga y consejo para reintentar la seña
]; // Cierra el array TIPS

export const TranslationScreen: React.FC = () => { // Define y exporta el componente funcional TranslationScreen: es la pantalla principal de traducción
  const { width } = useWindowDimensions(); // Obtiene el ancho actual de la ventana para cálculos de layout responsivo
  const isTablet = width >= 768; // Booleano que indica si el dispositivo tiene ancho de tablet (≥ 768 px)
  const isDesktop = width >= 1024; // Booleano que indica si el dispositivo tiene ancho de escritorio (≥ 1024 px)
  const C = useColors(); // Obtiene el objeto de colores dinámicos según el tema activo (claro u oscuro)

  const [mode, setMode] = useState<Mode>('sena_texto'); // Estado del modo de traducción activo: 'sena_texto' activa la cámara, 'texto_sena' activa el campo de texto
  const [text, setText] = useState(''); // Estado del texto escrito por el usuario en el modo Texto→Seña
  const [result, setResult] = useState(''); // Estado del texto de resultado de la traducción que se muestra en la tarjeta de resultado
  const [isActive, setIsActive] = useState(false); // Estado que indica si la cámara/traducción está activa en modo Seña→Texto
  const [loading, setLoading] = useState(false); // Estado que indica si hay una traducción en proceso (muestra "Traduciendo..." en el botón)

  const handleAction = useCallback(() => { // Handler principal del botón de acción: inicia/detiene la cámara en modo seña o ejecuta la traducción en modo texto
    if (mode === 'sena_texto') { // Verifica si el modo activo es Seña→Texto
      setIsActive(prev => !prev); // Alterna el estado activo de la cámara (inicia o detiene)
      if (isActive) setResult(''); // Si la cámara estaba activa y se detiene, limpia el resultado anterior
    } else { // Si el modo es Texto→Seña
      if (!text.trim()) { Alert.alert('', 'Escribe algo para traducir'); return; } // Valida que el campo de texto no esté vacío; muestra alerta si está vacío y cancela
      setLoading(true); // Activa el estado de carga para mostrar el indicador "Traduciendo..."
      setTimeout(() => { // Simula una llamada asíncrona al backend con un retardo de 1200 ms (temporal, debe reemplazarse con llamada real)
        setResult('Traducción simulada: ' + text); // Establece el resultado con texto de prueba concatenado con la entrada del usuario
        setLoading(false); // Desactiva el estado de carga una vez finalizada la simulación
      }, 1200); // Retardo de 1200 milisegundos que simula el tiempo de respuesta del servidor
    } // Cierra el bloque else del modo texto_sena
  }, [mode, text, isActive]); // Dependencias del useCallback: se recrea solo cuando cambia el modo, el texto o el estado activo

  const switchMode = useCallback((m: Mode) => { // Handler para cambiar el modo de traducción: limpia todos los estados relacionados antes de cambiar
    setMode(m); // Actualiza el modo activo al nuevo valor recibido como parámetro
    setResult(''); // Limpia el resultado anterior al cambiar de modo
    setText(''); // Limpia el texto ingresado al cambiar de modo
    setIsActive(false); // Desactiva la cámara al cambiar de modo
  }, []); // Sin dependencias: la función no depende de ningún estado externo

  return ( // Inicia el retorno del JSX del componente TranslationScreen
    <View style={[styles.root, { backgroundColor: C.backgroundGray }]}> {/* Contenedor raíz que ocupa toda la pantalla con color de fondo según el tema */}
      <AppHeader /> {/* Renderiza el encabezado superior de la aplicación con título y controles globales */}
      <ScrollView // Contenedor con scroll vertical para el contenido de la pantalla
        style={styles.scroll} // Estilo base del ScrollView: ocupa todo el espacio disponible
        contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]} // Estilo del contenido interior: aplica padding adicional en desktop
        showsVerticalScrollIndicator={false} // Oculta la barra de scroll vertical para una interfaz más limpia
      >
        <View style={[styles.innerWrapper, isTablet && styles.innerWrapperWide]}> {/* Contenedor interno que centra y limita el ancho del contenido en tablet/desktop */}

        {/* ── Toggle de modo ── */}
        <View style={[styles.modeToggle, { backgroundColor: C.surface, borderColor: C.border }]}> {/* Contenedor del selector de modo con fondo de superficie y borde según tema */}
          <TouchableOpacity // Botón táctil para seleccionar el modo Seña→Texto
            style={[styles.modeBtn, mode === 'sena_texto' && styles.modeBtnActive]} // Aplica estilo activo si el modo actual es sena_texto
            onPress={() => switchMode('sena_texto')} // Al presionar, cambia el modo a sena_texto y limpia los estados
            activeOpacity={0.8} // Reduce la opacidad al 80% al presionar para indicar interacción
          >
            {mode === 'sena_texto' && ( // Muestra el degradado solo si el botón está activo (modo seleccionado)
              <LinearGradient // Fondo con degradado morado para el botón activo de modo Seña→Texto
                colors={['#9333EA', '#7C3AED']} // Colores del degradado: morado claro a morado oscuro
                style={StyleSheet.absoluteFill} // Posiciona el degradado para que cubra todo el botón
                start={{ x: 0, y: 0 }} // Punto de inicio del degradado: esquina superior izquierda
                end={{ x: 1, y: 0 }} // Punto final del degradado: esquina superior derecha (horizontal)
              />
            )} {/* Cierra el condicional del degradado del botón Seña→Texto */}
            <Ionicons name="hand-left-outline" size={18} color={mode === 'sena_texto' ? '#fff' : C.textSecondary} /> {/* Ícono de mano: blanco si está activo, color secundario si inactivo */}
            <Text style={[styles.modeBtnText, mode === 'sena_texto' && styles.modeBtnTextActive]}> {/* Texto del botón: aplica estilo blanco si el modo está activo */}
              Seña → Texto {/* Etiqueta del primer modo de traducción */}
            </Text>
          </TouchableOpacity> {/* Cierra el botón táctil del modo Seña→Texto */}

          <TouchableOpacity // Botón táctil para seleccionar el modo Texto→Seña
            style={[styles.modeBtn, mode === 'texto_sena' && styles.modeBtnActive]} // Aplica estilo activo si el modo actual es texto_sena
            onPress={() => switchMode('texto_sena')} // Al presionar, cambia el modo a texto_sena y limpia los estados
            activeOpacity={0.8} // Reduce la opacidad al 80% al presionar para indicar interacción
          >
            {mode === 'texto_sena' && ( // Muestra el degradado solo si el botón está activo (modo seleccionado)
              <LinearGradient // Fondo con degradado morado para el botón activo de modo Texto→Seña
                colors={['#9333EA', '#7C3AED']} // Colores del degradado: morado claro a morado oscuro
                style={StyleSheet.absoluteFill} // Posiciona el degradado para que cubra todo el botón
                start={{ x: 0, y: 0 }} // Punto de inicio del degradado: esquina superior izquierda
                end={{ x: 1, y: 0 }} // Punto final del degradado: esquina superior derecha (horizontal)
              />
            )} {/* Cierra el condicional del degradado del botón Texto→Seña */}
            <Ionicons name="text-outline" size={18} color={mode === 'texto_sena' ? '#fff' : C.textSecondary} /> {/* Ícono de texto: blanco si está activo, color secundario si inactivo */}
            <Text style={[styles.modeBtnText, mode === 'texto_sena' && styles.modeBtnTextActive]}> {/* Texto del botón: aplica estilo blanco si el modo está activo */}
              Texto → Seña {/* Etiqueta del segundo modo de traducción */}
            </Text>
          </TouchableOpacity> {/* Cierra el botón táctil del modo Texto→Seña */}
        </View> {/* Cierra el contenedor del toggle de modo */}

        {/* ── Área de cámara / entrada ── */}
        {mode === 'sena_texto' ? ( // Renderiza el área de cámara si el modo es Seña→Texto, o el campo de texto si es Texto→Seña
          <View style={styles.cameraCard}> {/* Contenedor de la tarjeta de cámara con bordes redondeados y sombra morada */}
            {/* Badge EN VIVO */}
            {isActive && ( // Muestra el badge "En vivo" solo cuando la cámara está activa
              <View style={styles.liveBadge}> {/* Contenedor del badge "En vivo" posicionado en la esquina superior izquierda */}
                <View style={styles.liveDot} /> {/* Punto blanco circular que indica estado de grabación activa */}
                <Text style={styles.liveText}>En vivo</Text> {/* Texto "En vivo" en color blanco con letras espaciadas */}
              </View> // Cierra el contenedor del badge "En vivo"
            )} {/* Cierra el condicional del badge "En vivo" */}

            {/* Imagen de cámara */}
            <Image // Imagen placeholder que simula la vista de la cámara
              source={require('../../../assets/images/camera_placeholder.jpg')} // Carga la imagen local desde app/assets/images/camera_placeholder.jpg (temporal, reemplazar con cámara real)
              style={styles.cameraImage} // Estilo que hace que la imagen ocupe todo el ancho y alto del contenedor
              resizeMode="cover" // Escala la imagen para cubrir el contenedor sin deformarse
            />

            {/* Overlay degradado */}
            <LinearGradient // Capa de degradado semitransparente sobre la imagen de cámara para mejorar legibilidad del texto inferior
              colors={['transparent', 'rgba(0,0,0,0.55)']} // Degradado de transparente a negro semiopaco hacia abajo
              style={styles.cameraOverlay} // Posiciona el overlay en la parte inferior de la tarjeta de cámara
            />

            {/* Marco de detección */}
            <View style={styles.detectionFrame}> {/* Contenedor del marco de detección posicionado en el centro de la imagen */}
              <View style={[styles.corner, styles.cornerTL]} /> {/* Esquina superior izquierda del marco de detección */}
              <View style={[styles.corner, styles.cornerTR]} /> {/* Esquina superior derecha del marco de detección */}
              <View style={[styles.corner, styles.cornerBL]} /> {/* Esquina inferior izquierda del marco de detección */}
              <View style={[styles.corner, styles.cornerBR]} /> {/* Esquina inferior derecha del marco de detección */}
            </View> {/* Cierra el contenedor del marco de detección */}

            {/* Label inferior */}
            <View style={styles.cameraLabel}> {/* Contenedor de la etiqueta inferior centrada sobre el degradado de la cámara */}
              <Ionicons name="camera-outline" size={14} color="#fff" /> {/* Ícono de cámara en blanco dentro de la etiqueta inferior */}
              <Text style={styles.cameraLabelText}> {/* Texto instructivo que cambia según si la cámara está activa o no */}
                {isActive ? 'Analizando señas...' : 'Toca Iniciar para activar la cámara'} {/* Muestra estado activo o instrucción para iniciar según isActive */}
              </Text>
            </View> {/* Cierra el contenedor de la etiqueta inferior de cámara */}
          </View> // Cierra la tarjeta de cámara (modo sena_texto)
        ) : ( // Rama else: renderiza el campo de texto cuando el modo es texto_sena
          <View style={[styles.inputCard, { backgroundColor: C.surface }]}> {/* Tarjeta de entrada de texto con fondo de superficie del tema activo */}
            <View style={styles.inputCardHeader}> {/* Contenedor del encabezado de la tarjeta de texto con ícono y título */}
              <Ionicons name="create-outline" size={16} color={Colors.primary} /> {/* Ícono de edición en color primario morado */}
              <Text style={[styles.inputCardTitle, { color: C.textPrimary }]}>Escribe el texto a traducir</Text> {/* Título del campo de entrada con color de texto primario del tema */}
            </View> {/* Cierra el encabezado de la tarjeta de texto */}
            <TextInput // Campo de texto multilínea donde el usuario escribe el texto a traducir
              style={[styles.textArea, { color: C.textPrimary, backgroundColor: C.backgroundGray, borderColor: C.border }]} // Estilos del área de texto con colores adaptados al tema
              value={text} // Valor controlado del campo de texto: refleja el estado 'text'
              onChangeText={setText} // Actualiza el estado 'text' en cada cambio de contenido
              placeholder="Ej: Hola, ¿cómo estás?" // Texto de ayuda que aparece cuando el campo está vacío
              placeholderTextColor={C.textHint} // Color del placeholder adaptado al tema activo
              multiline // Permite entrada de texto en múltiples líneas
              textAlignVertical="top" // Alinea el cursor al inicio (arriba) en modo multilínea
            />
            <View style={styles.charCount}> {/* Contenedor del contador de caracteres alineado a la derecha */}
              <Text style={[styles.charCountText, { color: C.textHint }]}>{text.length} caracteres</Text> {/* Muestra la cantidad de caracteres escritos en tiempo real */}
            </View> {/* Cierra el contenedor del contador de caracteres */}
          </View> // Cierra la tarjeta de entrada de texto (modo texto_sena)
        )} {/* Cierra el condicional del área de cámara / entrada */}

        {/* ── Tips (solo modo seña) ── */}
        {mode === 'sena_texto' && ( // Muestra los tips solo cuando el modo activo es Seña→Texto
          <View style={styles.tipsRow}> {/* Contenedor vertical de los chips de tips */}
            {TIPS.map((tip, i) => ( // Itera sobre el array TIPS para renderizar un chip por cada consejo
              <View key={i} style={[styles.tipChip, { backgroundColor: C.primaryBg }]}> {/* Chip de tip con fondo morado claro adaptado al tema */}
                <Ionicons name={tip.icon} size={13} color={Colors.primary} /> {/* Ícono del tip en color morado primario */}
                <Text style={styles.tipText}>{tip.text}</Text> {/* Texto del consejo dentro del chip */}
              </View> // Cierra el chip de tip individual
            ))} {/* Cierra el map de tips */}
          </View> // Cierra el contenedor de la fila de tips
        )} {/* Cierra el condicional de tips */}

        {/* ── Resultado ── */}
        <View style={[styles.resultCard, { backgroundColor: C.surface, borderColor: C.border }]}> {/* Tarjeta que muestra el resultado de la traducción con borde según el tema */}
          {/* Header del resultado */}
          <View style={[styles.resultHeader, { borderBottomColor: C.border }]}> {/* Encabezado de la tarjeta de resultado con separador inferior */}
            <LinearGradient colors={[C.primaryBg, C.primaryBg]} style={styles.resultIconBg}> {/* Fondo cuadrado con degradado morado claro para el ícono del resultado */}
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.primary} /> {/* Ícono de burbuja de chat en color morado primario */}
            </LinearGradient>
            <Text style={[styles.resultTitle, { color: C.textPrimary }]}>Traducción</Text> {/* Título "Traducción" de la tarjeta de resultado */}
            {result ? ( // Muestra el badge "Listo" si hay resultado, o "En espera" si no hay
              <View style={styles.detectedBadge}> {/* Badge verde que indica que se detectó y procesó una traducción */}
                <View style={styles.detectedDot} /> {/* Punto verde que indica éxito en la detección */}
                <Text style={styles.detectedText}>Listo</Text> {/* Texto "Listo" en color verde */}
              </View> // Cierra el badge de resultado disponible
            ) : ( // Si no hay resultado, muestra el badge de espera
              <View style={[styles.waitingBadge, { backgroundColor: C.inputBg }]}> {/* Badge gris que indica que no hay traducción disponible aún */}
                <Text style={[styles.waitingText, { color: C.textHint }]}>En espera</Text> {/* Texto "En espera" en color de sugerencia del tema */}
              </View> // Cierra el badge de espera
            )} {/* Cierra el condicional del badge de estado */}
          </View> {/* Cierra el encabezado de la tarjeta de resultado */}

          {/* Contenido */}
          <View style={styles.resultBody}> {/* Cuerpo de la tarjeta de resultado con altura mínima garantizada */}
            {result ? ( // Muestra el texto del resultado si existe, o el estado vacío si no
              <> {/* Fragmento que agrupa el texto del resultado y el botón de copiar */}
                <Text style={[styles.resultText, { color: C.textPrimary }]}>{result}</Text> {/* Texto de la traducción obtenida en tamaño y peso destacado */}
                <TouchableOpacity // Botón para copiar el texto de la traducción al portapapeles
                  style={[styles.copyBtn, { backgroundColor: C.primaryBg }]} // Estilo del botón de copiar con fondo morado claro
                  onPress={() => Alert.alert('Copiado', 'Texto copiado al portapapeles')} // Al presionar muestra un Alert confirmando la acción de copiar (simulado)
                >
                  <Ionicons name="copy-outline" size={14} color={Colors.primary} /> {/* Ícono de copiar en color morado primario */}
                  <Text style={styles.copyBtnText}>Copiar</Text> {/* Texto "Copiar" del botón de copia */}
                </TouchableOpacity> {/* Cierra el botón de copiar */}
              </> // Cierra el fragmento del contenido con resultado
            ) : ( // Si no hay resultado, muestra el estado vacío con instrucción
              <View style={styles.resultEmpty}> {/* Contenedor del estado vacío centrado vertical y horizontalmente */}
                <Ionicons name="scan-outline" size={32} color={Colors.primaryLighter} /> {/* Ícono de escaneo grande en color morado claro como indicador visual de espera */}
                <Text style={[styles.resultEmptyText, { color: C.textHint }]}> {/* Texto de instrucción cuando no hay resultado disponible */}
                  {mode === 'sena_texto' // Selecciona el mensaje según el modo activo
                    ? 'La traducción aparecerá aquí al detectar una seña' // Mensaje para el modo Seña→Texto
                    : 'Escribe un texto y toca Traducir'} {/* Mensaje para el modo Texto→Seña */}
                </Text>
              </View> // Cierra el contenedor del estado vacío
            )} {/* Cierra el condicional de contenido del resultado */}
          </View> {/* Cierra el cuerpo de la tarjeta de resultado */}
        </View> {/* Cierra la tarjeta de resultado */}

        {/* ── Botón principal ── */}
        <TouchableOpacity // Botón principal de acción: inicia/detiene la cámara o ejecuta la traducción
          onPress={handleAction} // Al presionar llama al handler de acción principal
          activeOpacity={0.85} // Reduce la opacidad al 85% al presionar
          disabled={loading} // Deshabilita el botón mientras hay una traducción en proceso
          style={styles.actionBtnWrapper} // Contenedor del botón con sombra y bordes redondeados
        >
          <LinearGradient // Fondo con degradado del botón: rojo si está activo (detener), morado si inactivo (iniciar/traducir)
            colors={isActive ? ['#DC2626', '#B91C1C'] : ['#9333EA', '#7C3AED', '#6D28D9']} // Degradado rojo para detener, morado para iniciar/traducir
            start={{ x: 0, y: 0 }} // Punto de inicio del degradado: esquina superior izquierda
            end={{ x: 1, y: 1 }} // Punto final del degradado: esquina inferior derecha (diagonal)
            style={styles.actionBtn} // Estilo del botón: flex row, padding generoso, bordes redondeados
          >
            {loading ? ( // Si hay carga muestra solo el texto "Traduciendo..."
              <Text style={styles.actionBtnText}>Traduciendo...</Text> // Texto de estado durante la traducción simulada
            ) : mode === 'sena_texto' ? ( // Si no hay carga, verifica el modo para mostrar el ícono y texto correctos
              <> {/* Fragmento para el modo Seña→Texto: muestra ícono de play/stop y etiqueta */}
                <Ionicons name={isActive ? 'stop-circle-outline' : 'play-circle-outline'} size={22} color="#fff" /> {/* Ícono stop si está activo, play si inactivo */}
                <Text style={styles.actionBtnText}>{isActive ? 'Detener' : 'Iniciar traducción'}</Text> {/* Etiqueta que cambia según el estado de la cámara */}
              </> // Cierra el fragmento del modo Seña→Texto
            ) : ( // Modo Texto→Seña: muestra ícono de idioma y texto "Traducir a señas"
              <> {/* Fragmento para el modo Texto→Seña */}
                <Ionicons name="language-outline" size={22} color="#fff" /> {/* Ícono de idioma/lenguaje en color blanco */}
                <Text style={styles.actionBtnText}>Traducir a señas</Text> {/* Etiqueta del botón en modo Texto→Seña */}
              </> // Cierra el fragmento del modo Texto→Seña
            )} {/* Cierra el condicional del contenido del botón */}
          </LinearGradient> {/* Cierra el degradado del botón principal */}
        </TouchableOpacity> {/* Cierra el botón táctil principal */}

        </View> {/* Cierra el contenedor interno (innerWrapper) */}
      </ScrollView> {/* Cierra el ScrollView de la pantalla */}
    </View> // Cierra el contenedor raíz de la pantalla
  ); // Cierra el return del componente TranslationScreen
}; // Cierra la definición del componente funcional TranslationScreen

const CORNER_SIZE = 20; // Constante que define el tamaño en px de cada esquina del marco de detección
const CORNER_WIDTH = 3; // Constante que define el grosor en px del borde de cada esquina del marco

const styles = StyleSheet.create({ // Crea el objeto de estilos estáticos de la pantalla usando StyleSheet.create para optimización
  root: { flex: 1, backgroundColor: Colors.backgroundGray }, // Línea 287 — flex: 1 hace que el contenedor raíz ocupe toda la pantalla; backgroundColor establece el fondo gris claro
  scroll: { flex: 1 }, // Línea 288 — flex: 1 hace que el ScrollView ocupe todo el espacio vertical disponible
  content: { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40, alignItems: 'center' }, // Línea 289 — paddingHorizontal/Vertical dan margen interior al contenido; alignItems: 'center' centra los hijos horizontalmente
  contentDesktop: { paddingHorizontal: 48, paddingVertical: 32 }, // Línea 290 — aumenta el padding horizontal y vertical para pantallas de escritorio
  innerWrapper: { width: '100%', gap: 18 }, // Línea 291 — width: '100%' hace que el wrapper ocupe todo el ancho disponible; gap: 18 separa verticalmente cada sección
  innerWrapperWide: { maxWidth: 760, alignSelf: 'center' }, // Línea 292 — limita el ancho máximo a 760 px y centra el contenido en tablet/desktop

  // ── Toggle ──
  modeToggle: { // Línea 295 — inicia el estilo del contenedor del toggle de modo
    flexDirection: 'row', // Línea 296 — flexDirection: 'row' coloca los botones del toggle en fila horizontal
    backgroundColor: '#fff', // Línea 297 — fondo blanco base del toggle (sobreescrito por tema en JSX)
    borderRadius: 18, // Línea 298 — borderRadius: 18 da bordes muy redondeados tipo píldora al toggle
    borderWidth: 1.5, // Línea 299 — borderWidth: 1.5 define un borde delgado alrededor del toggle
    borderColor: Colors.primaryLighter, // Línea 300 — color del borde en morado claro de la paleta del proyecto
    overflow: 'hidden', // Línea 301 — overflow: 'hidden' recorta el degradado de los botones activos al borde redondeado
    alignSelf: 'center', // Línea 302 — alignSelf: 'center' centra el toggle horizontalmente en su contenedor padre
    shadowColor: '#7C3AED', // Línea 303 — color de la sombra en morado para reforzar la identidad visual
    shadowOffset: { width: 0, height: 4 }, // Línea 304 — desplaza la sombra 4 px hacia abajo (sin desplazamiento horizontal)
    shadowOpacity: 0.1, // Línea 305 — opacidad de la sombra al 10%, sutil
    shadowRadius: 10, // Línea 306 — radio de difuminado de la sombra de 10 px
    elevation: 4, // Línea 307 — nivel de elevación en Android equivalente a la sombra de iOS
  }, // Cierra el estilo modeToggle
  modeBtn: { // Línea 309 — inicia el estilo base de cada botón del toggle de modo
    flexDirection: 'row', // Línea 310 — alinea el ícono y el texto del botón en fila horizontal
    alignItems: 'center', // Línea 311 — centra verticalmente el ícono y el texto dentro del botón
    justifyContent: 'center', // Línea 312 — centra horizontalmente el contenido del botón
    paddingVertical: 13, // Línea 313 — padding vertical de 13 px para dar altura suficiente al botón
    paddingHorizontal: 24, // Línea 314 — padding horizontal de 24 px para dar ancho cómodo al botón
    gap: 8, // Línea 315 — espacio de 8 px entre el ícono y el texto del botón
    overflow: 'hidden', // Línea 316 — recorta el degradado LinearGradient al área del botón
  }, // Cierra el estilo modeBtn
  modeBtnActive: {}, // Línea 318 — estilo del botón activo (vacío porque el efecto visual lo aplica el LinearGradient)
  modeBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary }, // Línea 319 — texto del botón inactivo: tamaño 14, negrita y color secundario gris
  modeBtnTextActive: { color: '#fff' }, // Línea 320 — texto del botón activo: color blanco para contraste con el fondo morado

  // ── Cámara ──
  cameraCard: { // Línea 323 — inicia el estilo de la tarjeta de la vista de cámara
    width: '100%', // Línea 324 — la tarjeta ocupa todo el ancho del contenedor padre
    height: 280, // Línea 325 — altura fija de 280 px para la tarjeta de cámara
    borderRadius: 24, // Línea 326 — bordes redondeados de 24 px para la tarjeta
    overflow: 'hidden', // Línea 327 — recorta la imagen y el overlay dentro de los bordes redondeados
    backgroundColor: '#1a1a2e', // Línea 328 — color de fondo oscuro mientras carga la imagen de la cámara
    shadowColor: '#7C3AED', // Línea 329 — sombra morada que refuerza el tema visual de la app
    shadowOffset: { width: 0, height: 8 }, // Línea 330 — sombra desplazada 8 px hacia abajo
    shadowOpacity: 0.25, // Línea 331 — opacidad de la sombra al 25% para un efecto notable
    shadowRadius: 20, // Línea 332 — difuminado amplio de 20 px para la sombra
    elevation: 10, // Línea 333 — elevación alta en Android para destacar la tarjeta
  }, // Cierra el estilo cameraCard
  cameraImage: { width: '100%', height: '100%' }, // Línea 335 — la imagen ocupa todo el ancho y alto de la tarjeta de cámara
  cameraOverlay: { // Línea 336 — inicia el estilo del degradado oscuro en la parte inferior de la cámara
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, // Línea 337 — posicionado absolutamente en la parte inferior, ancho completo, altura de 100 px
  }, // Cierra el estilo cameraOverlay
  liveBadge: { // Línea 339 — inicia el estilo del badge "En vivo"
    position: 'absolute', top: 14, left: 14, zIndex: 10, // Línea 340 — posicionado absolutamente en la esquina superior izquierda con z-index 10
    flexDirection: 'row', alignItems: 'center', gap: 6, // Línea 341 — alinea el punto y el texto del badge en fila con separación de 6 px
    backgroundColor: 'rgba(220,38,38,0.9)', // Línea 342 — fondo rojo semitransparente que indica grabación activa
    paddingHorizontal: 10, paddingVertical: 5, // Línea 343 — padding interno del badge para dar espacio al contenido
    borderRadius: 20, // Línea 344 — bordes muy redondeados tipo píldora para el badge
  }, // Cierra el estilo liveBadge
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' }, // Línea 346 — punto circular blanco de 7 px que simula el indicador de grabación
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 }, // Línea 347 — texto "En vivo" en blanco, pequeño, extra negrita y con letras separadas

  // Marco de detección
  detectionFrame: { // Línea 350 — inicia el estilo del marco de detección de señas
    position: 'absolute', // Línea 351 — posicionado sobre la imagen de forma absoluta
    top: '20%', left: '25%', right: '25%', bottom: '25%', // Línea 352 — ocupa el 50% del ancho y el 55% del alto, centrado en la imagen
    zIndex: 5, // Línea 353 — z-index 5 para que aparezca sobre la imagen pero bajo el badge y el label
  }, // Cierra el estilo detectionFrame
  corner: { // Línea 355 — inicia el estilo base compartido de las cuatro esquinas del marco
    position: 'absolute', // Línea 356 — cada esquina se posiciona absolutamente dentro del marco
    width: CORNER_SIZE, height: CORNER_SIZE, // Línea 357 — tamaño de 20 x 20 px para cada esquina
    borderColor: 'rgba(255,255,255,0.85)', // Línea 358 — color del borde blanco semitransparente de cada esquina
  }, // Cierra el estilo base corner
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderTopLeftRadius: 4 }, // Línea 360 — esquina superior izquierda: borde arriba y a la izquierda con radio de 4 px
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderTopRightRadius: 4 }, // Línea 361 — esquina superior derecha: borde arriba y a la derecha con radio de 4 px
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderBottomLeftRadius: 4 }, // Línea 362 — esquina inferior izquierda: borde abajo y a la izquierda con radio de 4 px
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderBottomRightRadius: 4 }, // Línea 363 — esquina inferior derecha: borde abajo y a la derecha con radio de 4 px

  cameraLabel: { // Línea 365 — inicia el estilo de la etiqueta de texto en la parte inferior de la cámara
    position: 'absolute', bottom: 14, left: 0, right: 0, // Línea 366 — posicionada absolutamente a 14 px del fondo, ancho completo
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 10, // Línea 367 — centra el ícono y el texto en fila con z-index 10 sobre el overlay
  }, // Cierra el estilo cameraLabel
  cameraLabelText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '500' }, // Línea 369 — texto blanco casi opaco, tamaño 13 y peso medio para la instrucción de la cámara

  // ── Input card ──
  inputCard: { // Línea 372 — inicia el estilo de la tarjeta de entrada de texto
    backgroundColor: '#fff', // Línea 373 — fondo blanco base (sobreescrito por tema en JSX)
    borderRadius: 24, // Línea 374 — bordes muy redondeados de 24 px
    padding: 20, // Línea 375 — padding interno de 20 px en todos los lados
    shadowColor: '#000', // Línea 376 — sombra negra sutil para dar profundidad a la tarjeta
    shadowOffset: { width: 0, height: 4 }, // Línea 377 — sombra desplazada 4 px hacia abajo
    shadowOpacity: 0.08, // Línea 378 — opacidad de la sombra al 8%, muy sutil
    shadowRadius: 14, // Línea 379 — difuminado de 14 px para la sombra
    elevation: 4, // Línea 380 — elevación en Android equivalente a la sombra iOS
  }, // Cierra el estilo inputCard
  inputCardHeader: { // Línea 382 — inicia el estilo del encabezado de la tarjeta de texto
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, // Línea 383 — fila horizontal con ícono y texto separados 8 px, margen inferior de 14 px
  }, // Cierra el estilo inputCardHeader
  inputCardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary }, // Línea 385 — título de la tarjeta: tamaño 15, negrita y color de texto primario
  textArea: { // Línea 386 — inicia el estilo del área de texto multilínea
    fontSize: 15, // Línea 387 — tamaño de fuente 15 px para el texto ingresado
    color: Colors.textPrimary, // Línea 388 — color del texto ingresado (sobreescrito por tema en JSX)
    minHeight: 120, // Línea 389 — altura mínima de 120 px para el área de texto
    backgroundColor: Colors.backgroundGray, // Línea 390 — fondo gris claro dentro del área de texto (sobreescrito por tema)
    borderRadius: 14, // Línea 391 — bordes redondeados de 14 px para el área de texto
    padding: 14, // Línea 392 — padding interno de 14 px en el área de texto
    borderWidth: 1, // Línea 393 — borde de 1 px alrededor del área de texto
    borderColor: Colors.border, // Línea 394 — color del borde del área de texto (sobreescrito por tema)
    lineHeight: 23, // Línea 395 — altura de línea de 23 px para mejorar la legibilidad
  }, // Cierra el estilo textArea
  charCount: { alignItems: 'flex-end', marginTop: 10 }, // Línea 397 — contenedor del contador: alineado a la derecha con margen superior de 10 px
  charCountText: { fontSize: 11, color: Colors.textHint }, // Línea 398 — texto del contador: pequeño (11 px) y en color de sugerencia gris

  // ── Tips ──
  tipsRow: { gap: 10 }, // Línea 401 — contenedor de los chips de tips con separación vertical de 10 px entre ellos
  tipChip: { // Línea 402 — inicia el estilo de cada chip de tip
    flexDirection: 'row', // Línea 403 — alinea el ícono y el texto del tip en fila horizontal
    alignItems: 'center', // Línea 404 — centra verticalmente el ícono y el texto
    gap: 10, // Línea 405 — espacio de 10 px entre el ícono y el texto del tip
    backgroundColor: Colors.primaryBg, // Línea 406 — fondo morado muy claro del chip (sobreescrito por tema en JSX)
    paddingHorizontal: 14, // Línea 407 — padding horizontal de 14 px dentro del chip
    paddingVertical: 10, // Línea 408 — padding vertical de 10 px dentro del chip
    borderRadius: 14, // Línea 409 — bordes redondeados de 14 px para el chip
  }, // Cierra el estilo tipChip
  tipText: { fontSize: 13, color: Colors.primary, fontWeight: '500', flex: 1, lineHeight: 19 }, // Línea 411 — texto del tip: tamaño 13, color morado, peso medio, flexible y con altura de línea 19

  // ── Resultado ──
  resultCard: { // Línea 414 — inicia el estilo de la tarjeta de resultado de traducción
    backgroundColor: '#fff', // Línea 415 — fondo blanco base (sobreescrito por tema en JSX)
    borderRadius: 24, // Línea 416 — bordes muy redondeados de 24 px
    overflow: 'hidden', // Línea 417 — recorta el contenido al borde redondeado
    shadowColor: Colors.primary, // Línea 418 — sombra morada para destacar la tarjeta de resultado
    shadowOffset: { width: 0, height: 4 }, // Línea 419 — sombra desplazada 4 px hacia abajo
    shadowOpacity: 0.12, // Línea 420 — opacidad de la sombra al 12%
    shadowRadius: 16, // Línea 421 — difuminado de 16 px para la sombra
    elevation: 5, // Línea 422 — elevación en Android
    borderWidth: 1.5, // Línea 423 — borde de 1.5 px alrededor de la tarjeta
    borderColor: Colors.primaryLighter, // Línea 424 — color del borde en morado muy claro (sobreescrito por tema)
  }, // Cierra el estilo resultCard
  resultHeader: { // Línea 426 — inicia el estilo del encabezado de la tarjeta de resultado
    flexDirection: 'row', // Línea 427 — alinea el ícono, título y badge en fila horizontal
    alignItems: 'center', // Línea 428 — centra verticalmente los elementos del encabezado
    gap: 10, // Línea 429 — espacio de 10 px entre los elementos del encabezado
    padding: 16, // Línea 430 — padding interno de 16 px en el encabezado
    borderBottomWidth: 1, // Línea 431 — separador inferior de 1 px entre encabezado y cuerpo
    borderBottomColor: Colors.border, // Línea 432 — color del separador (sobreescrito por tema en JSX)
  }, // Cierra el estilo resultHeader
  resultIconBg: { // Línea 434 — inicia el estilo del fondo cuadrado redondeado del ícono de resultado
    width: 36, height: 36, borderRadius: 12, // Línea 435 — dimensiones de 36 x 36 px con radio de 12 px
    alignItems: 'center', justifyContent: 'center', // Línea 436 — centra el ícono dentro del fondo cuadrado
  }, // Cierra el estilo resultIconBg
  resultTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.textPrimary }, // Línea 438 — título "Traducción": flex: 1 ocupa el espacio disponible, tamaño 15, negrita
  detectedBadge: { // Línea 439 — inicia el estilo del badge verde "Listo"
    flexDirection: 'row', alignItems: 'center', gap: 5, // Línea 440 — alinea el punto y el texto en fila con separación de 5 px
    backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, // Línea 441 — fondo verde muy claro, padding y bordes redondeados tipo píldora
  }, // Cierra el estilo detectedBadge
  detectedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#059669' }, // Línea 443 — punto circular verde oscuro de 6 px que indica éxito
  detectedText: { fontSize: 11, color: '#059669', fontWeight: '700' }, // Línea 444 — texto "Listo" en verde oscuro, tamaño 11 y negrita
  waitingBadge: { // Línea 445 — inicia el estilo del badge gris "En espera"
    backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, // Línea 446 — fondo gris claro, padding y bordes redondeados tipo píldora
  }, // Cierra el estilo waitingBadge
  waitingText: { fontSize: 11, color: Colors.textHint, fontWeight: '600' }, // Línea 448 — texto "En espera" en gris, tamaño 11 y semi-negrita
  resultBody: { padding: 18, minHeight: 96 }, // Línea 449 — cuerpo de la tarjeta con padding de 18 px y altura mínima de 96 px para evitar colapso
  resultText: { fontSize: 17, color: Colors.textPrimary, fontWeight: '600', lineHeight: 27 }, // Línea 450 — texto del resultado: tamaño 17, color primario, semi-negrita y altura de línea 27
  copyBtn: { // Línea 451 — inicia el estilo del botón de copiar
    flexDirection: 'row', alignItems: 'center', gap: 6, // Línea 452 — alinea el ícono y el texto en fila con separación de 6 px
    alignSelf: 'flex-start', marginTop: 14, // Línea 453 — el botón se ajusta a su contenido y tiene margen superior de 14 px
    backgroundColor: Colors.primaryBg, // Línea 454 — fondo morado muy claro del botón de copiar
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, // Línea 455 — padding y bordes redondeados de 10 px para el botón
  }, // Cierra el estilo copyBtn
  copyBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' }, // Línea 457 — texto "Copiar" en morado primario, tamaño 13 y semi-negrita
  resultEmpty: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 12 }, // Línea 458 — contenedor del estado vacío: centrado con separación de 12 px entre ícono y texto
  resultEmptyText: { // Línea 459 — inicia el estilo del texto del estado vacío
    fontSize: 13, color: Colors.textHint, textAlign: 'center', lineHeight: 21, maxWidth: 240, // Línea 460 — texto pequeño gris, centrado, con altura de línea 21 y ancho máximo de 240 px
  }, // Cierra el estilo resultEmptyText

  // ── Botón principal ──
  actionBtnWrapper: { // Línea 464 — inicia el estilo del contenedor del botón de acción principal
    borderRadius: 20, // Línea 465 — bordes redondeados de 20 px para el contenedor
    overflow: 'hidden', // Línea 466 — recorta el degradado dentro de los bordes redondeados
    alignSelf: 'stretch', // Línea 467 — el botón ocupa todo el ancho disponible del padre
    shadowColor: '#7C3AED', // Línea 468 — sombra morada intensa para destacar el botón principal
    shadowOffset: { width: 0, height: 8 }, // Línea 469 — sombra desplazada 8 px hacia abajo
    shadowOpacity: 0.4, // Línea 470 — opacidad de la sombra al 40% para un efecto notable
    shadowRadius: 16, // Línea 471 — difuminado amplio de 16 px para la sombra
    elevation: 10, // Línea 472 — elevación alta en Android para destacar el botón
  }, // Cierra el estilo actionBtnWrapper
  actionBtn: { // Línea 474 — inicia el estilo del interior del botón con degradado
    flexDirection: 'row', // Línea 475 — alinea el ícono y el texto del botón en fila horizontal
    alignItems: 'center', // Línea 476 — centra verticalmente el contenido del botón
    justifyContent: 'center', // Línea 477 — centra horizontalmente el contenido del botón
    paddingVertical: 18, // Línea 478 — padding vertical generoso de 18 px para un botón grande
    paddingHorizontal: 36, // Línea 479 — padding horizontal de 36 px para dar amplitud al botón
    gap: 10, // Línea 480 — separación de 10 px entre el ícono y el texto del botón
    borderRadius: 20, // Línea 481 — bordes redondeados de 20 px para el botón interior
  }, // Cierra el estilo actionBtn
  actionBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 }, // Línea 483 — texto del botón: blanco, tamaño 17, extra negrita y letras ligeramente separadas
}); // Cierra el objeto StyleSheet.create de la pantalla
