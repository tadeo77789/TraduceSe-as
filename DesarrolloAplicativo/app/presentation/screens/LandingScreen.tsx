// Archivo: app/presentation/screens/LandingScreen.tsx
/**
 * @file LandingScreen.tsx
 * @description Pantalla de bienvenida pública (antes de autenticarse).
 *
 * Contiene:
 * - Header con logo y botones "Registrarse" / "Ingresar".
 * - Tarjeta de notificación push simulada (descartable).
 * - Sección hero con título, subtítulo y badge LSC.
 * - Card de característica principal (Traducción).
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
import { Colors } from '../../shared/constants/colors'; // Paleta de colores centralizada del proyecto — ruta: app/constants/colors.ts
import { useTranslation } from '../../shared/i18n'; 

export const LandingScreen: React.FC = () => { // Declara y exporta el componente funcional LandingScreen tipado como React.FC
  const navigation = useNavigation(); // Obtiene el objeto de navegación para poder navegar entre pantallas
  const { width } = useWindowDimensions(); // Obtiene el ancho actual de la ventana para calcular layouts responsivos
  const isWide = width >= 768; // Booleano: true si la pantalla tiene 768px o más (modo escritorio/tablet)
  const isNarrow = width < 430; // Booleano: true si la pantalla tiene menos de 430px (teléfonos muy pequeños)
  const sliderRef = useRef<FlatList>(null); // Referencia al componente FlatList del slider para controlar el scroll programáticamente

  const [activeSlide, setActiveSlide] = useState(0); // Estado del slide activo: número entero que comienza en 0 (primer slide)
  const [showNotif, setShowNotif] = useState(true); // Estado de visibilidad de la notificación push: true = visible, false = descartada

  const { t } = useTranslation();

  const SLIDES = [
    { id: '1', image: require('../../assets/images/traducion-real.png'),         title: t('slide1Title'), caption: t('slide1Caption') },
    { id: '2', image: require('../../assets/images/comunicate-sinbarreras.png'), title: t('slide2Title'), caption: t('slide2Caption') },
    { id: '3', image: require('../../assets/images/alfabeto.png'),               title: t('slide3Title'), caption: t('slide3Caption') },
  ];

  const FEATURES = [
    { icon: 'hand-left-outline' as const, label: 'Traducción',  desc: 'Seña a texto en tiempo real con IA', color: '#7C3AED', bg: '#EDE9FE' },
    { icon: 'hand-left-outline' as const, label: 'Alfabeto LSC', desc: 'Las 27 letras del abecedario en señas', color: '#06B6D4', bg: '#CFFAFE' },
    { icon: 'bar-chart-outline' as const, label: 'Estadísticas', desc: 'Seguimiento de tu progreso diario',    color: '#10B981', bg: '#D1FAE5' },
    { icon: 'time-outline' as const,      label: 'Historial',    desc: 'Revisa tus traducciones anteriores',   color: '#F59E0B', bg: '#FEF3C7' },
  ];

  const HOW_IT_WORKS = [
    { step: '1', icon: 'camera-outline' as const,   title: 'Abre la cámara',       desc: 'Apunta tu cámara hacia tus manos en un lugar bien iluminado.' },
    { step: '2', icon: 'hand-left-outline' as const, title: 'Realiza la seña',      desc: 'Haz la seña LSC frente a la cámara. El modelo la detecta en tiempo real.' },
    { step: '3', icon: 'chatbubble-outline' as const, title: 'Obtén la traducción', desc: 'El texto traducido aparece instantáneamente en pantalla.' },
  ];

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
    <View style={styles.root}>{/* Contenedor raíz que ocupa toda la pantalla con fondo gris claro */}

      {/* ── Header ───────────────────────────────────────────── */}
      <View style={styles.header}>{/* Header con color sólido lavanda igual al WebTopBar de usuario */}
        <View style={[styles.headerInner, isWide && styles.headerInnerWide]}>{/* Contenedor interno del header: en pantallas anchas aplica estilo centrado con máximo 960px */}
          {/* Logo */}
          <View style={styles.logoRow}>{/* Fila horizontal que agrupa el ícono y el nombre de la app */}
            <LinearGradient colors={Colors.gradientPrimary} style={styles.logoBox}>{/* Caja cuadrada con degradado morado que contiene la imagen del logo */}
              <Image
                source={require('../../assets/images/icono.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />{/* Imagen del icono que actúa como logotipo de la app */}
            </LinearGradient>{/* Cierre de logoBox */}
            <Text style={[styles.appName, isNarrow && styles.appNameNarrow]}>TraduceSeña</Text>{/* Nombre de la aplicación: en pantallas estrechas reduce el tamaño de fuente */}
          </View>{/* Cierre de logoRow */}

          {/* Acciones de auth */}
          <View style={styles.authRow}>{/* Fila horizontal que agrupa los botones de Registrarse e Ingresar */}
            <TouchableOpacity // Botón táctil para ir a la pantalla de registro
              style={[styles.registerBtn, isNarrow && styles.btnNarrow]} // En pantallas estrechas reduce el padding del botón
              onPress={() => navigation.navigate('Register' as never)} // Al presionar navega a la pantalla Register
            >{/* Cierre de la apertura del TouchableOpacity de Registrarse */}
              <Text style={[styles.registerBtnText, isNarrow && styles.btnTextNarrow]}>{t('register')}</Text>{/* Texto del botón de registro: en pantallas estrechas reduce el tamaño de fuente */}
            </TouchableOpacity>{/* Cierre del botón Registrarse */}
            <TouchableOpacity // Botón táctil para ir a la pantalla de login
              style={[styles.loginBtn, isNarrow && styles.btnNarrow]} // En pantallas estrechas reduce el padding del botón
              onPress={() => navigation.navigate('Login' as never)} // Al presionar navega a la pantalla Login
            >{/* Cierre de la apertura del TouchableOpacity de Ingresar */}
              <Ionicons name="log-in-outline" size={isNarrow ? 16 : 18} color={Colors.primary} />{/* Ícono de flecha de ingreso: tamaño 16 en pantallas estrechas, 18 en normales */}
              <Text style={[styles.loginBtnText, isNarrow && styles.btnTextNarrow]}>{t('login')}</Text>{/* Texto del botón de login: en pantallas estrechas reduce el tamaño de fuente */}
            </TouchableOpacity>{/* Cierre del botón Ingresar */}
          </View>{/* Cierre de authRow */}
        </View>{/* Cierre de headerInner */}
      </View>{/* Cierre del header */}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>{/* ScrollView principal de la pantalla: oculta la barra de scroll y aplica padding inferior */}
        <View style={[styles.innerContent, isWide && styles.innerContentWide]}>{/* Contenedor del contenido principal: en pantallas anchas centra el contenido a máximo 960px */}

          {/* ── Notificación push ────────────────────────────── */}
          {showNotif && ( // Renderiza la tarjeta de notificación solo si showNotif es true (no ha sido descartada)
            <View style={styles.notifCard}>{/* Tarjeta de notificación simulada con fondo blanco, bordes redondeados y sombra morada */}
              <LinearGradient colors={['#9333EA', '#7C3AED']} style={styles.notifIconBg}>{/* Fondo degradado morado del ícono de la notificación */}
                <Image
                  source={require('../../assets/images/icono.png')}
                  style={styles.notifIconImage}
                  resizeMode="contain"
                />{/* Imagen del icono como ícono de la notificación push */}
              </LinearGradient>{/* Cierre del degradado del ícono de notificación */}
              <View style={styles.notifBody}>{/* Contenedor principal del cuerpo de la notificación (flex:1 para ocupar el espacio disponible) */}
                <View style={styles.notifTopRow}>{/* Fila superior de la notificación con nombre de la app y hora */}
                  <Text style={styles.notifApp}>TraduceSeña</Text>{/* Nombre de la app que originó la notificación en color morado */}
                  <Text style={styles.notifTime}>{t('now')}</Text>{/* Indicador de tiempo de la notificación en color gris claro */}
                </View>{/* Cierre de notifTopRow */}
                <Text style={styles.notifTitle}>{t('notifTitle')}</Text>{/* Título principal de la notificación en negrita */}
                <Text style={styles.notifMsg}>{t('notifMsg')}</Text>{/* Mensaje descriptivo de la notificación en color secundario */}
                <View style={styles.notifActions}>{/* Fila de acciones de la notificación con dos botones */}
                  <TouchableOpacity // Botón de acción primaria de la notificación
                    style={styles.notifActionBtn} // Aplica fondo morado con bordes redondeados al botón
                    onPress={() => navigation.navigate('Login' as never)} // Al presionar navega a la pantalla de Login
                  >{/* Cierre de la apertura del TouchableOpacity de "Abrir app" */}
                    <Text style={styles.notifActionText}>{t('openApp')}</Text>{/* Texto del botón de acción principal en blanco */}
                  </TouchableOpacity>{/* Cierre del botón "Abrir app" */}
                  <TouchableOpacity onPress={() => setShowNotif(false)}>{/* Botón para descartar la notificación: cambia showNotif a false ocultando la tarjeta */}
                    <Text style={styles.notifDismiss}>{t('dismiss')}</Text>{/* Texto del botón de descarte en color gris */}
                  </TouchableOpacity>{/* Cierre del botón Descartar */}
                </View>{/* Cierre de notifActions */}
              </View>{/* Cierre de notifBody */}
              <TouchableOpacity onPress={() => setShowNotif(false)} style={styles.notifClose}>{/* Botón X en la esquina de la tarjeta para cerrar la notificación */}
                <Ionicons name="close" size={16} color={Colors.textHint} />{/* Ícono de cierre (X) en color gris suave */}
              </TouchableOpacity>{/* Cierre del botón de cierre de notificación */}
            </View> // Cierre de notifCard
          )}{/* Cierre del renderizado condicional de la notificación */}

          {/* ── Hero text ────────────────────────────────────── */}
          <View style={styles.hero}>{/* Sección hero con gap entre elementos para separar badge, título y subtítulo */}
            <View style={styles.heroBadge}>{/* Píldora con fondo morado claro que contiene el badge de LSC */}
              <View style={styles.heroBadgeDot} />{/* Punto circular morado que actúa como indicador visual del badge */}
              <Text style={styles.heroBadgeText}>{t('appTagline')}</Text>{/* Texto del badge que identifica el lenguaje soportado */}
            </View>{/* Cierre de heroBadge */}
            <Text style={styles.heroTitle}>{t('heroTitle')}</Text>
            <Text style={styles.heroSubtitle}>{t('heroSubtitle')}</Text>
          </View>{/* Cierre de la sección hero */}

          {/* ── Feature cards ────────────────────────────────── */}
          <View style={styles.featuresRow}>
            {FEATURES.map((f, i) => (
              <View key={i} style={[styles.featureCard, { backgroundColor: f.bg }]}>
                <View style={[styles.featureIconBox, { backgroundColor: f.color + '25' }]}>
                  <Ionicons name={f.icon} size={22} color={f.color} />
                </View>
                <Text style={[styles.featureLabel, { color: f.color }]}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>

          {/* ── Slider ───────────────────────────────────────── */}
          <View style={styles.sliderSection}>{/* Sección completa del slider con gap para separar título, slider y dots */}
            <Text style={styles.sliderHeading}>{t('sliderTitle')}</Text>{/* Título de la sección del slider en tamaño 20 y peso 800 */}

            <View style={styles.sliderWrapper}>{/* Contenedor del slider con overflow hidden para recortar bordes y sombra */}
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
                  <View style={[styles.slide, { width: SLIDE_WIDTH }]}>{/* Contenedor del slide con altura fija y ancho dinámico */}
                    <Image // Imagen de fondo del slide
                      source={item.image} // Fuente de la imagen local definida en el objeto del slide
                      style={styles.slideImage} // Aplica ancho y alto al 100% para cubrir todo el slide
                      resizeMode="cover" // Escala la imagen para cubrir el contenedor sin deformarla
                    />{/* Cierre de Image */}
                    <LinearGradient // Degradado oscuro sobre la imagen para mejorar legibilidad del texto
                      colors={['transparent', 'rgba(0,0,0,0.65)']} // De transparente arriba a negro semiopaco abajo
                      style={styles.slideOverlay} // Posicionado absolutamente en la parte inferior del slide
                    />{/* Cierre del LinearGradient del overlay */}
                    <View style={styles.slideTextBox}>{/* Contenedor del texto del slide, posicionado en la esquina inferior izquierda */}
                      <Text style={styles.slideTitle}>{item.title}</Text>{/* Título del slide en blanco y negrita sobre la imagen */}
                      <Text style={styles.slideCaption}>{item.caption}</Text>{/* Descripción del slide en blanco semiopaco con interlineado */}
                    </View>{/* Cierre de slideTextBox */}
                  </View> // Cierre del contenedor del slide
                )} // Cierre de renderItem
              />{/* Cierre de FlatList */}

              {/* Flechas */}
              <TouchableOpacity // Flecha izquierda del slider para ir al slide anterior
                style={[styles.arrow, styles.arrowLeft]} // Posicionada absolutamente en el borde izquierdo del slider
                onPress={() => goToSlide('prev')} // Al presionar llama a goToSlide con dirección 'prev'
              >{/* Cierre de la apertura del TouchableOpacity de flecha izquierda */}
                <Ionicons name="chevron-back" size={20} color="#fff" />{/* Ícono de flecha hacia atrás en blanco */}
              </TouchableOpacity>{/* Cierre de la flecha izquierda */}
              <TouchableOpacity // Flecha derecha del slider para ir al slide siguiente
                style={[styles.arrow, styles.arrowRight]} // Posicionada absolutamente en el borde derecho del slider
                onPress={() => goToSlide('next')} // Al presionar llama a goToSlide con dirección 'next'
              >{/* Cierre de la apertura del TouchableOpacity de flecha derecha */}
                <Ionicons name="chevron-forward" size={20} color="#fff" />{/* Ícono de flecha hacia adelante en blanco */}
              </TouchableOpacity>{/* Cierre de la flecha derecha */}
            </View>{/* Cierre de sliderWrapper */}

            {/* Dots */}
            <View style={styles.dots}>{/* Fila centrada de dots indicadores del slide activo */}
              {SLIDES.map((_, i) => ( // Itera sobre SLIDES para crear un dot por cada slide
                <TouchableOpacity // Dot tocable para navegar directamente a un slide específico
                  key={i} // Clave única del dot basada en su índice
                  onPress={() => { // Al presionar el dot navega al slide correspondiente
                    sliderRef.current?.scrollToIndex({ index: i, animated: true }); // Desplaza el FlatList al slide del dot presionado con animación
                    setActiveSlide(i); // Actualiza el estado del slide activo al índice del dot presionado
                  }} // Cierre del handler onPress del dot
                >{/* Cierre de la apertura del TouchableOpacity del dot */}
                  <View style={[styles.dot, i === activeSlide ? styles.dotActive : styles.dotInactive]} />{/* Dot visual: ancho y color morado si es el activo, gris y pequeño si no lo es */}
                </TouchableOpacity> // Cierre del TouchableOpacity del dot
              ))}{/* Cierre del map de dots */}
            </View>{/* Cierre del contenedor de dots */}
          </View>{/* Cierre de sliderSection */}

          {/* ── Cómo funciona ────────────────────────────────── */}
          <View style={styles.howSection}>
            <View style={styles.sectionBadge}>
              <View style={styles.sectionBadgeDot} />
              <Text style={styles.sectionBadgeText}>Fácil de usar</Text>
            </View>
            <Text style={styles.sectionHeading}>¿Cómo funciona?</Text>
            <Text style={styles.sectionSubtitle}>En tres pasos estarás traduciendo señas con precisión.</Text>

            {HOW_IT_WORKS.map((item, i) => (
              <View key={i} style={styles.howCard}>
                <LinearGradient colors={['#9333EA', '#7C3AED']} style={styles.howStep}>
                  <Text style={styles.howStepNum}>{item.step}</Text>
                </LinearGradient>
                <View style={[styles.howIconBox, { backgroundColor: '#EDE9FE' }]}>
                  <Ionicons name={item.icon} size={22} color={Colors.primary} />
                </View>
                <View style={styles.howBody}>
                  <Text style={styles.howTitle}>{item.title}</Text>
                  <Text style={styles.howDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── Sobre la LSC ─────────────────────────────────── */}
          <View style={styles.lscSection}>
            <View style={styles.sectionBadge}>
              <View style={styles.sectionBadgeDot} />
              <Text style={styles.sectionBadgeText}>Conoce más</Text>
            </View>
            <Text style={styles.sectionHeading}>La Lengua de Señas Colombiana</Text>

            <View style={styles.lscImageCard}>
              <Image
                source={require('../../assets/images/historial.png')}
                style={styles.lscImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(124,58,237,0.85)']}
                style={styles.lscImageOverlay}
              />
              <View style={styles.lscImageText}>
                <Text style={styles.lscImageTitle}>Reconocida oficialmente</Text>
                <Text style={styles.lscImageSub}>Ley 324 de 1996 — Colombia</Text>
              </View>
            </View>

            <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
              {[
                { value: '+500K', label: 'Personas sordas en Colombia', icon: 'people-outline' as const, color: '#7C3AED' },
                { value: '27',    label: 'Letras en el alfabeto LSC',    icon: 'hand-left-outline' as const, color: '#06B6D4' },
                { value: '100%',  label: 'Gratis y sin registro previo', icon: 'shield-checkmark-outline' as const, color: '#10B981' },
              ].map((stat, i) => (
                <View key={i} style={styles.statBox}>
                  <Ionicons name={stat.icon} size={22} color={stat.color} />
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.lscInfoCard}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.lscInfoText}>
                La LSC es la lengua natural de la comunidad sorda colombiana. Tiene su propia gramática, sintaxis y expresiones culturales únicas, distintas del español hablado.
              </Text>
            </View>

            <View style={styles.lscBanner}>
              <Image
                source={require('../../assets/images/alfabeto.png')}
                style={styles.lscBannerImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
                style={styles.lscBannerOverlay}
              />
              <View style={styles.lscBannerContent}>
                <Text style={styles.lscBannerTitle}>Aprende el alfabeto dactilológico</Text>
                <Text style={styles.lscBannerSub}>Domina las 27 letras y empieza a deletrear en LSC desde cero.</Text>
                <TouchableOpacity
                  style={styles.lscBannerBtn}
                  onPress={() => navigation.navigate('Register' as never)}
                >
                  <Text style={styles.lscBannerBtnText}>Comenzar gratis</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Testimonio ───────────────────────────────────── */}
          <View style={styles.testimonialCard}>{/* Tarjeta del testimonio con bordes redondeados y sombra morada */}
            <LinearGradient colors={['#EDE9FE', '#F5F3FF']} style={styles.testimonialGradient}>{/* Degradado de lavanda a casi blanco como fondo de la tarjeta del testimonio */}
              <Ionicons name="chatbubble-ellipses" size={28} color={Colors.primaryLighter} style={styles.quoteIcon} />{/* Ícono de burbuja de chat que representa la cita del testimonio */}
              <Text style={styles.testimonialQuote}>{t('testimonialQuote')}</Text>
              <View style={styles.testimonialAuthor}>{/* Fila horizontal con avatar e información del autor del testimonio */}
                <Image // Imagen circular del avatar del autor del testimonio
                  source={require('../../assets/images/testimonial.jpg')} // Imagen local del avatar — ruta: app/assets/images/testimonial.jpg
                  style={styles.testimonialAvatar} // Aplica tamaño 44x44 y borderRadius 22 para hacerla circular
                />{/* Cierre de Image del avatar */}
                <View>{/* Contenedor de texto con el nombre y rol del autor */}
                  <Text style={styles.testimonialName}>{t('testimonialName')}</Text>
                  <Text style={styles.testimonialRole}>{t('testimonialRole')}</Text>
                </View>{/* Cierre del contenedor de texto del autor */}
              </View>{/* Cierre de testimonialAuthor */}
            </LinearGradient>{/* Cierre del LinearGradient del testimonio */}
          </View>{/* Cierre de testimonialCard */}

          {/* ── CTA final ────────────────────────────────────── */}
          <View style={styles.cta}>{/* Sección de llamada a la acción final centrada con gap entre elementos */}
            <Text style={styles.ctaTitle}>{t('ctaTitle')}</Text>
            <Text style={styles.ctaSubtitle}>{t('ctaSubtitle')}</Text>{/* Subtítulo descriptivo del CTA en color secundario */}

            <TouchableOpacity // Botón principal del CTA para ir a registro
              onPress={() => navigation.navigate('Register' as never)} // Al presionar navega a la pantalla de registro
              activeOpacity={0.85} // Reduce la opacidad a 85% al presionar para dar feedback visual
              style={styles.ctaBtnWrapper} // Aplica ancho completo, bordes redondeados y sombra morada intensa
            >{/* Cierre de la apertura del TouchableOpacity del CTA principal */}
              <LinearGradient // Degradado tricolor morado del botón principal de CTA
                colors={['#9333EA', '#7C3AED', '#6D28D9']} // Degradado de tres tonos de morado
                start={{ x: 0, y: 0 }} // Inicio del degradado en la esquina superior izquierda
                end={{ x: 1, y: 1 }} // Fin del degradado en la esquina inferior derecha (diagonal)
                style={styles.ctaBtn} // Aplica flexDirection row, padding y borderRadius al botón
              >{/* Cierre de la apertura del LinearGradient del botón CTA */}
                <Text style={styles.ctaBtnText}>{t('ctaBtn')}</Text>{/* Texto principal del botón CTA en blanco y negrita */}
                <Ionicons name="arrow-forward" size={18} color="#fff" />{/* Ícono de flecha hacia adelante en blanco junto al texto del botón */}
              </LinearGradient>{/* Cierre del LinearGradient del botón CTA */}
            </TouchableOpacity>{/* Cierre del botón principal del CTA */}

            <TouchableOpacity // Botón secundario del CTA para usuarios que ya tienen cuenta
              style={styles.ctaSecondary} // Aplica flexDirection row para alinear los dos textos en línea
              onPress={() => navigation.navigate('Login' as never)} // Al presionar navega a la pantalla de login
            >{/* Cierre de la apertura del TouchableOpacity del CTA secundario */}
              <Text style={styles.ctaSecondaryText}>{t('ctaHasAccount')}</Text>
              <Text style={styles.ctaSecondaryLink}>{t('ctaLoginLink')}</Text>{/* Texto morado clicable que dirige al login */}
            </TouchableOpacity>{/* Cierre del botón secundario del CTA */}
          </View>{/* Cierre del bloque CTA */}

        </View>{/* Cierre de innerContent */}
      </ScrollView>{/* Cierre del ScrollView principal */}
    </View> // Cierre del View raíz del componente
  ); // Cierre del return
}; // Cierre del componente LandingScreen

const styles = StyleSheet.create({ // Crea la hoja de estilos del componente con optimización nativa
  root: { flex: 1, backgroundColor: Colors.backgroundGray }, // Línea 325 — ocupa toda la pantalla con fondo gris claro como color base

  // ── Header ──
  header: { // Línea 328 — estilos del contenedor del header con color lavanda como WebTopBar
    backgroundColor: Colors.primaryHeader, // Color de fondo lavanda igual al WebTopBar de usuario
    borderBottomWidth: 1, // Línea de separación inferior sutil
    borderBottomColor: Colors.primaryLighter, // Color del borde inferior en morado claro
    shadowColor: '#7C3AED', // Línea 329 — color de la sombra del header en morado
    shadowOffset: { width: 0, height: 3 }, // Línea 330 — desplazamiento de la sombra: 3px hacia abajo
    shadowOpacity: 0.1, // Línea 331 — opacidad de la sombra al 10%
    shadowRadius: 10, // Línea 332 — radio de difuminado de la sombra en 10px
    elevation: 6, // Línea 333 — elevación en Android equivalente a la sombra iOS
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
  logoBox: { // Línea 350 — caja cuadrada del logo con degradado morado
    width: 40, height: 40, // Línea 351 — dimensiones fijas de 40x40px para la caja del logo
    borderRadius: 12, // Línea 353 — bordes redondeados de 12px para suavizar la caja
    alignItems: 'center', justifyContent: 'center', // Línea 354 — centra la imagen dentro de la caja
    overflow: 'hidden', // Recorta la imagen al borde redondeado
  }, // Cierre del estilo logoBox
  logoImage: { width: 32, height: 32 }, // Tamaño de la imagen del logo dentro de la caja
  appName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.2 }, // Línea 358 — nombre de la app en color de texto principal sobre fondo lavanda
  appNameNarrow: { fontSize: 15 }, // Línea 359 — reduce el tamaño del nombre a 15px en pantallas estrechas
  authRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, // Línea 360 — fila de botones de auth con separación de 8px
  btnNarrow: { paddingHorizontal: 10, paddingVertical: 6 }, // Línea 361 — padding reducido para botones en pantallas estrechas
  btnTextNarrow: { fontSize: 12 }, // Línea 362 — reduce el tamaño de texto de los botones a 12px en pantallas estrechas
  registerBtn: { // Línea 363 — estilos del botón de registro en el header
    borderWidth: 1.5, // Línea 364 — borde de 1.5px de grosor
    borderColor: Colors.primary, // Borde morado primario para destacar sobre fondo lavanda
    borderRadius: 20, // Línea 366 — bordes muy redondeados (forma de píldora) con radio 20px
    paddingHorizontal: 16, // Línea 367 — padding horizontal de 16px
    paddingVertical: 7, // Línea 368 — padding vertical de 7px
  }, // Cierre del estilo registerBtn
  registerBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '700' }, // Texto del botón de registro en morado primario
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
    alignItems: 'center', justifyContent: 'center', // Línea 404 — centra la imagen dentro de la caja
    flexShrink: 0, // Línea 405 — evita que la caja del ícono se reduzca cuando el texto es largo
    overflow: 'hidden', // Recorta la imagen al borde redondeado del contenedor
  }, // Cierre del estilo notifIconBg
  notifIconImage: { width: 30, height: 30 }, // Tamaño de la imagen del icono dentro del cuadro de la notificación
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

  // ── Badges de sección ──
  sectionBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: Colors.primaryBg, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  sectionBadgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  sectionBadgeText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  sectionHeading: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, lineHeight: 30, marginBottom: 6 },
  sectionSubtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: 16 },

  // ── Cómo funciona ──
  howSection: { gap: 12 },
  howCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  howStep: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  howStepNum: { color: '#fff', fontSize: 14, fontWeight: '800' },
  howIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  howBody: { flex: 1, gap: 3 },
  howTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  howDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // ── LSC ──
  lscSection: { gap: 16 },
  lscImageCard: { width: '100%', height: 200, borderRadius: 22, overflow: 'hidden', shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 8 },
  lscImage: { width: '100%', height: '100%' },
  lscImageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  lscImageText: { position: 'absolute', bottom: 18, left: 18 },
  lscImageTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  lscImageSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statsGridWide: { flexWrap: 'nowrap' },
  statBox: { flex: 1, minWidth: '28%', backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', lineHeight: 15 },
  lscInfoCard: { flexDirection: 'row', gap: 12, backgroundColor: Colors.primaryBg, borderRadius: 16, padding: 16, alignItems: 'flex-start' },
  lscInfoText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 21 },
  lscBanner: { width: '100%', height: 220, borderRadius: 22, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 14, elevation: 8 },
  lscBannerImage: { width: '100%', height: '100%' },
  lscBannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%' },
  lscBannerContent: { position: 'absolute', bottom: 20, left: 20, right: 20, gap: 6 },
  lscBannerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  lscBannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 20 },
  lscBannerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 4 },
  lscBannerBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },

  // ── Features ──
  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featuresRowWide: { gap: 16 },
  featureCard: {
    width: '47%',
    borderRadius: 18,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureLabel: { fontSize: 13, fontWeight: '800' },
  featureDesc: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16 },

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
