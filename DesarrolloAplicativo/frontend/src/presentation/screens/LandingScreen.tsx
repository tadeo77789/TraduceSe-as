

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Platform,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../shared/constants/colors';
import { useTranslation } from '../../shared/i18n';

export const LandingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const isNarrow = width < 430;
  const sliderRef = useRef<FlatList>(null);

  const [activeSlide, setActiveSlide] = useState(0);
  const [showNotif, setShowNotif] = useState(true);

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

  const SLIDE_WIDTH = isWide ? Math.min(width - 80, 860) : width - 40;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    setActiveSlide(index);
  };

  const goToSlide = (dir: 'prev' | 'next') => {
    const next = dir === 'next'
      ? Math.min(activeSlide + 1, SLIDES.length - 1)
      : Math.max(activeSlide - 1, 0);
    sliderRef.current?.scrollToIndex({ index: next, animated: true });
    setActiveSlide(next);
  };

  return (
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
            <TouchableOpacity
              style={[styles.registerBtn, isNarrow && styles.btnNarrow]}
              onPress={() => navigation.navigate('Register' as never)}
            >{/* Cierre de la apertura del TouchableOpacity de Registrarse */}
              <Text style={[styles.registerBtnText, isNarrow && styles.btnTextNarrow]}>{t('register')}</Text>{/* Texto del botón de registro: en pantallas estrechas reduce el tamaño de fuente */}
            </TouchableOpacity>{/* Cierre del botón Registrarse */}
            <TouchableOpacity
              style={[styles.loginBtn, isNarrow && styles.btnNarrow]}
              onPress={() => navigation.navigate('Login' as never)}
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
          {showNotif && (
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
                  <TouchableOpacity
                    style={styles.notifActionBtn}
                    onPress={() => navigation.navigate('Login' as never)}
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
            </View>
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
              <FlatList
                ref={sliderRef}
                data={SLIDES}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                keyExtractor={item => item.id}
                getItemLayout={(_, index) => ({
                  length: SLIDE_WIDTH,
                  offset: SLIDE_WIDTH * index,
                  index,
                })}
                renderItem={({ item }) => (
                  <View style={[styles.slide, { width: SLIDE_WIDTH }]}>{/* Contenedor del slide con altura fija y ancho dinámico */}
                    <Image
                      source={item.image}
                      style={styles.slideImage}
                      resizeMode="cover"
                    />{/* Cierre de Image */}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.65)']}
                      style={styles.slideOverlay}
                    />{/* Cierre del LinearGradient del overlay */}
                    <View style={styles.slideTextBox}>{/* Contenedor del texto del slide, posicionado en la esquina inferior izquierda */}
                      <Text style={styles.slideTitle}>{item.title}</Text>{/* Título del slide en blanco y negrita sobre la imagen */}
                      <Text style={styles.slideCaption}>{item.caption}</Text>{/* Descripción del slide en blanco semiopaco con interlineado */}
                    </View>{/* Cierre de slideTextBox */}
                  </View>
                )}
              />{/* Cierre de FlatList */}

              {/* Flechas */}
              <TouchableOpacity
                style={[styles.arrow, styles.arrowLeft]}
                onPress={() => goToSlide('prev')}
              >{/* Cierre de la apertura del TouchableOpacity de flecha izquierda */}
                <Ionicons name="chevron-back" size={20} color="#fff" />{/* Ícono de flecha hacia atrás en blanco */}
              </TouchableOpacity>{/* Cierre de la flecha izquierda */}
              <TouchableOpacity
                style={[styles.arrow, styles.arrowRight]}
                onPress={() => goToSlide('next')}
              >{/* Cierre de la apertura del TouchableOpacity de flecha derecha */}
                <Ionicons name="chevron-forward" size={20} color="#fff" />{/* Ícono de flecha hacia adelante en blanco */}
              </TouchableOpacity>{/* Cierre de la flecha derecha */}
            </View>{/* Cierre de sliderWrapper */}

            {/* Dots */}
            <View style={styles.dots}>{/* Fila centrada de dots indicadores del slide activo */}
              {SLIDES.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    sliderRef.current?.scrollToIndex({ index: i, animated: true });
                    setActiveSlide(i);
                  }}
                >{/* Cierre de la apertura del TouchableOpacity del dot */}
                  <View style={[styles.dot, i === activeSlide ? styles.dotActive : styles.dotInactive]} />{/* Dot visual: ancho y color morado si es el activo, gris y pequeño si no lo es */}
                </TouchableOpacity>
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
                <Image
                  source={require('../../assets/images/testimonial.jpg')}
                  style={styles.testimonialAvatar}
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

            <TouchableOpacity
              onPress={() => navigation.navigate('Register' as never)}
              activeOpacity={0.85}
              style={styles.ctaBtnWrapper}
            >{/* Cierre de la apertura del TouchableOpacity del CTA principal */}
              <LinearGradient
                colors={['#9333EA', '#7C3AED', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaBtn}
              >{/* Cierre de la apertura del LinearGradient del botón CTA */}
                <Text style={styles.ctaBtnText}>{t('ctaBtn')}</Text>{/* Texto principal del botón CTA en blanco y negrita */}
                <Ionicons name="arrow-forward" size={18} color="#fff" />{/* Ícono de flecha hacia adelante en blanco junto al texto del botón */}
              </LinearGradient>{/* Cierre del LinearGradient del botón CTA */}
            </TouchableOpacity>{/* Cierre del botón principal del CTA */}

            <TouchableOpacity
              style={styles.ctaSecondary}
              onPress={() => navigation.navigate('Login' as never)}
            >{/* Cierre de la apertura del TouchableOpacity del CTA secundario */}
              <Text style={styles.ctaSecondaryText}>{t('ctaHasAccount')}</Text>
              <Text style={styles.ctaSecondaryLink}>{t('ctaLoginLink')}</Text>{/* Texto morado clicable que dirige al login */}
            </TouchableOpacity>{/* Cierre del botón secundario del CTA */}
          </View>{/* Cierre del bloque CTA */}

        </View>{/* Cierre de innerContent */}
      </ScrollView>{/* Cierre del ScrollView principal */}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray },

  header: {
    backgroundColor: Colors.primaryHeader,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLighter,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 50,
    paddingBottom: 14,
  },
  headerInnerWide: {
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 32,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 40, height: 40,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: { width: 32, height: 32 },
  appName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.2 },
  appNameNarrow: { fontSize: 15 },
  authRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnNarrow: { paddingHorizontal: 10, paddingVertical: 6 },
  btnTextNarrow: { fontSize: 12 },
  registerBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  registerBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  loginBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },

  scrollContent: { paddingBottom: 40 },
  innerContent: { paddingHorizontal: 20, paddingTop: 20, gap: 28 },
  innerContentWide: { maxWidth: 960, alignSelf: 'center', width: '100%', paddingHorizontal: 40 },

  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.primaryLighter,
  },
  notifIconBg: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  notifIconImage: { width: 30, height: 30 },
  notifBody: { flex: 1 },
  notifTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  notifApp: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  notifTime: { fontSize: 11, color: Colors.textHint },
  notifTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
  notifMsg: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  notifActions: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 },
  notifActionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  notifActionText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  notifDismiss: { fontSize: 12, color: Colors.textHint, fontWeight: '600' },
  notifClose: { padding: 2, alignSelf: 'flex-start' },

  hero: { gap: 14 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heroBadgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  heroBadgeText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 26,
    maxWidth: 420,
  },

  sectionBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: Colors.primaryBg, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  sectionBadgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  sectionBadgeText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  sectionHeading: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, lineHeight: 30, marginBottom: 6 },
  sectionSubtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: 16 },

  howSection: { gap: 12 },
  howCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  howStep: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  howStepNum: { color: '#fff', fontSize: 14, fontWeight: '800' },
  howIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  howBody: { flex: 1, gap: 3 },
  howTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  howDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

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

  sliderSection: { gap: 14 },
  sliderHeading: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  sliderWrapper: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
    position: 'relative',
  },
  slide: { height: 240 },
  slideImage: { width: '100%', height: '100%' },
  slideOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 140 },
  slideTextBox: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  slideTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 6 },
  slideCaption: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 19 },
  arrow: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(124,58,237,0.75)',
    borderRadius: 22,
    padding: 8,
    transform: [{ translateY: -18 }],
  },
  arrowLeft: { left: 12 },
  arrowRight: { right: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: Colors.primary, width: 24 },
  dotInactive: { backgroundColor: Colors.primaryLighter, width: 8 },

  testimonialCard: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  testimonialGradient: { padding: 24, gap: 16 },
  quoteIcon: { alignSelf: 'flex-start' },
  testimonialQuote: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 26,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  testimonialAvatar: { width: 44, height: 44, borderRadius: 22 },
  testimonialName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  testimonialRole: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  cta: { alignItems: 'center', gap: 16, paddingTop: 8 },
  ctaTitle: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center' },
  ctaSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  ctaBtnWrapper: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 44,
    borderRadius: 18,
  },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  ctaSecondary: { flexDirection: 'row', alignItems: 'center' },
  ctaSecondaryText: { fontSize: 14, color: Colors.textSecondary },
  ctaSecondaryLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
});
