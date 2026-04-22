// Archivo: app/presentation/screens/LandingScreen.tsx
/**
 * @file LandingScreen.tsx
 * @description Pantalla de bienvenida pública (antes de autenticarse).
 *
 * Contiene:
 * - Header con logo y botones "Registrarse" / "Ingresar".
 * - Tarjeta de notificación push simulada (descartable).
 * - Sección hero con título, subtítulo y badge LSC.
 * - Cards de características principales (Traducción, Recordatorios).
 * - Slider de 3 slides con imágenes, flechas de navegación y dots.
 * - Testimonio de usuario.
 * - CTA final con botón de registro y link de login.
 *
 * El layout se adapta automáticamente: en pantallas anchas (≥ 768 px) el
 * contenido centra a un máximo de 960 px de ancho.
 */
import React, { useState, useRef } from 'react'; // Importa React y los hooks useState (estado) y useRef (referencia a elementos) desde 'react'
import {
  View, // Contenedor genérico tipo caja, equivalente a un div
  Text, // Componente para mostrar texto en pantalla
  StyleSheet, // Utilidad para crear hojas de estilos optimizadas
  TouchableOpacity, // Botón táctil con efecto de opacidad al presionar
  ScrollView, // Contenedor con scroll vertical u horizontal
  FlatList, // Lista optimizada para grandes volúmenes de datos con scroll
  Image, // Componente para mostrar imágenes locales o remotas
  Platform, // Utilidad para detectar el sistema operativo (ios, android, web)
  useWindowDimensions, // Hook que devuelve el ancho y alto actual de la ventana
  NativeSyntheticEvent, // Tipo TypeScript para eventos nativos de React Native
  NativeScrollEvent, // Tipo TypeScript para el evento de scroll nativo
} from 'react-native'; // Todos los anteriores provienen del paquete principal 'react-native'
import { useNavigation } from '@react-navigation/native'; // Hook para acceder al objeto de navegación (navegar entre pantallas)
import { Ionicons } from '@expo/vector-icons'; // Librería de iconos vectoriales de Expo (Ionicons es uno de los conjuntos disponibles)
import { LinearGradient } from 'expo-linear-gradient'; // Componente de Expo para aplicar degradados lineales de color
import { Colors } from '../../constants/colors'; // Paleta de colores centralizada del proyecto — ruta: app/constants/colors.ts

// Datos del slider: arreglo con 3 objetos, cada uno con id, imagen local, título y descripción
const SLIDES = [
  { // Inicio del primer objeto de slide
    id: '1', // Identificador único del slide 1
    image: require('../../assets/images/slide1.jpg'), // Imagen local del slide 1 — ruta: app/assets/images/slide1.jpg
    title: 'Traduce en tiempo real', // Título principal que se muestra sobre la imagen del slide 1
    caption: 'Detecta y traduce señas al instante usando la cámara de tu dispositivo.', // Descripción corta del slide 1
  }, // Cierre del objeto slide 1
  { // Inicio del segundo objeto de slide
    id: '2', // Identificador único del slide 2
    image: require('../../assets/images/slide2.jpg'), // Imagen local del slide 2 — ruta: app/assets/images/slide2.jpg
    title: 'Comunícate sin barreras', // Título principal que se muestra sobre la imagen del slide 2
    caption: 'Conecta con personas sordas usando la Lengua de Señas Colombiana.', // Descripción corta del slide 2
  }, // Cierre del objeto slide 2
  { // Inicio del tercer objeto de slide
    id: '3', // Identificador único del slide 3
    image: require('../../assets/images/slide3.jpg'), // Imagen local del slide 3 — ruta: app/assets/images/slide3.jpg
    title: 'Aprende el alfabeto LSC', // Título principal que se muestra sobre la imagen del slide 3
    caption: 'Domina el alfabeto y amplía tu vocabulario paso a paso.', // Descripción corta del slide 3
  }, // Cierre del objeto slide 3
]; // Cierre del arreglo SLIDES

// Datos de las tarjetas de características: arreglo con 2 objetos (Traducción y Recordatorios)
const FEATURES = [
  { // Inicio del primer objeto de característica
    icon: 'hand-left-outline' as const, // Nombre del icono Ionicons para la característica de Traducción
    label: 'Traducción', // Etiqueta corta que se muestra como título de la tarjeta
    desc: 'Seña a texto en tiempo real', // Descripción breve de la funcionalidad de traducción
    color: Colors.primary, // Color principal morado para el icono y el texto del label
    bg: '#EDE9FE', // Color de fondo lavanda claro para la tarjeta de Traducción
  }, // Cierre del objeto de característica Traducción
{ // Inicio del segundo objeto de característica
    icon: 'alarm-outline' as const, // Nombre del icono Ionicons para la característica de Recordatorios
    label: 'Recordatorios', // Etiqueta corta que se muestra como título de la tarjeta
    desc: 'Alarmas de práctica diaria', // Descripción breve de la funcionalidad de recordatorios
    color: '#D97706', // Color ámbar para el icono y texto del label de Recordatorios
    bg: '#FEF3C7', // Color de fondo amarillo claro para la tarjeta de Recordatorios
  }, // Cierre del objeto de característica Recordatorios
]; // Cierre del arreglo FEATURES

export const LandingScreen: React.FC = () => { // Declara y exporta el componente funcional LandingScreen tipado como React.FC
  const navigation = useNavigation(); // Obtiene el objeto de navegación para poder navegar entre pantallas
  const { width } = useWindowDimensions(); // Obtiene el ancho actual de la ventana para calcular layouts responsivos
  const isWide = width >= 768; // Booleano: true si la pantalla tiene 768px o más (modo escritorio/tablet)
  const isNarrow = width < 430; // Booleano: true si la pantalla tiene menos de 430px (teléfonos muy pequeños)
  const sliderRef = useRef<FlatList>(null); // Referencia al componente FlatList del slider para controlar el scroll programáticamente

  const [activeSlide, setActiveSlide] = useState(0); // Estado del slide activo: número entero que comienza en 0 (primer slide)
  const [showNotif, setShowNotif] = useState(true); // Estado de visibilidad de la notificación push: true = visible, false = descartada

  const SLIDE_WIDTH = isWide ? Math.min(width - 80, 860) : width - 40; // Calcula el ancho de cada slide: en pantallas anchas máximo 860px, en móvil el ancho total menos 40px de margen

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => { // Handler que se ejecuta cada vez que el usuario hace scroll en el FlatList del slider
    const index = Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH); // Calcula el índice del slide visible dividiendo la posición horizontal del scroll entre el ancho de cada slide
    setActiveSlide(index); // Actualiza el estado del slide activo con el índice calculado
  }; // Cierre del handler onScroll

  const goToSlide = (dir: 'prev' | 'next') => { // Handler para las flechas del slider: recibe 'prev' o 'next' y navega al slide correspondiente
    const next = dir === 'next' // Calcula el índice del siguiente slide según la dirección
      ? Math.min(activeSlide + 1, SLIDES.length - 1) // Si es 'next', suma 1 pero no supera el último índice
      : Math.max(activeSlide - 1, 0); // Si es 'prev', resta 1 pero no baja de 0
    sliderRef.current?.scrollToIndex({ index: next, animated: true }); // Desplaza el FlatList al slide calculado con animación suave
    setActiveSlide(next); // Actualiza el estado para sincronizar los dots con el slide activo
  }; // Cierre del handler goToSlide

  return ( // Inicio del retorno JSX del componente LandingScreen
    <View style={styles.root}> {/* Contenedor raíz que ocupa toda la pantalla con fondo gris claro */}

      {/* ── Header ───────────────────────────────────────────── */}
      <LinearGradient // Componente de degradado que forma el header superior
        colors={['#9333EA', '#7C3AED']} // Define el degradado de morado claro a morado oscuro de izquierda a derecha
        start={{ x: 0, y: 0 }} // Punto de inicio del degradado: esquina superior izquierda
        end={{ x: 1, y: 0 }} // Punto final del degradado: esquina superior derecha
        style={styles.header} // Aplica los estilos de sombra y forma del header
      > {/* Cierre de la apertura de LinearGradient del header */}
        <View style={[styles.headerInner, isWide && styles.headerInnerWide]}> {/* Contenedor interno del header: en pantallas anchas aplica estilo centrado con máximo 960px */}
          {/* Logo */}
          <View style={styles.logoRow}> {/* Fila horizontal que agrupa el ícono emoji y el nombre de la app */}
            <View style={styles.logoBox}> {/* Caja cuadrada semitransparente con borde que contiene el emoji de la mano */}
              <Text style={styles.logoEmoji}>👌</Text> {/* Emoji de la mano que actúa como logotipo de la app */}
            </View> {/* Cierre de logoBox */}
            <Text style={[styles.appName, isNarrow && styles.appNameNarrow]}>TraduceSeña</Text> {/* Nombre de la aplicación: en pantallas estrechas reduce el tamaño de fuente */}
          </View> {/* Cierre de logoRow */}

          {/* Acciones de auth */}
          <View style={styles.authRow}> {/* Fila horizontal que agrupa los botones de Registrarse e Ingresar */}
            <TouchableOpacity // Botón táctil para ir a la pantalla de registro
              style={[styles.registerBtn, isNarrow && styles.btnNarrow]} // En pantallas estrechas reduce el padding del botón
              onPress={() => navigation.navigate('Register' as never)} // Al presionar navega a la pantalla Register
            > {/* Cierre de la apertura del TouchableOpacity de Registrarse */}
              <Text style={[styles.registerBtnText, isNarrow && styles.btnTextNarrow]}>Registrarse</Text> {/* Texto del botón de registro: en pantallas estrechas reduce el tamaño de fuente */}
            </TouchableOpacity> {/* Cierre del botón Registrarse */}
            <TouchableOpacity // Botón táctil para ir a la pantalla de login
              style={[styles.loginBtn, isNarrow && styles.btnNarrow]} // En pantallas estrechas reduce el padding del botón
              onPress={() => navigation.navigate('Login' as never)} // Al presionar navega a la pantalla Login
            > {/* Cierre de la apertura del TouchableOpacity de Ingresar */}
              <Ionicons name="log-in-outline" size={isNarrow ? 16 : 18} color={Colors.primary} /> {/* Ícono de flecha de ingreso: tamaño 16 en pantallas estrechas, 18 en normales */}
              <Text style={[styles.loginBtnText, isNarrow && styles.btnTextNarrow]}>Ingresar</Text> {/* Texto del botón de login: en pantallas estrechas reduce el tamaño de fuente */}
            </TouchableOpacity> {/* Cierre del botón Ingresar */}
          </View> {/* Cierre de authRow */}
        </View> {/* Cierre de headerInner */}
      </LinearGradient> {/* Cierre del LinearGradient del header */}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}> {/* ScrollView principal de la pantalla: oculta la barra de scroll y aplica padding inferior */}
        <View style={[styles.innerContent, isWide && styles.innerContentWide]}> {/* Contenedor del contenido principal: en pantallas anchas centra el contenido a máximo 960px */}

          {/* ── Notificación push ────────────────────────────── */}
          {showNotif && ( // Renderiza la tarjeta de notificación solo si showNotif es true (no ha sido descartada)
            <View style={styles.notifCard}> {/* Tarjeta de notificación simulada con fondo blanco, bordes redondeados y sombra morada */}
              <LinearGradient colors={['#9333EA', '#7C3AED']} style={styles.notifIconBg}> {/* Fondo degradado morado del ícono de la notificación */}
                <Text style={{ fontSize: 16 }}>👌</Text> {/* Emoji de la mano como ícono de la notificación push */}
              </LinearGradient> {/* Cierre del degradado del ícono de notificación */}
              <View style={styles.notifBody}> {/* Contenedor principal del cuerpo de la notificación (flex:1 para ocupar el espacio disponible) */}
                <View style={styles.notifTopRow}> {/* Fila superior de la notificación con nombre de la app y hora */}
                  <Text style={styles.notifApp}>TraduceSeña</Text> {/* Nombre de la app que originó la notificación en color morado */}
                  <Text style={styles.notifTime}>Ahora</Text> {/* Indicador de tiempo de la notificación en color gris claro */}
                </View> {/* Cierre de notifTopRow */}
                <Text style={styles.notifTitle}>¡Practica hoy tu seña diaria!</Text> {/* Título principal de la notificación en negrita */}
                <Text style={styles.notifMsg}>Abre la app y traduce al menos una seña nueva hoy.</Text> {/* Mensaje descriptivo de la notificación en color secundario */}
                <View style={styles.notifActions}> {/* Fila de acciones de la notificación con dos botones */}
                  <TouchableOpacity // Botón de acción primaria de la notificación
                    style={styles.notifActionBtn} // Aplica fondo morado con bordes redondeados al botón
                    onPress={() => navigation.navigate('Login' as never)} // Al presionar navega a la pantalla de Login
                  > {/* Cierre de la apertura del TouchableOpacity de "Abrir app" */}
                    <Text style={styles.notifActionText}>Abrir app</Text> {/* Texto del botón de acción principal en blanco */}
                  </TouchableOpacity> {/* Cierre del botón "Abrir app" */}
                  <TouchableOpacity onPress={() => setShowNotif(false)}> {/* Botón para descartar la notificación: cambia showNotif a false ocultando la tarjeta */}
                    <Text style={styles.notifDismiss}>Descartar</Text> {/* Texto del botón de descarte en color gris */}
                  </TouchableOpacity> {/* Cierre del botón Descartar */}
                </View> {/* Cierre de notifActions */}
              </View> {/* Cierre de notifBody */}
              <TouchableOpacity onPress={() => setShowNotif(false)} style={styles.notifClose}> {/* Botón X en la esquina de la tarjeta para cerrar la notificación */}
                <Ionicons name="close" size={16} color={Colors.textHint} /> {/* Ícono de cierre (X) en color gris suave */}
              </TouchableOpacity> {/* Cierre del botón de cierre de notificación */}
            </View> // Cierre de notifCard
          )} {/* Cierre del renderizado condicional de la notificación */}

          {/* ── Hero text ────────────────────────────────────── */}
          <View style={styles.hero}> {/* Sección hero con gap entre elementos para separar badge, título y subtítulo */}
            <View style={styles.heroBadge}> {/* Píldora con fondo morado claro que contiene el badge de LSC */}
              <View style={styles.heroBadgeDot} /> {/* Punto circular morado que actúa como indicador visual del badge */}
              <Text style={styles.heroBadgeText}>Lengua de Señas Colombiana</Text> {/* Texto del badge que identifica el lenguaje soportado */}
            </View> {/* Cierre de heroBadge */}
            <Text style={styles.heroTitle}> {/* Título principal del hero en tamaño grande y peso 900 */}
              Comunícate sin{'\n'}barreras {/* Texto del título con salto de línea forzado entre "sin" y "barreras" */}
            </Text> {/* Cierre del título hero */}
            <Text style={styles.heroSubtitle}> {/* Subtítulo descriptivo del hero con interlineado amplio */}
              Traduce señas a texto en tiempo real y aprende LSC con una app diseñada para la inclusión. {/* Texto del subtítulo que describe la propuesta de valor de la app */}
            </Text> {/* Cierre del subtítulo hero */}
          </View> {/* Cierre de la sección hero */}

          {/* ── Feature cards ────────────────────────────────── */}
          <View style={[styles.featuresRow, isWide && styles.featuresRowWide]}> {/* Fila de tarjetas de características: en pantallas anchas aumenta el gap entre tarjetas */}
            {FEATURES.map((f, i) => ( // Itera sobre el arreglo FEATURES y renderiza una tarjeta por cada elemento
              <View key={i} style={[styles.featureCard, { backgroundColor: f.bg }]}> {/* Tarjeta individual de característica con fondo dinámico según el color definido en FEATURES */}
                <View style={[styles.featureIconBox, { backgroundColor: f.color + '25' }]}> {/* Caja del ícono con fondo semitransparente del color de la característica (opacidad 25 en hex) */}
                  <Ionicons name={f.icon} size={22} color={f.color} /> {/* Ícono Ionicons de la característica con el color definido en el objeto */}
                </View> {/* Cierre de featureIconBox */}
                <Text style={[styles.featureLabel, { color: f.color }]}>{f.label}</Text> {/* Etiqueta del nombre de la característica con el color temático */}
                <Text style={styles.featureDesc}>{f.desc}</Text> {/* Descripción breve de la característica en color secundario */}
              </View> // Cierre de featureCard
            ))} {/* Cierre del map de FEATURES */}
          </View> {/* Cierre de featuresRow */}

          {/* ── Slider ───────────────────────────────────────── */}
          <View style={styles.sliderSection}> {/* Sección completa del slider con gap para separar título, slider y dots */}
            <Text style={styles.sliderHeading}>¿Por qué TraduceSeña?</Text> {/* Título de la sección del slider en tamaño 20 y peso 800 */}

            <View style={styles.sliderWrapper}> {/* Contenedor del slider con overflow hidden para recortar bordes y sombra */}
              <FlatList // Lista horizontal de slides con paginación
                ref={sliderRef} // Referencia para controlar el scroll programáticamente desde goToSlide
                data={SLIDES} // Fuente de datos del slider: el arreglo SLIDES definido arriba
                horizontal // Habilita el scroll horizontal en el FlatList
                pagingEnabled // Hace que el scroll se detenga exactamente en cada slide (paginación)
                showsHorizontalScrollIndicator={false} // Oculta la barra de scroll horizontal
                onScroll={onScroll} // Llama al handler onScroll para actualizar el slide activo al hacer scroll
                scrollEventThrottle={16} // Limita los eventos de scroll a ~60fps para optimizar el rendimiento
                keyExtractor={item => item.id} // Extrae la clave única de cada slide usando su propiedad id
                getItemLayout={(_, index) => ({ // Función para calcular el layout de cada item sin renderizarlo (optimización)
                  length: SLIDE_WIDTH, // Ancho de cada slide (calculado dinámicamente según el dispositivo)
                  offset: SLIDE_WIDTH * index, // Desplazamiento horizontal del slide en la lista
                  index, // Índice del slide
                })} // Cierre de getItemLayout
                renderItem={({ item }) => ( // Función que renderiza cada slide individualmente
                  <View style={[styles.slide, { width: SLIDE_WIDTH }]}> {/* Contenedor del slide con altura fija y ancho dinámico */}
                    <Image // Imagen de fondo del slide
                      source={item.image} // Fuente de la imagen local definida en el objeto del slide
                      style={styles.slideImage} // Aplica ancho y alto al 100% para cubrir todo el slide
                      resizeMode="cover" // Escala la imagen para cubrir el contenedor sin deformarla
                    /> {/* Cierre de Image */}
                    <LinearGradient // Degradado oscuro sobre la imagen para mejorar legibilidad del texto
                      colors={['transparent', 'rgba(0,0,0,0.65)']} // De transparente arriba a negro semiopaco abajo
                      style={styles.slideOverlay} // Posicionado absolutamente en la parte inferior del slide
                    /> {/* Cierre del LinearGradient del overlay */}
                    <View style={styles.slideTextBox}> {/* Contenedor del texto del slide, posicionado en la esquina inferior izquierda */}
                      <Text style={styles.slideTitle}>{item.title}</Text> {/* Título del slide en blanco y negrita sobre la imagen */}
                      <Text style={styles.slideCaption}>{item.caption}</Text> {/* Descripción del slide en blanco semiopaco con interlineado */}
                    </View> {/* Cierre de slideTextBox */}
                  </View> // Cierre del contenedor del slide
                )} // Cierre de renderItem
              /> {/* Cierre de FlatList */}

              {/* Flechas */}
              <TouchableOpacity // Flecha izquierda del slider para ir al slide anterior
                style={[styles.arrow, styles.arrowLeft]} // Posicionada absolutamente en el borde izquierdo del slider
                onPress={() => goToSlide('prev')} // Al presionar llama a goToSlide con dirección 'prev'
              > {/* Cierre de la apertura del TouchableOpacity de flecha izquierda */}
                <Ionicons name="chevron-back" size={20} color="#fff" /> {/* Ícono de flecha hacia atrás en blanco */}
              </TouchableOpacity> {/* Cierre de la flecha izquierda */}
              <TouchableOpacity // Flecha derecha del slider para ir al slide siguiente
                style={[styles.arrow, styles.arrowRight]} // Posicionada absolutamente en el borde derecho del slider
                onPress={() => goToSlide('next')} // Al presionar llama a goToSlide con dirección 'next'
              > {/* Cierre de la apertura del TouchableOpacity de flecha derecha */}
                <Ionicons name="chevron-forward" size={20} color="#fff" /> {/* Ícono de flecha hacia adelante en blanco */}
              </TouchableOpacity> {/* Cierre de la flecha derecha */}
            </View> {/* Cierre de sliderWrapper */}

            {/* Dots */}
            <View style={styles.dots}> {/* Fila centrada de dots indicadores del slide activo */}
              {SLIDES.map((_, i) => ( // Itera sobre SLIDES para crear un dot por cada slide
                <TouchableOpacity // Dot tocable para navegar directamente a un slide específico
                  key={i} // Clave única del dot basada en su índice
                  onPress={() => { // Al presionar el dot navega al slide correspondiente
                    sliderRef.current?.scrollToIndex({ index: i, animated: true }); // Desplaza el FlatList al slide del dot presionado con animación
                    setActiveSlide(i); // Actualiza el estado del slide activo al índice del dot presionado
                  }} // Cierre del handler onPress del dot
                > {/* Cierre de la apertura del TouchableOpacity del dot */}
                  <View style={[styles.dot, i === activeSlide ? styles.dotActive : styles.dotInactive]} /> {/* Dot visual: ancho y color morado si es el activo, gris y pequeño si no lo es */}
                </TouchableOpacity> // Cierre del TouchableOpacity del dot
              ))} {/* Cierre del map de dots */}
            </View> {/* Cierre del contenedor de dots */}
          </View> {/* Cierre de sliderSection */}

          {/* ── Testimonio ───────────────────────────────────── */}
          <View style={styles.testimonialCard}> {/* Tarjeta del testimonio con bordes redondeados y sombra morada */}
            <LinearGradient colors={['#EDE9FE', '#F5F3FF']} style={styles.testimonialGradient}> {/* Degradado de lavanda a casi blanco como fondo de la tarjeta del testimonio */}
              <Ionicons name="chatbubble-ellipses" size={28} color={Colors.primaryLighter} style={styles.quoteIcon} /> {/* Ícono de burbuja de chat que representa la cita del testimonio */}
              <Text style={styles.testimonialQuote}> {/* Texto de la cita del testimonio en cursiva con interlineado amplio */}
                "La app ha facilitado mi comunicación con mis compañeros en clase. Es increíble cómo {/* Primera parte del texto del testimonio */}
                una app puede cambiar tanto la vida de una persona." {/* Segunda parte del texto del testimonio */}
              </Text> {/* Cierre del texto de la cita */}
              <View style={styles.testimonialAuthor}> {/* Fila horizontal con avatar e información del autor del testimonio */}
                <Image // Imagen circular del avatar del autor del testimonio
                  source={require('../../assets/images/testimonial.jpg')} // Imagen local del avatar — ruta: app/assets/images/testimonial.jpg
                  style={styles.testimonialAvatar} // Aplica tamaño 44x44 y borderRadius 22 para hacerla circular
                /> {/* Cierre de Image del avatar */}
                <View> {/* Contenedor de texto con el nombre y rol del autor */}
                  <Text style={styles.testimonialName}>Juan Pérez</Text> {/* Nombre del autor del testimonio en negrita */}
                  <Text style={styles.testimonialRole}>Estudiante universitario</Text> {/* Rol o descripción del autor en color secundario */}
                </View> {/* Cierre del contenedor de texto del autor */}
              </View> {/* Cierre de testimonialAuthor */}
            </LinearGradient> {/* Cierre del LinearGradient del testimonio */}
          </View> {/* Cierre de testimonialCard */}

          {/* ── CTA final ────────────────────────────────────── */}
          <View style={styles.cta}> {/* Sección de llamada a la acción final centrada con gap entre elementos */}
            <Text style={styles.ctaTitle}>¿Listo para comenzar?</Text> {/* Título grande centrado del CTA en color primario */}
            <Text style={styles.ctaSubtitle}>Únete y rompe las barreras de la comunicación</Text> {/* Subtítulo descriptivo del CTA en color secundario */}

            <TouchableOpacity // Botón principal del CTA para ir a registro
              onPress={() => navigation.navigate('Register' as never)} // Al presionar navega a la pantalla de registro
              activeOpacity={0.85} // Reduce la opacidad a 85% al presionar para dar feedback visual
              style={styles.ctaBtnWrapper} // Aplica ancho completo, bordes redondeados y sombra morada intensa
            > {/* Cierre de la apertura del TouchableOpacity del CTA principal */}
              <LinearGradient // Degradado tricolor morado del botón principal de CTA
                colors={['#9333EA', '#7C3AED', '#6D28D9']} // Degradado de tres tonos de morado
                start={{ x: 0, y: 0 }} // Inicio del degradado en la esquina superior izquierda
                end={{ x: 1, y: 1 }} // Fin del degradado en la esquina inferior derecha (diagonal)
                style={styles.ctaBtn} // Aplica flexDirection row, padding y borderRadius al botón
              > {/* Cierre de la apertura del LinearGradient del botón CTA */}
                <Text style={styles.ctaBtnText}>Crear cuenta gratis</Text> {/* Texto principal del botón CTA en blanco y negrita */}
                <Ionicons name="arrow-forward" size={18} color="#fff" /> {/* Ícono de flecha hacia adelante en blanco junto al texto del botón */}
              </LinearGradient> {/* Cierre del LinearGradient del botón CTA */}
            </TouchableOpacity> {/* Cierre del botón principal del CTA */}

            <TouchableOpacity // Botón secundario del CTA para usuarios que ya tienen cuenta
              style={styles.ctaSecondary} // Aplica flexDirection row para alinear los dos textos en línea
              onPress={() => navigation.navigate('Login' as never)} // Al presionar navega a la pantalla de login
            > {/* Cierre de la apertura del TouchableOpacity del CTA secundario */}
              <Text style={styles.ctaSecondaryText}>Ya tengo cuenta — </Text> {/* Texto gris introductorio del link de login */}
              <Text style={styles.ctaSecondaryLink}>Iniciar sesión</Text> {/* Texto morado clicable que dirige al login */}
            </TouchableOpacity> {/* Cierre del botón secundario del CTA */}
          </View> {/* Cierre del bloque CTA */}

        </View> {/* Cierre de innerContent */}
      </ScrollView> {/* Cierre del ScrollView principal */}
    </View> // Cierre del View raíz del componente
  ); // Cierre del return
}; // Cierre del componente LandingScreen

const styles = StyleSheet.create({ // Crea la hoja de estilos del componente con optimización nativa
  root: { flex: 1, backgroundColor: Colors.backgroundGray }, // Línea 325 — ocupa toda la pantalla con fondo gris claro como color base

  // ── Header ──
  header: { // Línea 328 — estilos del contenedor del header con gradiente
    shadowColor: '#7C3AED', // Línea 329 — color de la sombra del header en morado
    shadowOffset: { width: 0, height: 4 }, // Línea 330 — desplazamiento de la sombra: 4px hacia abajo
    shadowOpacity: 0.25, // Línea 331 — opacidad de la sombra al 25%
    shadowRadius: 10, // Línea 332 — radio de difuminado de la sombra en 10px
    elevation: 8, // Línea 333 — elevación en Android equivalente a la sombra iOS
  }, // Cierre del estilo header
  headerInner: { // Línea 335 — contenedor interno del header con layout horizontal
    flexDirection: 'row', // Línea 336 — alinea logo y botones en fila horizontal
    alignItems: 'center', // Línea 337 — centra verticalmente los elementos de la fila
    justifyContent: 'space-between', // Línea 338 — separa logo y botones en los extremos
    paddingHorizontal: 16, // Línea 339 — padding horizontal de 16px en móvil
    paddingTop: Platform.OS === 'web' ? 16 : 50, // Línea 340 — padding superior: 16px en web, 50px en móvil para el notch
    paddingBottom: 14, // Línea 341 — padding inferior de 14px
  }, // Cierre del estilo headerInner
  headerInnerWide: { // Línea 343 — variante del header para pantallas anchas
    maxWidth: 960, // Línea 344 — ancho máximo de 960px para centrar en pantallas grandes
    alignSelf: 'center', // Línea 345 — centra el contenedor horizontalmente
    width: '100%', // Línea 346 — ocupa el 100% del espacio disponible hasta el máximo
    paddingHorizontal: 32, // Línea 347 — padding horizontal mayor en pantallas anchas
  }, // Cierre del estilo headerInnerWide
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, // Línea 349 — fila con logo y nombre de la app, separados 10px
  logoBox: { // Línea 350 — caja cuadrada para el emoji del logo
    width: 40, height: 40, // Línea 351 — dimensiones fijas de 40x40px para la caja del logo
    backgroundColor: 'rgba(255,255,255,0.2)', // Línea 352 — fondo blanco semitransparente al 20% de opacidad
    borderRadius: 12, // Línea 353 — bordes redondeados de 12px para suavizar la caja
    alignItems: 'center', justifyContent: 'center', // Línea 354 — centra el emoji dentro de la caja
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', // Línea 355 — borde blanco semitransparente al 35% de opacidad
  }, // Cierre del estilo logoBox
  logoEmoji: { fontSize: 20 }, // Línea 357 — tamaño de fuente 20px para el emoji del logo
  appName: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 0.2 }, // Línea 358 — nombre de la app en blanco, tamaño 20, peso 800 y espaciado de letras 0.2
  appNameNarrow: { fontSize: 15 }, // Línea 359 — reduce el tamaño del nombre a 15px en pantallas estrechas
  authRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, // Línea 360 — fila de botones de auth con separación de 8px
  btnNarrow: { paddingHorizontal: 10, paddingVertical: 6 }, // Línea 361 — padding reducido para botones en pantallas estrechas
  btnTextNarrow: { fontSize: 12 }, // Línea 362 — reduce el tamaño de texto de los botones a 12px en pantallas estrechas
  registerBtn: { // Línea 363 — estilos del botón de registro en el header
    borderWidth: 1.5, // Línea 364 — borde de 1.5px de grosor
    borderColor: 'rgba(255,255,255,0.6)', // Línea 365 — borde blanco semitransparente al 60% de opacidad
    borderRadius: 20, // Línea 366 — bordes muy redondeados (forma de píldora) con radio 20px
    paddingHorizontal: 16, // Línea 367 — padding horizontal de 16px
    paddingVertical: 7, // Línea 368 — padding vertical de 7px
  }, // Cierre del estilo registerBtn
  registerBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' }, // Línea 370 — texto del botón de registro en blanco, tamaño 13 y peso 700
  loginBtn: { // Línea 371 — estilos del botón de login en el header
    flexDirection: 'row', // Línea 372 — ícono y texto del botón en fila horizontal
    alignItems: 'center', // Línea 373 — alinea verticalmente el ícono y el texto
    gap: 6, // Línea 374 — separación de 6px entre el ícono y el texto
    backgroundColor: '#fff', // Línea 375 — fondo blanco sólido para contrastar con el header morado
    borderRadius: 20, // Línea 376 — bordes muy redondeados (forma de píldora) con radio 20px
    paddingHorizontal: 16, // Línea 377 — padding horizontal de 16px
    paddingVertical: 7, // Línea 378 — padding vertical de 7px
  }, // Cierre del estilo loginBtn
  loginBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '700' }, // Línea 380 — texto del botón de login en morado primario, tamaño 13 y peso 700

  // ── Scroll ──
  scrollContent: { paddingBottom: 40 }, // Línea 383 — padding inferior de 40px en el contenido del scroll para evitar corte
  innerContent: { paddingHorizontal: 20, paddingTop: 20, gap: 28 }, // Línea 384 — contenedor principal con padding lateral, superior y separación de 28px entre secciones
  innerContentWide: { maxWidth: 960, alignSelf: 'center', width: '100%', paddingHorizontal: 40 }, // Línea 385 — en pantallas anchas: máximo 960px centrado con padding lateral de 40px

  // ── Notificación ──
  notifCard: { // Línea 388 — estilos de la tarjeta de notificación push
    flexDirection: 'row', // Línea 389 — ícono y cuerpo de la notificación en fila horizontal
    backgroundColor: '#fff', // Línea 390 — fondo blanco de la tarjeta
    borderRadius: 18, // Línea 391 — bordes muy redondeados de 18px
    padding: 14, // Línea 392 — padding interno de 14px en todos los lados
    gap: 12, // Línea 393 — separación de 12px entre el ícono y el cuerpo
    shadowColor: '#7C3AED', // Línea 394 — color de sombra en morado para efecto de elevación
    shadowOffset: { width: 0, height: 6 }, // Línea 395 — sombra desplazada 6px hacia abajo
    shadowOpacity: 0.12, // Línea 396 — sombra al 12% de opacidad (sutil)
    shadowRadius: 16, // Línea 397 — radio de difuminado de la sombra en 16px
    elevation: 6, // Línea 398 — elevación en Android de 6 unidades
    borderWidth: 1, // Línea 399 — borde de 1px de grosor
    borderColor: Colors.primaryLighter, // Línea 400 — color del borde en morado claro
  }, // Cierre del estilo notifCard
  notifIconBg: { // Línea 402 — caja cuadrada del ícono de la notificación
    width: 44, height: 44, borderRadius: 12, // Línea 403 — dimensiones 44x44 con bordes redondeados de 12px
    alignItems: 'center', justifyContent: 'center', // Línea 404 — centra el emoji dentro de la caja
    flexShrink: 0, // Línea 405 — evita que la caja del ícono se reduzca cuando el texto es largo
  }, // Cierre del estilo notifIconBg
  notifBody: { flex: 1 }, // Línea 407 — cuerpo de la notificación ocupa todo el espacio disponible en la fila
  notifTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }, // Línea 408 — fila superior con nombre de la app y hora, separados en los extremos
  notifApp: { fontSize: 12, fontWeight: '700', color: Colors.primary }, // Línea 409 — nombre de la app en morado, tamaño 12 y peso 700
  notifTime: { fontSize: 11, color: Colors.textHint }, // Línea 410 — hora de la notificación en gris claro, tamaño 11
  notifTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 }, // Línea 411 — título de la notificación en negrita, tamaño 14 y margen inferior 3px
  notifMsg: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 }, // Línea 412 — mensaje de la notificación en color secundario con interlineado 18px
  notifActions: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 }, // Línea 413 — fila de acciones con separación 14px y margen superior 10px
  notifActionBtn: { // Línea 414 — botón de acción primaria "Abrir app"
    backgroundColor: Colors.primary, // Línea 415 — fondo morado primario del botón
    borderRadius: 10, // Línea 416 — bordes redondeados de 10px
    paddingHorizontal: 14, // Línea 417 — padding horizontal de 14px
    paddingVertical: 6, // Línea 418 — padding vertical de 6px
  }, // Cierre del estilo notifActionBtn
  notifActionText: { color: '#fff', fontSize: 12, fontWeight: '700' }, // Línea 420 — texto del botón de acción en blanco, tamaño 12 y peso 700
  notifDismiss: { fontSize: 12, color: Colors.textHint, fontWeight: '600' }, // Línea 421 — texto "Descartar" en gris claro, tamaño 12 y peso 600
  notifClose: { padding: 2, alignSelf: 'flex-start' }, // Línea 422 — botón X de cierre con padding mínimo alineado al inicio (arriba)

  // ── Hero ──
  hero: { gap: 14 }, // Línea 425 — sección hero con separación vertical de 14px entre badge, título y subtítulo
  heroBadge: { // Línea 426 — estilos de la píldora badge del hero
    flexDirection: 'row', // Línea 427 — dot y texto del badge en fila horizontal
    alignItems: 'center', // Línea 428 — centra verticalmente el dot y el texto
    gap: 8, // Línea 429 — separación de 8px entre el dot y el texto
    alignSelf: 'flex-start', // Línea 430 — la píldora no se estira, solo ocupa el espacio de su contenido
    backgroundColor: Colors.primaryBg, // Línea 431 — fondo morado muy claro para la píldora del badge
    paddingHorizontal: 14, // Línea 432 — padding horizontal de 14px
    paddingVertical: 6, // Línea 433 — padding vertical de 6px
    borderRadius: 20, // Línea 434 — bordes muy redondeados para forma de píldora
  }, // Cierre del estilo heroBadge
  heroBadgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary }, // Línea 436 — punto circular de 8x8px en morado como indicador del badge
  heroBadgeText: { fontSize: 13, color: Colors.primary, fontWeight: '600' }, // Línea 437 — texto del badge en morado, tamaño 13 y peso 600
  heroTitle: { // Línea 438 — estilos del título principal del hero
    fontSize: 36, // Línea 439 — tamaño de fuente grande de 36px
    fontWeight: '900', // Línea 440 — peso de fuente máximo (extra bold) de 900
    color: Colors.textPrimary, // Línea 441 — color de texto principal (negro oscuro)
    lineHeight: 44, // Línea 442 — interlineado de 44px para mejorar legibilidad
    letterSpacing: -0.5, // Línea 443 — espaciado negativo entre letras para efecto de título compacto
  }, // Cierre del estilo heroTitle
  heroSubtitle: { // Línea 445 — estilos del subtítulo descriptivo del hero
    fontSize: 16, // Línea 446 — tamaño de fuente de 16px
    color: Colors.textSecondary, // Línea 447 — color de texto secundario (gris)
    lineHeight: 26, // Línea 448 — interlineado amplio de 26px para facilitar lectura
    maxWidth: 420, // Línea 449 — ancho máximo de 420px para evitar líneas demasiado largas
  }, // Cierre del estilo heroSubtitle

  // ── Features ──
  featuresRow: { flexDirection: 'row', gap: 12 }, // Línea 453 — fila de tarjetas de características con separación de 12px
  featuresRowWide: { gap: 16 }, // Línea 454 — aumenta la separación a 16px en pantallas anchas
  featureCard: { // Línea 455 — estilos base de cada tarjeta de característica
    flex: 1, // Línea 456 — cada tarjeta ocupa el mismo espacio disponible en la fila
    borderRadius: 18, // Línea 457 — bordes redondeados de 18px
    padding: 16, // Línea 458 — padding interno de 16px en todos los lados
    gap: 8, // Línea 459 — separación de 8px entre el ícono, el label y la descripción
    shadowColor: '#000', // Línea 460 — color de sombra en negro
    shadowOffset: { width: 0, height: 2 }, // Línea 461 — sombra desplazada 2px hacia abajo
    shadowOpacity: 0.06, // Línea 462 — sombra muy sutil al 6% de opacidad
    shadowRadius: 8, // Línea 463 — radio de difuminado de 8px
    elevation: 2, // Línea 464 — elevación mínima en Android de 2 unidades
  }, // Cierre del estilo featureCard
  featureIconBox: { // Línea 466 — caja del ícono de la característica
    width: 40, height: 40, borderRadius: 12, // Línea 467 — dimensiones 40x40 con bordes redondeados de 12px
    alignItems: 'center', justifyContent: 'center', // Línea 468 — centra el ícono dentro de la caja
  }, // Cierre del estilo featureIconBox
  featureLabel: { fontSize: 13, fontWeight: '800' }, // Línea 470 — etiqueta del nombre de la característica en tamaño 13 y peso 800
  featureDesc: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16 }, // Línea 471 — descripción en tamaño 11, color secundario e interlineado 16px

  // ── Slider ──
  sliderSection: { gap: 14 }, // Línea 474 — sección del slider con separación de 14px entre título, slider y dots
  sliderHeading: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary }, // Línea 475 — título de la sección del slider en tamaño 20, peso 800 y color primario
  sliderWrapper: { // Línea 476 — contenedor del slider con overflow oculto y sombra
    borderRadius: 22, // Línea 477 — bordes redondeados de 22px para el contenedor del slider
    overflow: 'hidden', // Línea 478 — recorta el contenido que sobresalga de los bordes redondeados
    shadowColor: '#000', // Línea 479 — color de sombra en negro
    shadowOffset: { width: 0, height: 8 }, // Línea 480 — sombra desplazada 8px hacia abajo para efecto de elevación fuerte
    shadowOpacity: 0.14, // Línea 481 — sombra al 14% de opacidad
    shadowRadius: 18, // Línea 482 — radio de difuminado amplio de 18px
    elevation: 8, // Línea 483 — elevación en Android de 8 unidades
    position: 'relative', // Línea 484 — posición relativa para que las flechas absolutas se posicionen dentro
  }, // Cierre del estilo sliderWrapper
  slide: { height: 240 }, // Línea 486 — altura fija de cada slide en 240px
  slideImage: { width: '100%', height: '100%' }, // Línea 487 — imagen del slide ocupa el 100% del ancho y alto del contenedor
  slideOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 140 }, // Línea 488 — overlay degradado posicionado en la parte inferior del slide con altura 140px
  slideTextBox: { position: 'absolute', bottom: 20, left: 20, right: 20 }, // Línea 489 — caja de texto posicionada absolutamente a 20px del borde inferior y laterales
  slideTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 6 }, // Línea 490 — título del slide en blanco, tamaño 20, peso 800 y margen inferior 6px
  slideCaption: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 19 }, // Línea 491 — descripción del slide en blanco al 85% de opacidad con interlineado 19px
  arrow: { // Línea 492 — estilos base de las flechas de navegación del slider
    position: 'absolute', // Línea 493 — posicionada absolutamente dentro del sliderWrapper
    top: '50%', // Línea 494 — comienza en el 50% vertical del contenedor
    backgroundColor: 'rgba(124,58,237,0.75)', // Línea 495 — fondo morado semitransparente al 75% de opacidad
    borderRadius: 22, // Línea 496 — bordes circulares para la flecha
    padding: 8, // Línea 497 — padding interno de 8px alrededor del ícono
    transform: [{ translateY: -18 }], // Línea 498 — desplaza la flecha 18px hacia arriba para centrarla verticalmente respecto al top: 50%
  }, // Cierre del estilo arrow
  arrowLeft: { left: 12 }, // Línea 500 — posiciona la flecha izquierda a 12px del borde izquierdo
  arrowRight: { right: 12 }, // Línea 501 — posiciona la flecha derecha a 12px del borde derecho
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7 }, // Línea 502 — fila de dots centrada horizontalmente con separación de 7px
  dot: { height: 8, borderRadius: 4 }, // Línea 503 — altura fija de 8px y bordes redondeados de 4px para los dots
  dotActive: { backgroundColor: Colors.primary, width: 24 }, // Línea 504 — dot activo: color morado primario y ancho de 24px (elongado)
  dotInactive: { backgroundColor: Colors.primaryLighter, width: 8 }, // Línea 505 — dot inactivo: color morado claro y ancho de 8px (circular)

  // ── Testimonio ──
  testimonialCard: { // Línea 508 — estilos de la tarjeta del testimonio
    borderRadius: 22, // Línea 509 — bordes redondeados de 22px
    overflow: 'hidden', // Línea 510 — recorta el degradado interno para respetar los bordes
    shadowColor: '#7C3AED', // Línea 511 — color de sombra en morado
    shadowOffset: { width: 0, height: 4 }, // Línea 512 — sombra desplazada 4px hacia abajo
    shadowOpacity: 0.1, // Línea 513 — sombra muy sutil al 10% de opacidad
    shadowRadius: 14, // Línea 514 — radio de difuminado de 14px
    elevation: 4, // Línea 515 — elevación en Android de 4 unidades
  }, // Cierre del estilo testimonialCard
  testimonialGradient: { padding: 24, gap: 16 }, // Línea 517 — padding interno de 24px y separación de 16px entre ícono, cita y autor
  quoteIcon: { alignSelf: 'flex-start' }, // Línea 518 — alinea el ícono de cita al inicio (izquierda) sin estirarlo
  testimonialQuote: { // Línea 519 — estilos del texto de la cita del testimonio
    fontSize: 15, // Línea 520 — tamaño de fuente de 15px
    color: Colors.textPrimary, // Línea 521 — color de texto principal (negro oscuro)
    lineHeight: 26, // Línea 522 — interlineado de 26px para facilitar lectura de la cita larga
    fontStyle: 'italic', // Línea 523 — texto en cursiva para indicar que es una cita
    fontWeight: '500', // Línea 524 — peso de fuente medio para la cita
  }, // Cierre del estilo testimonialQuote
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', gap: 12 }, // Línea 526 — fila con avatar y texto del autor, separados 12px
  testimonialAvatar: { width: 44, height: 44, borderRadius: 22 }, // Línea 527 — avatar circular de 44x44px con borderRadius igual a la mitad
  testimonialName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary }, // Línea 528 — nombre del autor en tamaño 14, peso 800 y color primario
  testimonialRole: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 }, // Línea 529 — rol del autor en tamaño 12, color secundario y margen superior 2px

  // ── CTA ──
  cta: { alignItems: 'center', gap: 16, paddingTop: 8 }, // Línea 532 — sección CTA centrada con separación de 16px y padding superior de 8px
  ctaTitle: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center' }, // Línea 533 — título del CTA en tamaño 24, peso 900 y centrado
  ctaSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 }, // Línea 534 — subtítulo del CTA en tamaño 14, color secundario, centrado con interlineado 22px
  ctaBtnWrapper: { // Línea 535 — contenedor del botón principal del CTA con sombra intensa
    width: '100%', // Línea 536 — ocupa el 100% del ancho disponible
    borderRadius: 18, // Línea 537 — bordes redondeados de 18px
    overflow: 'hidden', // Línea 538 — recorta el degradado del botón para respetar los bordes
    shadowColor: '#7C3AED', // Línea 539 — color de sombra en morado para efecto de brillo
    shadowOffset: { width: 0, height: 8 }, // Línea 540 — sombra desplazada 8px hacia abajo para efecto de elevación fuerte
    shadowOpacity: 0.4, // Línea 541 — sombra al 40% de opacidad (prominente)
    shadowRadius: 16, // Línea 542 — radio de difuminado amplio de 16px
    elevation: 10, // Línea 543 — elevación alta en Android de 10 unidades
  }, // Cierre del estilo ctaBtnWrapper
  ctaBtn: { // Línea 545 — estilos del botón degradado interno del CTA
    flexDirection: 'row', // Línea 546 — texto e ícono del botón en fila horizontal
    alignItems: 'center', // Línea 547 — alinea verticalmente texto e ícono
    justifyContent: 'center', // Línea 548 — centra horizontalmente el contenido del botón
    gap: 10, // Línea 549 — separación de 10px entre texto e ícono
    paddingVertical: 18, // Línea 550 — padding vertical de 18px para un botón grande y táctil
    paddingHorizontal: 44, // Línea 551 — padding horizontal de 44px
    borderRadius: 18, // Línea 552 — bordes redondeados de 18px
  }, // Cierre del estilo ctaBtn
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 }, // Línea 554 — texto del botón CTA en blanco, tamaño 17, peso 800 y espaciado de letras 0.3
  ctaSecondary: { flexDirection: 'row', alignItems: 'center' }, // Línea 555 — botón secundario del CTA en fila horizontal sin separación
  ctaSecondaryText: { fontSize: 14, color: Colors.textSecondary }, // Línea 556 — texto gris "Ya tengo cuenta" en tamaño 14
  ctaSecondaryLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' }, // Línea 557 — texto morado "Iniciar sesión" en tamaño 14 y peso 700
}); // Cierre del StyleSheet.create
