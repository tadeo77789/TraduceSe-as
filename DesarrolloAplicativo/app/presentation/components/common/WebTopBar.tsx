/**
 * @file WebTopBar.tsx
 * @description Barra de navegación superior para la versión web de la app.
 *
 * Reemplaza la barra de tabs inferior en plataformas web (`Platform.OS === 'web'`).
 * Muestra el logo, los links de navegación con ícono + etiqueta y el botón de perfil.
 * El tab activo se resalta con fondo lavanda y línea inferior púrpura.
 *
 * Recibe `BottomTabHeaderProps` de React Navigation y usa `navigation.navigate`
 * para cambiar entre tabs.
 *
 * Nota: El tab `Profile` se muestra como botón de avatar circular a la derecha,
 * no dentro de los links centrales.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { useColors } from '../../../state/ThemeContext';

const TAB_ITEMS: { name: string; label: string; icon: string; iconActive: string }[] = [
  { name: 'Translation', label: 'Traducción',  icon: 'language-outline',  iconActive: 'language'  },
  { name: 'Alarms',      label: 'Alarmas',     icon: 'alarm-outline',      iconActive: 'alarm'     },
  { name: 'Alphabet',    label: 'Alfabeto',    icon: 'hand-left-outline',  iconActive: 'hand-left' },
  { name: 'Stats',       label: 'Estadística', icon: 'bar-chart-outline',  iconActive: 'bar-chart' },
  { name: 'History',     label: 'Historial',   icon: 'time-outline',       iconActive: 'time'      },
];

export const WebTopBar: React.FC<BottomTabHeaderProps> = ({ navigation, route }) => {
  const currentTab = route.name;
  const C = useColors();

  const goTo = (name: string) => navigation.navigate(name);

  return (
    <View style={[styles.bar, { backgroundColor: C.primaryHeader, borderBottomColor: C.border }]}>
      <View style={styles.inner}>

        {/* Logo */}
        <TouchableOpacity style={styles.logoRow} onPress={() => goTo('Translation')}>
          <LinearGradient colors={['#9333EA', '#7C3AED']} style={styles.logoBox}>
            <Text style={styles.logoEmoji}>👌</Text>
          </LinearGradient>
          <Text style={[styles.appName, { color: C.textPrimary }]}>TraduceSeña</Text>
        </TouchableOpacity>

        {/* Links de navegación */}
        <View style={styles.links}>
          {TAB_ITEMS.map(tab => {
            const focused = currentTab === tab.name;
            return (
              <TouchableOpacity
                key={tab.name}
                style={[styles.link, focused && [styles.linkActive, { backgroundColor: C.primaryBg }]]}
                onPress={() => goTo(tab.name)}
              >
                <Ionicons
                  name={(focused ? tab.iconActive : tab.icon) as any}
                  size={15}
                  color={focused ? Colors.primary : C.textSecondary}
                />
                <Text style={[styles.linkText, { color: C.textSecondary }, focused && styles.linkTextActive]}>
                  {tab.label}
                </Text>
                {focused && <View style={styles.underline} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Perfil */}
        <TouchableOpacity
          style={[styles.avatarCircle, { backgroundColor: C.primaryBg }, currentTab === 'Profile' && styles.avatarActive]}
          onPress={() => goTo('Profile')}
        >
          <Ionicons
            name="person-outline"
            size={18}
            color={currentTab === 'Profile' ? '#fff' : Colors.primary}
          />
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.primaryHeader,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLighter,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 16,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 20 },
  appName: { fontSize: 19, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.2 },
  links: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2 },
  link: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 12, position: 'relative', gap: 7,
  },
  linkActive: { backgroundColor: Colors.primaryBg },
  linkText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  linkTextActive: { color: Colors.primary, fontWeight: '700' },
  underline: {
    position: 'absolute', bottom: 2, left: 14, right: 14,
    height: 2.5, backgroundColor: Colors.primary, borderRadius: 2,
  },
  avatarCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarActive: { backgroundColor: Colors.primary },
});
