import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../../constants/theme';

interface AppHeaderProps {
  showBack?: boolean;
  showProfile?: boolean;
  onBack?: () => void;
  onProfile?: () => void;
}

/**
 * Header para móvil — en web la barra de navegación es MainWebNavigator.
 * En web este componente se oculta (la nav está en el top bar del navigator).
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  showBack = false,
  showProfile = false,
  onBack,
  onProfile,
}) => {
  if (Platform.OS === 'web') return null;

  return (
    <LinearGradient
      colors={['#9333EA', '#7C3AED']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>👌</Text>
            </View>
            <Text style={styles.appName}>TraduceSeña</Text>
          </View>
        )}
      </View>

      {showProfile && (
        <TouchableOpacity style={styles.profileBtn} onPress={onProfile}>
          <Ionicons name="person-circle-outline" size={34} color="#fff" />
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing[3],
    justifyContent: 'space-between',
    ...Shadows.primary,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  logoBox: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: BorderRadius.DEFAULT,
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
  backBtn: { padding: 4 },
  profileBtn: { padding: 2 },
});
