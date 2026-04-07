import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';

const TAB_ITEMS: { name: string; label: string; icon: string; iconActive: string }[] = [
  { name: 'Translation', label: 'Traducción',  icon: 'language-outline',  iconActive: 'language'  },
  { name: 'Alarms',      label: 'Alarmas',     icon: 'alarm-outline',      iconActive: 'alarm'     },
  { name: 'Alphabet',    label: 'Alfabeto',    icon: 'hand-left-outline',  iconActive: 'hand-left' },
  { name: 'Stats',       label: 'Estadística', icon: 'bar-chart-outline',  iconActive: 'bar-chart' },
  { name: 'History',     label: 'Historial',   icon: 'time-outline',       iconActive: 'time'      },
];

export const WebTopBar: React.FC<BottomTabHeaderProps> = ({ navigation, route }) => {
  const currentTab = route.name;

  const goTo = (name: string) => navigation.navigate(name);

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>

        {/* Logo */}
        <TouchableOpacity style={styles.logoRow} onPress={() => goTo('Translation')}>
          <LinearGradient colors={['#9333EA', '#7C3AED']} style={styles.logoBox}>
            <Text style={styles.logoEmoji}>👌</Text>
          </LinearGradient>
          <Text style={styles.appName}>TraduceSeña</Text>
        </TouchableOpacity>

        {/* Links de navegación */}
        <View style={styles.links}>
          {TAB_ITEMS.map(tab => {
            const focused = currentTab === tab.name;
            return (
              <TouchableOpacity
                key={tab.name}
                style={[styles.link, focused && styles.linkActive]}
                onPress={() => goTo(tab.name)}
              >
                <Ionicons
                  name={(focused ? tab.iconActive : tab.icon) as any}
                  size={15}
                  color={focused ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[styles.linkText, focused && styles.linkTextActive]}>
                  {tab.label}
                </Text>
                {focused && <View style={styles.underline} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Perfil */}
        <TouchableOpacity
          style={[styles.avatarCircle, currentTab === 'Profile' && styles.avatarActive]}
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 32,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 18 },
  appName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.3 },
  links: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  link: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, position: 'relative', gap: 6,
  },
  linkActive: { backgroundColor: Colors.primaryBg },
  linkText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  linkTextActive: { color: Colors.primary, fontWeight: '700' },
  underline: {
    position: 'absolute', bottom: 0, left: 14, right: 14,
    height: 2, backgroundColor: Colors.primary, borderRadius: 1,
  },
  avatarCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarActive: { backgroundColor: Colors.primary },
});
