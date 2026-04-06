import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600',
    caption: '¡Rompe las barreras de la comunicación! Prueba la traducción de lengua de señas.',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1609429019995-8c40f49535a5?w=600',
    caption: 'Comunícate con facilidad usando la lengua de señas colombiana.',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1576267423048-15c0040fec78?w=600',
    caption: 'Aprende el alfabeto y expande tu vocabulario en LSC.',
  },
];

export const LandingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [showNotif, setShowNotif] = useState(true);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveSlide(index);
  };

  return (
    <View style={styles.container}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={['#9333EA', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>👌</Text>
          </View>
          <Text style={styles.appName}>TraduceSeña</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login' as never)}
          style={styles.loginBtn}
        >
          <Ionicons name="person-circle-outline" size={32} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Notificación emergente */}
        {showNotif && (
          <View style={styles.notifCard}>
            <View style={styles.notifAccent} />
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>Aviso</Text>
              <Text style={styles.notifMsg}>Recuerda esta palabra</Text>
              <TouchableOpacity style={styles.notifAction}>
                <Text style={styles.notifActionText}>Abrir</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setShowNotif(false)} style={styles.notifClose}>
              <Ionicons name="close" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Slider de imágenes */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderTagRow}>
            <View style={styles.sliderTagDot} />
            <Text style={styles.sliderTag}>Fomenta una sociedad más inclusiva</Text>
          </View>

          <View style={styles.sliderWrapper}>
            <FlatList
              data={SLIDES}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.slide}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.slideImage}
                    resizeMode="cover"
                  />
                  {/* Overlay gradient en imagen */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.35)']}
                    style={styles.slideOverlay}
                  />
                </View>
              )}
            />
            {/* Flechas */}
            <TouchableOpacity style={[styles.arrow, styles.arrowLeft]}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.arrow, styles.arrowRight]}>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Dots */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeSlide ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>

          <Text style={styles.caption}>
            Fomenta una sociedad más inclusiva, apoyando la educación, la salud y la vida laboral.
          </Text>
        </View>

        {/* Testimonio */}
        <View style={styles.testimonialCard}>
          <View style={styles.testimonialInner}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300' }}
              style={styles.testimonialImage}
            />
            <View style={styles.testimonialText}>
              <Ionicons name="chatbubble-ellipses" size={18} color={Colors.primaryLighter} style={{ marginBottom: 6 }} />
              <Text style={styles.testimonialQuote}>
                "La app ha facilitado mi comunicación con mis compañeros en clase. Es increíble cómo
                una app puede cambiar tanto."
              </Text>
              <Text style={styles.testimonialName}>— Juan, estudiante</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register' as never)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#9333EA', '#7C3AED', '#6D28D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaBtn}
            >
              <Text style={styles.ctaBtnText}>Comenzar ahora</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.ctaLink}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingTop: 50,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoEmoji: { fontSize: 20 },
  appName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  loginBtn: { padding: 4 },
  // Notificación
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignSelf: 'flex-end',
    maxWidth: 230,
    overflow: 'hidden',
  },
  notifAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  notifContent: { flex: 1, paddingLeft: 8 },
  notifTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  notifMsg: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  notifAction: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  notifActionText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  notifClose: { padding: 4 },
  // Slider
  sliderSection: { padding: 16, paddingTop: 12 },
  sliderTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sliderTagDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  sliderTag: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sliderWrapper: {
    position: 'relative',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  slide: { width: width - 32, height: 210 },
  slideImage: { width: '100%', height: '100%' },
  slideOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(124,58,237,0.7)',
    borderRadius: 20,
    padding: 7,
    transform: [{ translateY: -17 }],
  },
  arrowLeft: { left: 10 },
  arrowRight: { right: 10 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: Colors.primary, width: 22 },
  dotInactive: { backgroundColor: Colors.primaryLighter },
  caption: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  // Testimonio
  testimonialCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  testimonialInner: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  testimonialImage: { width: 86, height: 110, borderRadius: 14 },
  testimonialText: { flex: 1 },
  testimonialQuote: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  testimonialName: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  // CTA
  cta: { alignItems: 'center', padding: 28, gap: 16 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 44,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  ctaLink: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
