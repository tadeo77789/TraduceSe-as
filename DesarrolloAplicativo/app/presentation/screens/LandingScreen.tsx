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
import { Colors } from '../../constants/colors';

const SLIDES = [
  {
    id: '1',
    image: require('../../assets/images/slide1.jpg'),
    title: 'Traduce en tiempo real',
    caption: 'Detecta y traduce señas al instante usando la cámara de tu dispositivo.',
  },
  {
    id: '2',
    image: require('../../assets/images/slide2.jpg'),
    title: 'Comunícate sin barreras',
    caption: 'Conecta con personas sordas usando la Lengua de Señas Colombiana.',
  },
  {
    id: '3',
    image: require('../../assets/images/slide3.jpg'),
    title: 'Aprende el alfabeto LSC',
    caption: 'Domina el alfabeto y amplía tu vocabulario paso a paso.',
  },
];

const FEATURES = [
  {
    icon: 'hand-left-outline' as const,
    label: 'Traducción',
    desc: 'Seña a texto en tiempo real',
    color: Colors.primary,
    bg: '#EDE9FE',
  },
{
    icon: 'alarm-outline' as const,
    label: 'Recordatorios',
    desc: 'Alarmas de práctica diaria',
    color: '#D97706',
    bg: '#FEF3C7',
  },
];

export const LandingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const isNarrow = width < 430;
  const sliderRef = useRef<FlatList>(null);

  const [activeSlide, setActiveSlide] = useState(0);
  const [showNotif, setShowNotif] = useState(true);

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
    <View style={styles.root}>

      {/* ── Header ───────────────────────────────────────────── */}
      <LinearGradient
        colors={['#9333EA', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={[styles.headerInner, isWide && styles.headerInnerWide]}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>👌</Text>
            </View>
            <Text style={[styles.appName, isNarrow && styles.appNameNarrow]}>TraduceSeña</Text>
          </View>

          {/* Acciones de auth */}
          <View style={styles.authRow}>
            <TouchableOpacity
              style={[styles.registerBtn, isNarrow && styles.btnNarrow]}
              onPress={() => navigation.navigate('Register' as never)}
            >
              <Text style={[styles.registerBtnText, isNarrow && styles.btnTextNarrow]}>Registrarse</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.loginBtn, isNarrow && styles.btnNarrow]}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <Ionicons name="log-in-outline" size={isNarrow ? 16 : 18} color={Colors.primary} />
              <Text style={[styles.loginBtnText, isNarrow && styles.btnTextNarrow]}>Ingresar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.innerContent, isWide && styles.innerContentWide]}>

          {/* ── Notificación push ────────────────────────────── */}
          {showNotif && (
            <View style={styles.notifCard}>
              <LinearGradient colors={['#9333EA', '#7C3AED']} style={styles.notifIconBg}>
                <Text style={{ fontSize: 16 }}>👌</Text>
              </LinearGradient>
              <View style={styles.notifBody}>
                <View style={styles.notifTopRow}>
                  <Text style={styles.notifApp}>TraduceSeña</Text>
                  <Text style={styles.notifTime}>Ahora</Text>
                </View>
                <Text style={styles.notifTitle}>¡Practica hoy tu seña diaria!</Text>
                <Text style={styles.notifMsg}>Abre la app y traduce al menos una seña nueva hoy.</Text>
                <View style={styles.notifActions}>
                  <TouchableOpacity
                    style={styles.notifActionBtn}
                    onPress={() => navigation.navigate('Login' as never)}
                  >
                    <Text style={styles.notifActionText}>Abrir app</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowNotif(false)}>
                    <Text style={styles.notifDismiss}>Descartar</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowNotif(false)} style={styles.notifClose}>
                <Ionicons name="close" size={16} color={Colors.textHint} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Hero text ────────────────────────────────────── */}
          <View style={styles.hero}>
            <View style={styles.heroBadge}>
              <View style={styles.heroBadgeDot} />
              <Text style={styles.heroBadgeText}>Lengua de Señas Colombiana</Text>
            </View>
            <Text style={styles.heroTitle}>
              Comunícate sin{'\n'}barreras
            </Text>
            <Text style={styles.heroSubtitle}>
              Traduce señas a texto en tiempo real y aprende LSC con una app diseñada para la inclusión.
            </Text>
          </View>

          {/* ── Feature cards ────────────────────────────────── */}
          <View style={[styles.featuresRow, isWide && styles.featuresRowWide]}>
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
          <View style={styles.sliderSection}>
            <Text style={styles.sliderHeading}>¿Por qué TraduceSeña?</Text>

            <View style={styles.sliderWrapper}>
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
                  <View style={[styles.slide, { width: SLIDE_WIDTH }]}>
                    <Image
                      source={item.image}
                      style={styles.slideImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.65)']}
                      style={styles.slideOverlay}
                    />
                    <View style={styles.slideTextBox}>
                      <Text style={styles.slideTitle}>{item.title}</Text>
                      <Text style={styles.slideCaption}>{item.caption}</Text>
                    </View>
                  </View>
                )}
              />

              {/* Flechas */}
              <TouchableOpacity
                style={[styles.arrow, styles.arrowLeft]}
                onPress={() => goToSlide('prev')}
              >
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.arrow, styles.arrowRight]}
                onPress={() => goToSlide('next')}
              >
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Dots */}
            <View style={styles.dots}>
              {SLIDES.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    sliderRef.current?.scrollToIndex({ index: i, animated: true });
                    setActiveSlide(i);
                  }}
                >
                  <View style={[styles.dot, i === activeSlide ? styles.dotActive : styles.dotInactive]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Testimonio ───────────────────────────────────── */}
          <View style={styles.testimonialCard}>
            <LinearGradient colors={['#EDE9FE', '#F5F3FF']} style={styles.testimonialGradient}>
              <Ionicons name="chatbubble-ellipses" size={28} color={Colors.primaryLighter} style={styles.quoteIcon} />
              <Text style={styles.testimonialQuote}>
                "La app ha facilitado mi comunicación con mis compañeros en clase. Es increíble cómo
                una app puede cambiar tanto la vida de una persona."
              </Text>
              <View style={styles.testimonialAuthor}>
                <Image
                  source={require('../../assets/images/testimonial.jpg')}
                  style={styles.testimonialAvatar}
                />
                <View>
                  <Text style={styles.testimonialName}>Juan Pérez</Text>
                  <Text style={styles.testimonialRole}>Estudiante universitario</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* ── CTA final ────────────────────────────────────── */}
          <View style={styles.cta}>
            <Text style={styles.ctaTitle}>¿Listo para comenzar?</Text>
            <Text style={styles.ctaSubtitle}>Únete y rompe las barreras de la comunicación</Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register' as never)}
              activeOpacity={0.85}
              style={styles.ctaBtnWrapper}
            >
              <LinearGradient
                colors={['#9333EA', '#7C3AED', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaBtn}
              >
                <Text style={styles.ctaBtnText}>Crear cuenta gratis</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ctaSecondary}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <Text style={styles.ctaSecondaryText}>Ya tengo cuenta — </Text>
              <Text style={styles.ctaSecondaryLink}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray },

  // ── Header ──
  header: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  logoEmoji: { fontSize: 20 },
  appName: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  appNameNarrow: { fontSize: 15 },
  authRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnNarrow: { paddingHorizontal: 10, paddingVertical: 6 },
  btnTextNarrow: { fontSize: 12 },
  registerBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  registerBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
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

  // ── Scroll ──
  scrollContent: { paddingBottom: 40 },
  innerContent: { paddingHorizontal: 20, paddingTop: 20, gap: 28 },
  innerContentWide: { maxWidth: 960, alignSelf: 'center', width: '100%', paddingHorizontal: 40 },

  // ── Notificación ──
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
  },
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

  // ── Hero ──
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

  // ── Features ──
  featuresRow: { flexDirection: 'row', gap: 12 },
  featuresRowWide: { gap: 16 },
  featureCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconBox: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  featureLabel: { fontSize: 13, fontWeight: '800' },
  featureDesc: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16 },

  // ── Slider ──
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

  // ── Testimonio ──
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

  // ── CTA ──
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
