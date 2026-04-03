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
      {/* Header */}
      <View style={styles.header}>
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
          <Ionicons name="person-circle-outline" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Notificación emergente */}
        {showNotif && (
          <View style={styles.notifCard}>
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>aviso</Text>
              <Text style={styles.notifMsg}>recuerda esta palabra</Text>
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
          <Text style={styles.sliderTag}>Fomenta una sociedad más inclusiva</Text>

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
                </View>
              )}
            />
            {/* Flechas */}
            <TouchableOpacity style={[styles.arrow, styles.arrowLeft]}>
              <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.arrow, styles.arrowRight]}>
              <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
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
        <View style={styles.testimonial}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300' }}
            style={styles.testimonialImage}
          />
          <View style={styles.testimonialText}>
            <Text style={styles.testimonialQuote}>
              "él es Juan, un pequeño estudiante sordomudo el cual probó la app y dijo: La app ha
              facilitado mi comunicación con mis compañeros sordos en clase. Es increíble cómo una
              app puede cambiar tanto."
            </Text>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('Register' as never)}
          >
            <Text style={styles.ctaBtnText}>Comenzar ahora</Text>
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryHeader,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 36,
    height: 36,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 18 },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  loginBtn: { padding: 4 },
  // Notificación
  notifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    margin: 16,
    borderRadius: 12,
    padding: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: 'flex-end',
    maxWidth: 220,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  notifMsg: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  notifAction: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  notifActionText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  notifClose: { padding: 4 },
  // Slider
  sliderSection: { padding: 16 },
  sliderTag: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  sliderWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  slide: { width: width - 32, height: 200 },
  slideImage: { width: '100%', height: '100%', borderRadius: 16 },
  arrow: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 6,
    transform: [{ translateY: -16 }],
  },
  arrowLeft: { left: 8 },
  arrowRight: { right: 8 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: Colors.primary },
  dotInactive: { backgroundColor: Colors.primaryLighter },
  caption: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  // Testimonio
  testimonial: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  testimonialImage: { width: 90, height: 110, borderRadius: 12 },
  testimonialText: { flex: 1 },
  testimonialQuote: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  // CTA
  cta: { alignItems: 'center', padding: 24, gap: 12 },
  ctaBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 10,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ctaLink: { color: Colors.primary, fontSize: 14, fontWeight: '500' },
});
