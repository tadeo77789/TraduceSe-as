import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../../../constants/colors';

const TAB_LABELS: Record<string, string> = {
  Translation: 'Traducción',
  Alarms: 'Alarmas',
  Alphabet: 'Alfabeto',
  Stats: 'Estadística',
  History: 'Historial',
  Profile: '',
};

export const WebTopBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const mainRoutes = state.routes.filter(r => r.name !== 'Profile');
  const profileRoute = state.routes.find(r => r.name === 'Profile');

  const goTo = (name: string) => {
    navigation.navigate(name);
  };

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        {/* Logo */}
        <TouchableOpacity style={styles.logoRow} onPress={() => goTo('Translation')}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>👌</Text>
          </View>
          <Text style={styles.appName}>TraduceSeña</Text>
        </TouchableOpacity>

        {/* Links de navegación */}
        <View style={styles.links}>
          {mainRoutes.map(route => {
            const focused = state.routes[state.index].name === route.name;
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.link}
                onPress={() => goTo(route.name)}
              >
                <Text style={[styles.linkText, focused && styles.linkTextActive]}>
                  {TAB_LABELS[route.name] || route.name}
                </Text>
                {focused && <View style={styles.underline} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Avatar / Perfil */}
        {profileRoute && (
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => goTo('Profile')}
          >
            <View style={[
              styles.avatarCircle,
              state.routes[state.index].name === 'Profile' && styles.avatarActive,
            ]}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.primaryHeader,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLighter,
    // En web va arriba, en móvil no se usa este componente
    ...(Platform.OS === 'web' ? { position: 'relative' as any } : {}),
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    gap: 32,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 36, height: 36,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 18 },
  appName: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  links: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  link: {
    alignItems: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  linkText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  linkTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  underline: {
    position: 'absolute',
    bottom: -2,
    left: 0, right: 0,
    height: 2,
    backgroundColor: Colors.textPrimary,
    borderRadius: 1,
  },
  avatarBtn: { marginLeft: 'auto' as any },
  avatarCircle: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActive: { backgroundColor: Colors.primary },
  avatarEmoji: { fontSize: 18 },
});
