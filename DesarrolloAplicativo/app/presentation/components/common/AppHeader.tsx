import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';

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
  showProfile = false, // en web el perfil está en la top bar
  onBack,
  onProfile,
}) => {
  // En web no mostramos este header duplicado
  if (Platform.OS === 'web') return null;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
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
          <Ionicons name="person-circle-outline" size={34} color={Colors.textPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryHeader,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
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
  backBtn: { padding: 4 },
  profileBtn: { padding: 2 },
});
